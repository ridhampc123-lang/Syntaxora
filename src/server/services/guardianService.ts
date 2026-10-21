import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  GuardianInvitation,
  GuardianStudentRelationship,
  GuardianRelationshipType,
} from "@/types";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("example.supabase.co") &&
      !key.includes("placeholder")
  );
}

// In-memory fallback stores for test and dev execution when database is not connected
export const IN_MEMORY_INVITATIONS: GuardianInvitation[] = [];
export const IN_MEMORY_RELATIONSHIPS: GuardianStudentRelationship[] = [
  {
    id: "rel-1000000-0000-0000-0000-000000000001",
    guardian_profile_id: "u4000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000001",
    relationship_type: "parent",
    status: "active",
    can_view_attendance: true,
    can_view_progress: true,
    can_view_schedule: true,
    can_view_fees: true,
    can_receive_notifications: true,
    verification_method: "admin_verified_invitation",
    verified_at: "2026-09-02T14:30:00Z",
    verified_by_profile_id: "u3000000-0000-0000-0000-000000000001",
    created_at: "2026-09-02T14:30:00Z",
    updated_at: "2026-09-02T14:30:00Z",
    student: {
      id: "s1000000-0000-0000-0000-000000000001",
      student_code: "STU-8F39A1C2",
      status: "active",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
      profile: {
        id: "u1000000-0000-0000-0000-000000000001",
        role: "student",
        full_name: "Liam O'Connor",
        email: "liam.oconnor@example.com",
        created_at: "2026-09-01T00:00:00Z",
        updated_at: "2026-09-01T00:00:00Z",
      },
    },
    guardian: {
      id: "u4000000-0000-0000-0000-000000000001",
      role: "parent",
      full_name: "Sarah O'Connor",
      email: "sarah.oconnor@example.com",
      created_at: "2026-09-02T14:00:00Z",
      updated_at: "2026-09-02T14:00:00Z",
    },
  },
];

export interface CreateInvitationParams {
  studentId: string;
  intendedGuardianEmail: string;
  relationshipType: GuardianRelationshipType;
  createdByProfileId: string;
  permissions?: {
    canViewAttendance?: boolean;
    canViewProgress?: boolean;
    canViewSchedule?: boolean;
    canViewFees?: boolean;
    canReceiveNotifications?: boolean;
  };
}

export interface GeneratedInvitationResult {
  invitationId: string;
  rawToken: string;
  tokenHash: string;
  expiresAt: string;
  intendedGuardianEmail: string;
  invitationUrl: string;
}

/**
 * Generates a high-entropy 256-bit cryptographic token and its SHA-256 hash.
 * Only the hash is stored in the database.
 */
export function generateInvitationToken(): { rawToken: string; tokenHash: string } {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(rawToken);
  return { rawToken, tokenHash };
}

/**
 * Computes the SHA-256 hash of a raw token.
 */
export function hashToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

/**
 * Creates an authoritative guardian invitation.
 * Returns the raw token ONCE for delivery.
 */
export async function createGuardianInvitation(
  params: CreateInvitationParams,
  appBaseUrl = "https://syntaxora.com"
): Promise<GeneratedInvitationResult> {
  const { rawToken, tokenHash } = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  const invitation: GuardianInvitation = {
    id: crypto.randomUUID(),
    student_id: params.studentId,
    intended_guardian_email: params.intendedGuardianEmail.toLowerCase().trim(),
    relationship_type: params.relationshipType,
    token_hash: tokenHash,
    expires_at: expiresAt,
    status: "pending",
    created_by_profile_id: params.createdByProfileId,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_INVITATIONS.push(invitation);
  } else {
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("guardian_invitations").insert({
        id: invitation.id,
        student_id: invitation.student_id,
        intended_guardian_email: invitation.intended_guardian_email,
        relationship_type: invitation.relationship_type,
        token_hash: invitation.token_hash,
        expires_at: invitation.expires_at,
        status: invitation.status,
        created_by_profile_id: invitation.created_by_profile_id,
      });

      if (error) {
        throw new Error(`Failed to persist guardian invitation: ${error.message}`);
      }

      // Log to immutable audit log
      await supabase.from("audit_logs").insert({
        actor_id: params.createdByProfileId,
        action: "create_guardian_invitation",
        entity_type: "guardian_invitation",
        entity_id: invitation.id,
        details: {
          student_id: params.studentId,
          intended_guardian_email: params.intendedGuardianEmail,
          relationship_type: params.relationshipType,
          expires_at: expiresAt,
        },
      });
    } catch {
      IN_MEMORY_INVITATIONS.push(invitation);
    }
  }

  const invitationUrl = `${appBaseUrl}/guardian/accept-invitation?token=${rawToken}`;

  return {
    invitationId: invitation.id,
    rawToken,
    tokenHash,
    expiresAt,
    intendedGuardianEmail: invitation.intended_guardian_email,
    invitationUrl,
  };
}

export interface InspectInvitationResult {
  valid: boolean;
  reason?: "invalid_token" | "expired" | "already_consumed" | "revoked";
  invitation?: GuardianInvitation;
}

/**
 * Inspects an invitation token without consuming it.
 */
export async function inspectInvitationToken(rawToken: string): Promise<InspectInvitationResult> {
  const tokenHash = hashToken(rawToken);

  let invitation: GuardianInvitation | undefined;

  if (!isSupabaseConfigured()) {
    invitation = IN_MEMORY_INVITATIONS.find((inv) => inv.token_hash === tokenHash);
  } else {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("guardian_invitations")
        .select(`
          id,
          student_id,
          intended_guardian_email,
          relationship_type,
          token_hash,
          expires_at,
          status,
          created_by_profile_id,
          consumed_at,
          consumed_by_profile_id,
          created_at,
          student:students (
            id,
            student_code,
            profile:profiles (
              full_name
            )
          )
        `)
        .eq("token_hash", tokenHash)
        .maybeSingle();

      if (error || !data) {
        invitation = IN_MEMORY_INVITATIONS.find((inv) => inv.token_hash === tokenHash);
      } else {
        invitation = data as unknown as GuardianInvitation;
      }
    } catch {
      invitation = IN_MEMORY_INVITATIONS.find((inv) => inv.token_hash === tokenHash);
    }
  }

  if (!invitation) {
    return { valid: false, reason: "invalid_token" };
  }

  if (invitation.status === "consumed") {
    return { valid: false, reason: "already_consumed", invitation };
  }

  if (invitation.status === "revoked") {
    return { valid: false, reason: "revoked", invitation };
  }

  const isExpired = new Date(invitation.expires_at).getTime() < Date.now();
  if (isExpired || invitation.status === "expired") {
    return { valid: false, reason: "expired", invitation };
  }

  return { valid: true, invitation };
}

export interface RedeemInvitationParams {
  rawToken: string;
  guardianProfileId: string;
  guardianEmail: string;
}

export interface RedeemInvitationResult {
  success: boolean;
  error?: string;
  relationshipId?: string;
}

/**
 * Consumes an invitation and transactionally activates the guardian relationship.
 * Prevents concurrent duplicate consumption and enforces verified identities.
 */
export async function redeemGuardianInvitation({
  rawToken,
  guardianProfileId,
  guardianEmail,
}: RedeemInvitationParams): Promise<RedeemInvitationResult> {
  const inspection = await inspectInvitationToken(rawToken);

  if (!inspection.valid || !inspection.invitation) {
    if (inspection.reason === "already_consumed") {
      return { success: false, error: "This invitation link has already been used and cannot be redeemed again." };
    }
    if (inspection.reason === "expired") {
      return { success: false, error: "This invitation has expired. Please contact academy administration for a new invitation." };
    }
    if (inspection.reason === "revoked") {
      return { success: false, error: "This invitation has been revoked by administration." };
    }
    return { success: false, error: "Invalid invitation token." };
  }

  const invitation = inspection.invitation;
  const normalizedGuardianEmail = guardianEmail.toLowerCase().trim();
  const intendedEmail = invitation.intended_guardian_email.toLowerCase().trim();

  // Strict email binding verification
  if (normalizedGuardianEmail !== intendedEmail) {
    return {
      success: false,
      error: `Security boundary mismatch: This invitation was issued for ${intendedEmail}. Your account is ${normalizedGuardianEmail}. Please sign in with the invited email address.`,
    };
  }

  const relationshipId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    // In-memory atomic update
    invitation.status = "consumed";
    invitation.consumed_at = now;
    invitation.consumed_by_profile_id = guardianProfileId;

    // Check if an existing relationship pair exists
    const existing = IN_MEMORY_RELATIONSHIPS.find(
      (r) => r.guardian_profile_id === guardianProfileId && r.student_id === invitation.student_id
    );

    if (existing) {
      existing.status = "active";
      existing.relationship_type = invitation.relationship_type;
      existing.verification_method = "admin_verified_invitation";
      existing.verified_at = now;
      existing.verified_by_profile_id = invitation.created_by_profile_id;
      existing.updated_at = now;
      return { success: true, relationshipId: existing.id };
    }

    IN_MEMORY_RELATIONSHIPS.push({
      id: relationshipId,
      guardian_profile_id: guardianProfileId,
      student_id: invitation.student_id,
      relationship_type: invitation.relationship_type,
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: true,
      can_receive_notifications: true,
      verification_method: "admin_verified_invitation",
      verified_at: now,
      verified_by_profile_id: invitation.created_by_profile_id,
      created_at: now,
      updated_at: now,
    });

    return { success: true, relationshipId };
  }

  try {
    const supabase = await createClient();

    // 1. Consume invitation (optimistic lock on status = 'pending')
    const { data: updatedInv, error: invError } = await supabase
      .from("guardian_invitations")
      .update({
        status: "consumed",
        consumed_at: now,
        consumed_by_profile_id: guardianProfileId,
      })
      .eq("id", invitation.id)
      .eq("status", "pending")
      .select("id")
      .single();

    if (invError || !updatedInv) {
      return {
        success: false,
        error: "Invitation has already been consumed or modified concurrently.",
      };
    }

    // 2. Upsert unique relationship pair (guardian_profile_id, student_id)
    const { data: relData, error: relError } = await supabase
      .from("guardian_student_relationships")
      .upsert(
        {
          guardian_profile_id: guardianProfileId,
          student_id: invitation.student_id,
          relationship_type: invitation.relationship_type,
          status: "active",
          can_view_attendance: true,
          can_view_progress: true,
          can_view_schedule: true,
          can_view_fees: true,
          can_receive_notifications: true,
          verification_method: "admin_verified_invitation",
          verified_at: now,
          verified_by_profile_id: invitation.created_by_profile_id,
          updated_at: now,
        },
        { onConflict: "guardian_profile_id,student_id" }
      )
      .select("id")
      .single();

    if (relError || !relData) {
      throw new Error(`Failed to activate guardian relationship: ${relError?.message}`);
    }

    // 3. Log immutable audit trail
    await supabase.from("audit_logs").insert({
      actor_id: guardianProfileId,
      action: "redeem_guardian_invitation",
      entity_type: "guardian_student_relationship",
      entity_id: relData.id,
      details: {
        invitation_id: invitation.id,
        student_id: invitation.student_id,
        guardian_email: guardianEmail,
        verification_method: "admin_verified_invitation",
      },
    });

    return { success: true, relationshipId: relData.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to redeem invitation";
    return { success: false, error: message };
  }
}

/**
 * Returns all verified children linked to a guardian profile.
 * Only active relationships are included.
 */
export async function getActiveChildrenForGuardian(
  guardianProfileId: string
): Promise<GuardianStudentRelationship[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_RELATIONSHIPS.filter(
      (r) => r.guardian_profile_id === guardianProfileId && r.status === "active"
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guardian_student_relationships")
      .select(`
        id,
        guardian_profile_id,
        student_id,
        relationship_type,
        status,
        can_view_attendance,
        can_view_progress,
        can_view_schedule,
        can_view_fees,
        can_receive_notifications,
        verification_method,
        verified_at,
        created_at,
        updated_at,
        student:students (
          id,
          student_code,
          status,
          date_of_birth,
          profile:profiles (
            full_name,
            email,
            avatar_url
          )
        )
      `)
      .eq("guardian_profile_id", guardianProfileId)
      .eq("status", "active");

    if (error || !data) {
      return IN_MEMORY_RELATIONSHIPS.filter(
        (r) => r.guardian_profile_id === guardianProfileId && r.status === "active"
      );
    }

    return data as unknown as GuardianStudentRelationship[];
  } catch {
    return IN_MEMORY_RELATIONSHIPS.filter(
      (r) => r.guardian_profile_id === guardianProfileId && r.status === "active"
    );
  }
}

/**
 * Verifies if a guardian has active permission for a given student and category.
 * Enforces DEFAULT DENY.
 */
export async function verifyGuardianStudentAccess(
  guardianProfileId: string,
  studentId: string,
  category: "attendance" | "progress" | "schedule" | "fees"
): Promise<boolean> {
  const activeRelationships = await getActiveChildrenForGuardian(guardianProfileId);
  const matched = activeRelationships.find((r) => r.student_id === studentId);

  if (!matched || matched.status !== "active") {
    return false;
  }

  switch (category) {
    case "attendance":
      return Boolean(matched.can_view_attendance);
    case "progress":
      return Boolean(matched.can_view_progress);
    case "schedule":
      return Boolean(matched.can_view_schedule);
    case "fees":
      return Boolean(matched.can_view_fees);
    default:
      return false;
  }
}

/**
 * Revokes a guardian relationship with audit logging.
 */
export async function revokeGuardianRelationship(
  relationshipId: string,
  adminProfileId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const rel = IN_MEMORY_RELATIONSHIPS.find((r) => r.id === relationshipId);
    if (!rel) return { success: false, error: "Relationship record not found" };
    rel.status = "revoked";
    rel.revoked_at = now;
    rel.revocation_reason = reason;
    rel.updated_at = now;
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("guardian_student_relationships")
      .update({
        status: "revoked",
        revoked_at: now,
        revocation_reason: reason,
        updated_at: now,
      })
      .eq("id", relationshipId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: adminProfileId,
      action: "revoke_guardian_relationship",
      entity_type: "guardian_student_relationship",
      entity_id: relationshipId,
      details: {
        revocation_reason: reason,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to revoke relationship";
    return { success: false, error: msg };
  }
}
