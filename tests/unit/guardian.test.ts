import { describe, it, expect } from "vitest";
import {
  generateInvitationToken,
  hashToken,
  createGuardianInvitation,
  inspectInvitationToken,
  redeemGuardianInvitation,
  verifyGuardianStudentAccess,
  revokeGuardianRelationship,
  IN_MEMORY_INVITATIONS,
  IN_MEMORY_RELATIONSHIPS,
} from "@/server/services/guardianService";
import {
  createGuardianInvitationSchema,
  redeemGuardianInvitationSchema,
  revokeGuardianRelationshipSchema,
} from "@/lib/validation/guardian";

describe("Phase 4: Guardian–Student Matching & Authorization Security", () => {
  it("generates 256-bit high-entropy tokens with deterministic SHA-256 hashing", () => {
    const { rawToken, tokenHash } = generateInvitationToken();

    // 32 bytes hex = 64 hex characters
    expect(rawToken).toHaveLength(64);
    expect(tokenHash).toHaveLength(64);

    // Recomputing hash gives identical result
    expect(hashToken(rawToken)).toBe(tokenHash);

    // Distinct tokens produce completely unique hashes
    const token2 = generateInvitationToken();
    expect(token2.rawToken).not.toBe(rawToken);
    expect(token2.tokenHash).not.toBe(tokenHash);

    // Tampering test: altering a single character in raw token fails hash check
    const tampered = rawToken.slice(0, -1) + (rawToken.slice(-1) === "a" ? "b" : "a");
    expect(hashToken(tampered)).not.toBe(tokenHash);
  });

  it("validates create guardian invitation schema and normalizes email", () => {
    const valid = {
      studentId: "123e4567-e89b-12d3-a456-426614174000",
      intendedGuardianEmail: "  Guardian.Parent@Example.COM  ",
      relationshipType: "parent",
      canViewAttendance: true,
      canViewProgress: true,
      canViewSchedule: true,
      canViewFees: false,
      canReceiveNotifications: true,
    };

    const res = createGuardianInvitationSchema.safeParse(valid);
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.intendedGuardianEmail).toBe("guardian.parent@example.com");
      expect(res.data.canViewFees).toBe(false);
    }
  });

  it("rejects invalid invitation payload", () => {
    const invalidEmail = {
      studentId: "11111111-1111-1111-1111-111111111111",
      intendedGuardianEmail: "not-an-email",
      relationshipType: "parent",
    };
    expect(createGuardianInvitationSchema.safeParse(invalidEmail).success).toBe(false);

    const invalidUuid = {
      studentId: "non-uuid",
      intendedGuardianEmail: "valid@example.com",
      relationshipType: "parent",
    };
    expect(createGuardianInvitationSchema.safeParse(invalidUuid).success).toBe(false);
  });

  it("enforces single-use token lifecycle: prevents duplicate consumption", async () => {
    const studentId = "s1000000-0000-0000-0000-000000000001";
    const guardianEmail = "singleuse.test@example.com";
    const guardianProfileId = "u-guardian-test-01";

    const { rawToken } = await createGuardianInvitation({
      studentId,
      intendedGuardianEmail: guardianEmail,
      relationshipType: "parent",
      createdByProfileId: "u-admin-test-01",
    });

    // 1. First inspection: valid & pending
    const inspect1 = await inspectInvitationToken(rawToken);
    expect(inspect1.valid).toBe(true);
    expect(inspect1.invitation?.status).toBe("pending");

    // 2. First redemption: succeeds
    const redeem1 = await redeemGuardianInvitation({
      rawToken,
      guardianProfileId,
      guardianEmail,
    });
    expect(redeem1.success).toBe(true);
    expect(redeem1.relationshipId).toBeDefined();

    // 3. Second inspection: flagged as already_consumed
    const inspect2 = await inspectInvitationToken(rawToken);
    expect(inspect2.valid).toBe(false);
    expect(inspect2.reason).toBe("already_consumed");

    // 4. Second redemption attempt: strictly denied
    const redeem2 = await redeemGuardianInvitation({
      rawToken,
      guardianProfileId,
      guardianEmail,
    });
    expect(redeem2.success).toBe(false);
    expect(redeem2.error).toContain("already been used");
  });

  it("strictly enforces expiration limits on time-limited invitation tokens", async () => {
    const { rawToken, tokenHash } = generateInvitationToken();
    const expiredTimestamp = new Date(Date.now() - 3600 * 1000).toISOString(); // 1 hour ago

    // Insert manually expired invitation into in-memory store
    IN_MEMORY_INVITATIONS.push({
      id: "inv-expired-01",
      student_id: "s1000000-0000-0000-0000-000000000001",
      intended_guardian_email: "expired@example.com",
      relationship_type: "parent",
      token_hash: tokenHash,
      expires_at: expiredTimestamp,
      status: "pending",
      created_by_profile_id: "admin-id",
      created_at: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(),
    });

    const inspection = await inspectInvitationToken(rawToken);
    expect(inspection.valid).toBe(false);
    expect(inspection.reason).toBe("expired");

    const redeemRes = await redeemGuardianInvitation({
      rawToken,
      guardianProfileId: "u-guardian-02",
      guardianEmail: "expired@example.com",
    });
    expect(redeemRes.success).toBe(false);
    expect(redeemRes.error).toContain("expired");
  });

  it("strictly rejects redemption when user account email differs from intended recipient", async () => {
    const { rawToken } = await createGuardianInvitation({
      studentId: "s1000000-0000-0000-0000-000000000001",
      intendedGuardianEmail: "intended.parent@example.com",
      relationshipType: "parent",
      createdByProfileId: "u-admin-test-01",
    });

    const mismatchRedeem = await redeemGuardianInvitation({
      rawToken,
      guardianProfileId: "u-attacker-01",
      guardianEmail: "unauthorized.attacker@example.com", // Mismatch
    });

    expect(mismatchRedeem.success).toBe(false);
    expect(mismatchRedeem.error).toContain("Security boundary mismatch");
  });

  it("never infers guardian access from name, email, or contact similarity (Anti-Inference Rule)", async () => {
    // Student: Liam O'Connor (s1000000-0000-0000-0000-000000000001)
    // Non-linked user with identical surname: "John O'Connor"
    const unlinkedOconnorProfileId = "u-random-oconnor-99";
    const studentId = "s1000000-0000-0000-0000-000000000001";

    const hasAccess = await verifyGuardianStudentAccess(
      unlinkedOconnorProfileId,
      studentId,
      "attendance"
    );

    // Must strictly be FALSE
    expect(hasAccess).toBe(false);
  });

  it("respects granular permission boundaries (Default-Deny)", async () => {
    const guardianId = "u-perm-guardian-01";
    const studentId = "s-perm-student-01";
    const relId = "rel-perm-test-01";

    // Setup active relationship with can_view_fees = false
    IN_MEMORY_RELATIONSHIPS.push({
      id: relId,
      guardian_profile_id: guardianId,
      student_id: studentId,
      relationship_type: "parent",
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: false, // RESTRICTED
      can_receive_notifications: true,
      verification_method: "admin_verified_invitation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const canViewAttendance = await verifyGuardianStudentAccess(guardianId, studentId, "attendance");
    const canViewProgress = await verifyGuardianStudentAccess(guardianId, studentId, "progress");
    const canViewFees = await verifyGuardianStudentAccess(guardianId, studentId, "fees");

    expect(canViewAttendance).toBe(true);
    expect(canViewProgress).toBe(true);
    expect(canViewFees).toBe(false); // DENIED
  });

  it("immediately denies all access once relationship is revoked", async () => {
    const guardianId = "u-revoke-guardian-01";
    const studentId = "s-revoke-student-01";
    const relId = "rel-revoke-test-01";

    IN_MEMORY_RELATIONSHIPS.push({
      id: relId,
      guardian_profile_id: guardianId,
      student_id: studentId,
      relationship_type: "parent",
      status: "active",
      can_view_attendance: true,
      can_view_progress: true,
      can_view_schedule: true,
      can_view_fees: true,
      can_receive_notifications: true,
      verification_method: "admin_verified_invitation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 1. Initially permitted
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "attendance")).toBe(true);

    // 2. Revoke link with reason
    const revokeRes = await revokeGuardianRelationship(
      relId,
      "admin-id",
      "Legal custody update received and verified"
    );
    expect(revokeRes.success).toBe(true);

    // 3. Immediately denied subsequent access
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "attendance")).toBe(false);
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "fees")).toBe(false);
  });

  it("validates revocation schema requires minimum 5 character reason", () => {
    const valid = {
      relationshipId: "123e4567-e89b-12d3-a456-426614174000",
      revocationReason: "Parent requested link termination",
    };
    expect(revokeGuardianRelationshipSchema.safeParse(valid).success).toBe(true);

    const invalidShort = {
      relationshipId: "123e4567-e89b-12d3-a456-426614174000",
      revocationReason: "bye", // < 5 chars
    };
    expect(revokeGuardianRelationshipSchema.safeParse(invalidShort).success).toBe(false);
  });

  it("validates redemption token schema enforces minimum 32 character entropy", () => {
    const valid = { token: "a".repeat(64) };
    expect(redeemGuardianInvitationSchema.safeParse(valid).success).toBe(true);

    const invalidTooShort = { token: "short-token" };
    expect(redeemGuardianInvitationSchema.safeParse(invalidTooShort).success).toBe(false);
  });
});
