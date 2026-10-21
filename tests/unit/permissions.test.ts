import { describe, it, expect } from "vitest";
import { GuardianStudentRelationship } from "@/types";

function canGuardianAccess(
  relationship: Partial<GuardianStudentRelationship> | null,
  permission: "attendance" | "progress" | "schedule" | "fees"
): boolean {
  if (!relationship) return false;
  if (relationship.status !== "active") return false;

  switch (permission) {
    case "attendance":
      return Boolean(relationship.can_view_attendance);
    case "progress":
      return Boolean(relationship.can_view_progress);
    case "schedule":
      return Boolean(relationship.can_view_schedule);
    case "fees":
      return Boolean(relationship.can_view_fees);
    default:
      return false;
  }
}

describe("Guardian Granular Permission Verification", () => {
  const activeRelationshipWithAll: Partial<GuardianStudentRelationship> = {
    status: "active",
    can_view_attendance: true,
    can_view_progress: true,
    can_view_schedule: true,
    can_view_fees: true,
  };

  const restrictedFeeRelationship: Partial<GuardianStudentRelationship> = {
    status: "active",
    can_view_attendance: true,
    can_view_progress: true,
    can_view_schedule: true,
    can_view_fees: false, // NOT permitted
  };

  const pendingRelationship: Partial<GuardianStudentRelationship> = {
    status: "pending",
    can_view_attendance: true,
    can_view_progress: true,
    can_view_schedule: true,
    can_view_fees: true,
  };

  const revokedRelationship: Partial<GuardianStudentRelationship> = {
    status: "revoked",
    can_view_attendance: true,
    can_view_progress: true,
    can_view_schedule: true,
    can_view_fees: true,
  };

  it("grants access when relationship is active and flag is enabled", () => {
    expect(canGuardianAccess(activeRelationshipWithAll, "attendance")).toBe(true);
    expect(canGuardianAccess(activeRelationshipWithAll, "fees")).toBe(true);
  });

  it("denies fee access when can_view_fees is false even if other flags are true", () => {
    expect(canGuardianAccess(restrictedFeeRelationship, "attendance")).toBe(true);
    expect(canGuardianAccess(restrictedFeeRelationship, "fees")).toBe(false);
  });

  it("denies all access when relationship is pending", () => {
    expect(canGuardianAccess(pendingRelationship, "attendance")).toBe(false);
    expect(canGuardianAccess(pendingRelationship, "progress")).toBe(false);
    expect(canGuardianAccess(pendingRelationship, "fees")).toBe(false);
  });

  it("denies all access when relationship is revoked", () => {
    expect(canGuardianAccess(revokedRelationship, "attendance")).toBe(false);
    expect(canGuardianAccess(revokedRelationship, "schedule")).toBe(false);
    expect(canGuardianAccess(revokedRelationship, "fees")).toBe(false);
  });

  it("denies access when relationship record is null", () => {
    expect(canGuardianAccess(null, "attendance")).toBe(false);
  });
});
