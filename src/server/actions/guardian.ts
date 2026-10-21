"use server";

import { revalidatePath } from "next/cache";
import { requireRole, requireUser } from "@/server/services/authService";
import {
  createGuardianInvitationSchema,
  redeemGuardianInvitationSchema,
  revokeGuardianRelationshipSchema,
  updateGuardianPermissionsSchema,
} from "@/lib/validation/guardian";
import {
  createGuardianInvitation,
  redeemGuardianInvitation,
  revokeGuardianRelationship,
} from "@/server/services/guardianService";
import { createClient } from "@/lib/supabase/server";

export async function createGuardianInvitationAction(formData: FormData) {
  try {
    const adminUser = await requireRole(["admin"]);

    const rawInput = {
      studentId: formData.get("studentId"),
      intendedGuardianEmail: formData.get("intendedGuardianEmail"),
      relationshipType: formData.get("relationshipType"),
      canViewAttendance: formData.get("canViewAttendance") === "true",
      canViewProgress: formData.get("canViewProgress") === "true",
      canViewSchedule: formData.get("canViewSchedule") === "true",
      canViewFees: formData.get("canViewFees") === "true",
      canReceiveNotifications: formData.get("canReceiveNotifications") === "true",
    };

    const parsed = createGuardianInvitationSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid invitation payload",
      };
    }

    const result = await createGuardianInvitation({
      studentId: parsed.data.studentId,
      intendedGuardianEmail: parsed.data.intendedGuardianEmail,
      relationshipType: parsed.data.relationshipType,
      createdByProfileId: adminUser.userId,
      permissions: {
        canViewAttendance: parsed.data.canViewAttendance,
        canViewProgress: parsed.data.canViewProgress,
        canViewSchedule: parsed.data.canViewSchedule,
        canViewFees: parsed.data.canViewFees,
        canReceiveNotifications: parsed.data.canReceiveNotifications,
      },
    });

    revalidatePath("/admin/guardians");

    return {
      success: true,
      invitationUrl: result.invitationUrl,
      rawToken: result.rawToken,
      expiresAt: result.expiresAt,
      intendedGuardianEmail: result.intendedGuardianEmail,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create invitation";
    return { success: false, error: msg };
  }
}

export async function redeemGuardianInvitationAction(token: string) {
  try {
    const user = await requireUser();

    if (user.profile.role !== "parent" && user.profile.role !== "admin") {
      return {
        success: false,
        error: "Only accounts registered as a Parent or Legal Guardian can redeem student link invitations.",
      };
    }

    const parsed = redeemGuardianInvitationSchema.safeParse({ token });
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid token format",
      };
    }

    const result = await redeemGuardianInvitation({
      rawToken: parsed.data.token,
      guardianProfileId: user.userId,
      guardianEmail: user.email,
    });

    if (!result.success) {
      return { success: false, error: result.error || "Failed to redeem invitation" };
    }

    revalidatePath("/parent");
    revalidatePath("/admin/guardians");

    return {
      success: true,
      relationshipId: result.relationshipId,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process invitation redemption";
    return { success: false, error: msg };
  }
}

export async function revokeGuardianRelationshipAction(formData: FormData) {
  try {
    const adminUser = await requireRole(["admin"]);

    const rawInput = {
      relationshipId: formData.get("relationshipId"),
      revocationReason: formData.get("revocationReason"),
    };

    const parsed = revokeGuardianRelationshipSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid revocation payload",
      };
    }

    const result = await revokeGuardianRelationship(
      parsed.data.relationshipId,
      adminUser.userId,
      parsed.data.revocationReason
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/admin/guardians");
    revalidatePath("/parent");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to revoke relationship";
    return { success: false, error: msg };
  }
}

export async function updateGuardianPermissionsAction(formData: FormData) {
  try {
    const adminUser = await requireRole(["admin"]);

    const rawInput = {
      relationshipId: formData.get("relationshipId"),
      canViewAttendance: formData.get("canViewAttendance") === "true",
      canViewProgress: formData.get("canViewProgress") === "true",
      canViewSchedule: formData.get("canViewSchedule") === "true",
      canViewFees: formData.get("canViewFees") === "true",
      canReceiveNotifications: formData.get("canReceiveNotifications") === "true",
    };

    const parsed = updateGuardianPermissionsSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid permissions payload",
      };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("guardian_student_relationships")
      .update({
        can_view_attendance: parsed.data.canViewAttendance,
        can_view_progress: parsed.data.canViewProgress,
        can_view_schedule: parsed.data.canViewSchedule,
        can_view_fees: parsed.data.canViewFees,
        can_receive_notifications: parsed.data.canReceiveNotifications,
        updated_at: new Date().toISOString(),
      })
      .eq("id", parsed.data.relationshipId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: adminUser.userId,
      action: "update_guardian_permissions",
      entity_type: "guardian_student_relationship",
      entity_id: parsed.data.relationshipId,
      details: {
        permissions: parsed.data,
      },
    });

    revalidatePath("/admin/guardians");
    revalidatePath("/parent");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update permissions";
    return { success: false, error: msg };
  }
}
