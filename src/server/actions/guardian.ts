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
import { GuardianRelationshipType } from "@/types";

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

export interface GuardianActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  status?: string;
}

export async function requestStudentLinkAction(
  prevState: GuardianActionResult | null,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const user = await requireUser();
    if (user.profile.role !== "parent" && user.profile.role !== "admin") {
      return {
        success: false,
        message: "Only registered parent accounts can submit student connection requests.",
      };
    }

    const rawInput = {
      studentCode: formData.get("studentCode")?.toString() || "",
      relationshipType: formData.get("relationshipType")?.toString() || "parent",
    };

    const { requestStudentLinkSchema } = await import("@/lib/validation/guardian");
    const parsed = requestStudentLinkSchema.safeParse(rawInput);
    if (!parsed.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path[0]?.toString() || "form";
        if (!errors[path]) errors[path] = [];
        errors[path].push(issue.message);
      }
      return { success: false, message: "Please check the entered student code.", errors };
    }

    const { requestStudentLinkByCode } = await import("@/server/services/guardianService");
    const result = await requestStudentLinkByCode(
      user.userId,
      user.email,
      parsed.data.studentCode,
      parsed.data.relationshipType as GuardianRelationshipType
    );

    if (result.success) {
      revalidatePath("/parent");
      revalidatePath("/parent/attendance");
      revalidatePath("/parent/progress");
      revalidatePath("/parent/billing");
      revalidatePath("/parent/schedule");
      revalidatePath("/admin/guardians");
    }

    return {
      success: result.success,
      message: result.message,
      status: result.status,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "An error occurred submitting the link request.";
    return { success: false, message: msg };
  }
}

export async function adminApproveRelationshipAction(
  prevState: GuardianActionResult | null,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const admin = await requireRole(["admin"]);

    const rawInput = {
      relationshipId: formData.get("relationshipId")?.toString() || "",
      canViewAttendance: formData.get("canViewAttendance") === "true",
      canViewProgress: formData.get("canViewProgress") === "true",
      canViewSchedule: formData.get("canViewSchedule") === "true",
      canViewFees: formData.get("canViewFees") === "true",
      canReceiveNotifications: formData.get("canReceiveNotifications") === "true",
      verificationMethod: formData.get("verificationMethod")?.toString() || "admin_verified_code_request",
    };

    const { adminApproveRelationshipSchema } = await import("@/lib/validation/guardian");
    const parsed = adminApproveRelationshipSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Invalid approval payload." };
    }

    const { adminApproveGuardianRelationship } = await import("@/server/services/guardianService");
    const result = await adminApproveGuardianRelationship(
      parsed.data.relationshipId,
      admin.userId,
      {
        canViewAttendance: parsed.data.canViewAttendance,
        canViewProgress: parsed.data.canViewProgress,
        canViewSchedule: parsed.data.canViewSchedule,
        canViewFees: parsed.data.canViewFees,
        canReceiveNotifications: parsed.data.canReceiveNotifications,
      },
      parsed.data.verificationMethod
    );

    if (result.success) {
      revalidatePath("/admin/guardians");
      revalidatePath("/parent");
      revalidatePath("/parent/attendance");
      revalidatePath("/parent/progress");
      revalidatePath("/parent/billing");
      revalidatePath("/parent/schedule");
    }

    return {
      success: result.success,
      message: result.message,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to approve guardian relationship";
    return { success: false, message: msg };
  }
}

export async function adminRejectRelationshipAction(
  prevState: GuardianActionResult | null,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const admin = await requireRole(["admin"]);

    const rawInput = {
      relationshipId: formData.get("relationshipId")?.toString() || "",
      rejectionReason: formData.get("rejectionReason")?.toString() || "",
    };

    const { adminRejectRelationshipSchema } = await import("@/lib/validation/guardian");
    const parsed = adminRejectRelationshipSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Rejection reason required." };
    }

    const { adminRejectGuardianRelationship } = await import("@/server/services/guardianService");
    const result = await adminRejectGuardianRelationship(
      parsed.data.relationshipId,
      admin.userId,
      parsed.data.rejectionReason
    );

    if (result.success) {
      revalidatePath("/admin/guardians");
      revalidatePath("/parent");
      revalidatePath("/parent/attendance");
      revalidatePath("/parent/progress");
      revalidatePath("/parent/billing");
      revalidatePath("/parent/schedule");
    }

    return {
      success: result.success,
      message: result.message,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reject relationship";
    return { success: false, message: msg };
  }
}

export async function adminDirectConnectAction(
  prevState: GuardianActionResult | null,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const admin = await requireRole(["admin"]);

    const rawInput = {
      guardianEmail: formData.get("guardianEmail")?.toString() || "",
      studentCode: formData.get("studentCode")?.toString() || "",
      relationshipType: formData.get("relationshipType")?.toString() || "parent",
      canViewAttendance: formData.get("canViewAttendance") === "true",
      canViewProgress: formData.get("canViewProgress") === "true",
      canViewSchedule: formData.get("canViewSchedule") === "true",
      canViewFees: formData.get("canViewFees") === "true",
      canReceiveNotifications: formData.get("canReceiveNotifications") === "true",
      verificationMethod: formData.get("verificationMethod")?.toString() || "admin_assisted_connection",
    };

    const { adminDirectConnectSchema } = await import("@/lib/validation/guardian");
    const parsed = adminDirectConnectSchema.safeParse(rawInput);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Invalid connection details." };
    }

    const { adminCreateDirectGuardianRelationship } = await import("@/server/services/guardianService");
    const result = await adminCreateDirectGuardianRelationship(
      parsed.data.guardianEmail,
      parsed.data.studentCode,
      parsed.data.relationshipType as GuardianRelationshipType,
      {
        canViewAttendance: parsed.data.canViewAttendance,
        canViewProgress: parsed.data.canViewProgress,
        canViewSchedule: parsed.data.canViewSchedule,
        canViewFees: parsed.data.canViewFees,
        canReceiveNotifications: parsed.data.canReceiveNotifications,
      },
      admin.userId,
      parsed.data.verificationMethod
    );

    if (result.success) {
      revalidatePath("/admin/guardians");
      revalidatePath("/parent");
    }

    return {
      success: result.success,
      message: result.message,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to connect parent and student";
    return { success: false, message: msg };
  }
}

export async function submitGuardianInquiryAction(
  prevState: GuardianActionResult | null,
  formData: FormData
): Promise<GuardianActionResult> {
  try {
    const user = await requireUser();
    if (user.profile.role !== "parent" && user.profile.role !== "admin") {
      return {
        success: false,
        message: "Only authorized guardian or administrator accounts can submit support requests.",
      };
    }

    const studentId = formData.get("studentId")?.toString().trim();
    const studentCode = formData.get("studentCode")?.toString().trim();
    const inquiryType = formData.get("inquiryType")?.toString().trim() || "general_support";
    const subject = formData.get("subject")?.toString().trim() || "Guardian Support Request";
    const leaveDate = formData.get("leaveDate")?.toString().trim();
    const reason = formData.get("reason")?.toString().trim();
    const notes = formData.get("notes")?.toString().trim() || formData.get("message")?.toString().trim() || "";

    if (!notes && !reason) {
      return {
        success: false,
        message: "Please provide a reason or description for your request.",
      };
    }

    // If request relates to a specific student, verify the relationship is active
    if (studentId) {
      const { verifyGuardianStudentAccess } = await import("@/server/services/guardianService");
      // Check that this guardian has an active relationship with this student
      const { getActiveChildrenForGuardian } = await import("@/server/services/guardianService");
      const activeChildren = await getActiveChildrenForGuardian(user.userId);
      const isAuthorized = activeChildren.some((c) => c.student_id === studentId);
      if (!isAuthorized && user.profile.role !== "admin") {
        return {
          success: false,
          message: "You are not authorized to submit requests on behalf of this student.",
        };
      }
    }

    const formattedSubject = studentCode
      ? `[${inquiryType.toUpperCase().replace("_", " ")}] Student ${studentCode}: ${subject}`
      : `[${inquiryType.toUpperCase().replace("_", " ")}] ${subject}`;

    const formattedMessage = [
      `Guardian: ${user.profile.full_name} (${user.email})`,
      studentCode ? `Student Code: ${studentCode}` : null,
      studentId ? `Student ID: ${studentId}` : null,
      leaveDate ? `Effective Date: ${leaveDate}` : null,
      reason ? `Reason / Topic: ${reason}` : null,
      `Notes: ${notes}`,
    ]
      .filter(Boolean)
      .join("\n");

    const supabase = await createClient();
    const { error: insertError } = await supabase.from("contact_enquiries").insert({
      full_name: user.profile.full_name,
      email: user.email,
      subject: formattedSubject,
      message: formattedMessage,
      status: "unread",
    });

    if (insertError) {
      console.warn("[Guardian Inquiry DB fallback]", insertError.message);
      const { IN_MEMORY_INQUIRIES } = await import("@/server/services/guardianService");
      IN_MEMORY_INQUIRIES.unshift({
        id: `inq-${Date.now()}`,
        email: user.email,
        full_name: user.profile.full_name,
        subject: formattedSubject,
        message: formattedMessage,
        status: "unread",
        created_at: new Date().toISOString(),
      });
    }

    await supabase.from("audit_logs").insert({
      actor_id: user.userId,
      action: "GUARDIAN_SUPPORT_REQUEST_SUBMITTED",
      entity_type: "contact_enquiries",
      details: {
        inquiry_type: inquiryType,
        student_id: studentId || null,
        student_code: studentCode || null,
        subject: formattedSubject,
      },
    });

    revalidatePath("/parent/support");
    revalidatePath("/parent/attendance");

    return {
      success: true,
      message: "Your inquiry has been submitted to the academy administration. A student success advisor will follow up shortly.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit request.";
    return { success: false, message: msg };
  }
}

export async function markNotificationReadAction(notificationId: string): Promise<{ success: boolean }> {
  try {
    const user = await requireUser();
    const { markNotificationAsRead } = await import("@/server/services/guardianService");
    await markNotificationAsRead(notificationId, user.userId);
    revalidatePath("/parent/notifications");
    revalidatePath("/parent");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function initiateTuitionPaymentAction(
  studentId: string,
  amountInCents: number,
  courseId: string
): Promise<{ success: boolean; configured: boolean; error?: string; orderId?: string; clientSecret?: string }> {
  try {
    const user = await requireUser();
    const { verifyGuardianStudentAccess } = await import("@/server/services/guardianService");
    const isPermitted = await verifyGuardianStudentAccess(user.userId, studentId, "fees");
    if (!isPermitted && user.profile.role !== "admin") {
      return {
        success: false,
        configured: false,
        error: "Your guardian authorization does not permit accessing financial or tuition transactions for this student.",
      };
    }

    const { isPaymentConfigured, createPaymentOrder } = await import("@/server/integrations/payments/paymentAdapter");
    if (!isPaymentConfigured()) {
      return {
        success: false,
        configured: false,
        error: "Payment gateway credentials (STRIPE_SECRET_KEY / RAZORPAY_KEY_SECRET) are not currently configured in the environment. Live card checkout cannot be completed online. Please contact billing@syntaxora.com or arrange an offline bank transfer.",
      };
    }

    const orderRes = await createPaymentOrder({
      studentId,
      courseId,
      amountInCents,
      currency: "USD",
      payerEmail: user.email,
    });

    if (orderRes.error) {
      return {
        success: false,
        configured: true,
        error: orderRes.error,
      };
    }

    return {
      success: true,
      configured: true,
      orderId: orderRes.orderId,
      clientSecret: orderRes.clientSecret,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to initiate payment transaction.";
    return { success: false, configured: false, error: msg };
  }
}


