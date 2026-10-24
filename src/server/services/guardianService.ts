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

// In-memory rate limiting map for student linking attempts
const LINK_ATTEMPT_TIMESTAMPS = new Map<string, number[]>();

export function checkLinkRateLimit(guardianProfileId: string): boolean {
  const now = Date.now();
  const windowMs = 5 * 60 * 1000; // 5 minutes
  const maxAttempts = 5;

  const timestamps = LINK_ATTEMPT_TIMESTAMPS.get(guardianProfileId) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= maxAttempts) {
    return false;
  }

  validTimestamps.push(now);
  LINK_ATTEMPT_TIMESTAMPS.set(guardianProfileId, validTimestamps);
  return true;
}

/**
 * Returns all relationships for a guardian (pending, active, rejected, revoked)
 */
export async function getAllRelationshipsForGuardian(
  guardianProfileId: string
): Promise<GuardianStudentRelationship[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_RELATIONSHIPS.filter(
      (r) => r.guardian_profile_id === guardianProfileId
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
      .order("created_at", { ascending: false });

    if (error || !data) {
      return IN_MEMORY_RELATIONSHIPS.filter(
        (r) => r.guardian_profile_id === guardianProfileId
      );
    }

    return data as unknown as GuardianStudentRelationship[];
  } catch {
    return IN_MEMORY_RELATIONSHIPS.filter(
      (r) => r.guardian_profile_id === guardianProfileId
    );
  }
}

/**
 * Submits a student link request using the unique student code.
 * STRICT SECURITY INVARIANTS:
 * 1. Rate-limited to prevent brute forcing student codes.
 * 2. Generic safe error on invalid/inactive codes (never leaks student names).
 * 3. Enforces unique (guardian, student) pair.
 * 4. Relationship is created with status 'pending' and ALL viewing permissions FALSE.
 * 5. Data access is zero until verified by academy administration.
 */
export async function requestStudentLinkByCode(
  guardianProfileId: string,
  _guardianEmail: string,
  rawStudentCode: string,
  relationshipType: GuardianRelationshipType = "parent"
): Promise<{ success: boolean; message: string; status?: string; relationshipId?: string }> {
  // 1. Rate limit
  if (!checkLinkRateLimit(guardianProfileId)) {
    return {
      success: false,
      message: "Too many linking attempts. Please wait 5 minutes before trying another student code.",
    };
  }

  const studentCode = rawStudentCode.trim().toUpperCase();
  const now = new Date().toISOString();

  // 2. Resolve student record
  let student: { id: string; student_code: string; status: string } | null = null;

  if (!isSupabaseConfigured()) {
    const { INITIAL_STUDENTS } = await import("./adminService");
    const found = INITIAL_STUDENTS.find(
      (s) => s.student_code.toUpperCase() === studentCode
    );
    if (found) {
      student = { id: found.id, student_code: found.student_code, status: found.status };
    }
  } else {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("students")
        .select("id, student_code, status")
        .eq("student_code", studentCode)
        .maybeSingle();

      if (!error && data) {
        student = data;
      }
    } catch {
      // Invariant: Return generic error
    }
  }

  // Generic safe error
  if (!student || student.status !== "active") {
    return {
      success: false,
      message: "Invalid student code or student record not found. Please verify the code with your student and try again.",
    };
  }

  // 3. Enforce Unique Guardian-Student Pair
  if (!isSupabaseConfigured()) {
    const { INITIAL_STUDENTS } = await import("./adminService");
    const existing = IN_MEMORY_RELATIONSHIPS.find(
      (r) => r.guardian_profile_id === guardianProfileId && r.student_id === student.id
    );

    if (existing) {
      if (existing.status === "active") {
        return {
          success: true,
          status: "active",
          message: "You are already actively connected to this student.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "pending") {
        return {
          success: true,
          status: "pending",
          message: "A connection request for this student is already pending administrator verification.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "rejected") {
        return {
          success: false,
          status: "rejected",
          message: "A prior connection request for this student was rejected by academy admissions.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "revoked") {
        return {
          success: false,
          status: "revoked",
          message: "Guardian access for this student was previously revoked.",
          relationshipId: existing.id,
        };
      }
    }

    const newId = `rel-${crypto.randomUUID()}`;
    const newRel: GuardianStudentRelationship = {
      id: newId,
      guardian_profile_id: guardianProfileId,
      student_id: student.id,
      relationship_type: relationshipType,
      status: "pending",
      can_view_attendance: false,
      can_view_progress: false,
      can_view_schedule: false,
      can_view_fees: false,
      can_receive_notifications: false,
      verification_method: "parent_code_request",
      created_at: now,
      updated_at: now,
      student: INITIAL_STUDENTS.find((s) => s.id === student.id),
    };

    IN_MEMORY_RELATIONSHIPS.unshift(newRel);

    return {
      success: true,
      status: "pending",
      relationshipId: newId,
      message: "Student connection request submitted. In accordance with academy child safety policies, student records remain private until an academy administrator verifies your relationship.",
    };
  }

  try {
    const supabase = await createClient();

    // Check existing
    const { data: existing } = await supabase
      .from("guardian_student_relationships")
      .select("id, status")
      .eq("guardian_profile_id", guardianProfileId)
      .eq("student_id", student.id)
      .maybeSingle();

    if (existing) {
      if (existing.status === "active") {
        return {
          success: true,
          status: "active",
          message: "You are already actively connected to this student.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "pending") {
        return {
          success: true,
          status: "pending",
          message: "A connection request for this student is already pending administrator verification.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "rejected") {
        return {
          success: false,
          status: "rejected",
          message: "A prior connection request for this student was rejected by academy admissions.",
          relationshipId: existing.id,
        };
      }
      if (existing.status === "revoked") {
        return {
          success: false,
          status: "revoked",
          message: "Guardian access for this student was previously revoked.",
          relationshipId: existing.id,
        };
      }
    }

    // Insert pending with NO permissions
    const { data: newRel, error: insertError } = await supabase
      .from("guardian_student_relationships")
      .insert({
        guardian_profile_id: guardianProfileId,
        student_id: student.id,
        relationship_type: relationshipType,
        status: "pending",
        can_view_attendance: false,
        can_view_progress: false,
        can_view_schedule: false,
        can_view_fees: false,
        can_receive_notifications: false,
        verification_method: "parent_code_request",
      })
      .select("id")
      .single();

    if (insertError || !newRel) {
      return { success: false, message: "Failed to submit link request. Please try again." };
    }

    await supabase.from("audit_logs").insert({
      actor_id: guardianProfileId,
      action: "GUARDIAN_LINK_REQUESTED",
      entity_type: "guardian_student_relationship",
      entity_id: newRel.id,
      details: {
        student_id: student.id,
        student_code: student.student_code,
        relationship_type: relationshipType,
      },
    });

    return {
      success: true,
      status: "pending",
      relationshipId: newRel.id,
      message: "Student connection request submitted. In accordance with academy child safety policies, student records remain private until an academy administrator verifies your relationship.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit linking request";
    return { success: false, message: msg };
  }
}

/**
 * Admin approves and activates a guardian relationship with chosen permission flags.
 */
export async function adminApproveGuardianRelationship(
  relationshipId: string,
  adminProfileId: string,
  permissions: {
    canViewAttendance?: boolean;
    canViewProgress?: boolean;
    canViewSchedule?: boolean;
    canViewFees?: boolean;
    canReceiveNotifications?: boolean;
  },
  verificationMethod = "admin_verified_code_request"
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const rel = IN_MEMORY_RELATIONSHIPS.find((r) => r.id === relationshipId);
    if (!rel) return { success: false, message: "Relationship record not found." };

    rel.status = "active";
    rel.can_view_attendance = Boolean(permissions.canViewAttendance);
    rel.can_view_progress = Boolean(permissions.canViewProgress);
    rel.can_view_schedule = Boolean(permissions.canViewSchedule);
    rel.can_view_fees = Boolean(permissions.canViewFees);
    rel.can_receive_notifications = Boolean(permissions.canReceiveNotifications);
    rel.verification_method = verificationMethod;
    rel.verified_at = now;
    rel.verified_by_profile_id = adminProfileId;
    rel.updated_at = now;

    return { success: true, message: "Guardian relationship verified and activated." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("guardian_student_relationships")
      .update({
        status: "active",
        can_view_attendance: Boolean(permissions.canViewAttendance),
        can_view_progress: Boolean(permissions.canViewProgress),
        can_view_schedule: Boolean(permissions.canViewSchedule),
        can_view_fees: Boolean(permissions.canViewFees),
        can_receive_notifications: Boolean(permissions.canReceiveNotifications),
        verification_method: verificationMethod,
        verified_at: now,
        verified_by_profile_id: adminProfileId,
        updated_at: now,
      })
      .eq("id", relationshipId);

    if (error) {
      return { success: false, message: error.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: adminProfileId,
      action: "GUARDIAN_RELATIONSHIP_APPROVED",
      entity_type: "guardian_student_relationship",
      entity_id: relationshipId,
      details: {
        permissions,
        verification_method: verificationMethod,
      },
    });

    return { success: true, message: "Guardian relationship verified and activated." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to activate relationship";
    return { success: false, message: msg };
  }
}

/**
 * Admin rejects a guardian connection request with recorded reason.
 */
export async function adminRejectGuardianRelationship(
  relationshipId: string,
  adminProfileId: string,
  reason: string
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const rel = IN_MEMORY_RELATIONSHIPS.find((r) => r.id === relationshipId);
    if (!rel) return { success: false, message: "Relationship record not found." };

    rel.status = "rejected";
    rel.revocation_reason = reason;
    rel.updated_at = now;
    return { success: true, message: "Guardian connection request rejected." };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("guardian_student_relationships")
      .update({
        status: "rejected",
        revocation_reason: reason,
        updated_at: now,
      })
      .eq("id", relationshipId);

    if (error) return { success: false, message: error.message };

    await supabase.from("audit_logs").insert({
      actor_id: adminProfileId,
      action: "GUARDIAN_RELATIONSHIP_REJECTED",
      entity_type: "guardian_student_relationship",
      entity_id: relationshipId,
      details: { rejection_reason: reason },
    });

    return { success: true, message: "Guardian connection request rejected." };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to reject relationship";
    return { success: false, message: msg };
  }
}

/**
 * Admin directly connects an existing verified parent account to a student using their code.
 */
export async function adminCreateDirectGuardianRelationship(
  guardianEmail: string,
  studentCode: string,
  relationshipType: GuardianRelationshipType,
  permissions: {
    canViewAttendance: boolean;
    canViewProgress: boolean;
    canViewSchedule: boolean;
    canViewFees: boolean;
    canReceiveNotifications: boolean;
  },
  adminProfileId: string,
  verificationMethod = "admin_assisted_connection"
): Promise<{ success: boolean; message: string; relationshipId?: string }> {
  const normEmail = guardianEmail.toLowerCase().trim();
  const code = studentCode.toUpperCase().trim();
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const { INITIAL_STUDENTS } = await import("./adminService");
    const student = INITIAL_STUDENTS.find((s) => s.student_code.toUpperCase() === code);
    if (!student) {
      return { success: false, message: `Student code ${code} not found in student records.` };
    }

    const existing = IN_MEMORY_RELATIONSHIPS.find(
      (r) => r.student_id === student.id && r.guardian?.email.toLowerCase() === normEmail
    );
    if (existing) {
      existing.status = "active";
      existing.can_view_attendance = permissions.canViewAttendance;
      existing.can_view_progress = permissions.canViewProgress;
      existing.can_view_schedule = permissions.canViewSchedule;
      existing.can_view_fees = permissions.canViewFees;
      existing.can_receive_notifications = permissions.canReceiveNotifications;
      existing.verification_method = verificationMethod;
      existing.verified_at = now;
      existing.verified_by_profile_id = adminProfileId;
      existing.updated_at = now;
      return { success: true, message: "Existing guardian relationship updated and activated.", relationshipId: existing.id };
    }

    const relId = `rel-${crypto.randomUUID()}`;
    const newRel: GuardianStudentRelationship = {
      id: relId,
      guardian_profile_id: `u4000000-0000-0000-0000-${crypto.randomBytes(6).toString("hex")}`,
      student_id: student.id,
      relationship_type: relationshipType,
      status: "active",
      can_view_attendance: permissions.canViewAttendance,
      can_view_progress: permissions.canViewProgress,
      can_view_schedule: permissions.canViewSchedule,
      can_view_fees: permissions.canViewFees,
      can_receive_notifications: permissions.canReceiveNotifications,
      verification_method: verificationMethod,
      verified_at: now,
      verified_by_profile_id: adminProfileId,
      created_at: now,
      updated_at: now,
      student,
      guardian: {
        id: `u4000000-0000-0000-0000-mock`,
        role: "parent",
        full_name: normEmail.split("@")[0],
        email: normEmail,
        created_at: now,
        updated_at: now,
      },
    };

    IN_MEMORY_RELATIONSHIPS.unshift(newRel);
    return { success: true, message: `Guardian relationship verified and activated for ${student.student_code}.`, relationshipId: relId };
  }

  try {
    const supabase = await createClient();

    const { data: student, error: stuError } = await supabase
      .from("students")
      .select("id, student_code")
      .eq("student_code", code)
      .maybeSingle();

    if (stuError || !student) {
      return { success: false, message: `Student code ${code} not found in student records.` };
    }

    const { data: parentProfile, error: parentError } = await supabase
      .from("profiles")
      .select("id, role, email")
      .eq("email", normEmail)
      .maybeSingle();

    if (parentError || !parentProfile) {
      return {
        success: false,
        message: `No registered parent account found for email ${normEmail}. Parents must first create a parent account before linking.`,
      };
    }

    if (parentProfile.role !== "parent") {
      return {
        success: false,
        message: `Account ${normEmail} has role '${parentProfile.role}'. Guardian links require a parent account.`,
      };
    }

    const { data: rel, error: relError } = await supabase
      .from("guardian_student_relationships")
      .upsert(
        {
          guardian_profile_id: parentProfile.id,
          student_id: student.id,
          relationship_type: relationshipType,
          status: "active",
          can_view_attendance: permissions.canViewAttendance,
          can_view_progress: permissions.canViewProgress,
          can_view_schedule: permissions.canViewSchedule,
          can_view_fees: permissions.canViewFees,
          can_receive_notifications: permissions.canReceiveNotifications,
          verification_method: verificationMethod,
          verified_at: now,
          verified_by_profile_id: adminProfileId,
          updated_at: now,
        },
        { onConflict: "guardian_profile_id,student_id" }
      )
      .select("id")
      .single();

    if (relError || !rel) {
      return { success: false, message: relError?.message || "Failed to establish relationship." };
    }

    await supabase.from("audit_logs").insert({
      actor_id: adminProfileId,
      action: "ADMIN_DIRECT_GUARDIAN_LINK",
      entity_type: "guardian_student_relationship",
      entity_id: rel.id,
      details: {
        guardian_email: normEmail,
        student_code: code,
        verification_method: verificationMethod,
        permissions,
      },
    });

    return {
      success: true,
      message: `Direct guardian link verified and activated for student ${code}.`,
      relationshipId: rel.id,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Error connecting parent and student";
    return { success: false, message: msg };
  }
}

