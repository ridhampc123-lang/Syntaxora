import { describe, it, expect } from "vitest";
import { signUpSchema } from "@/lib/validation/auth";
import { getPortalRedirect } from "@/server/services/authService";

describe("Authentication & Role Authorization Security", () => {
  it("rejects privilege escalation attempts to register as admin", () => {
    const maliciousPayload = {
      fullName: "Attacker User",
      email: "attacker@example.com",
      password: "StrongPassword1",
      role: "admin", // FORBIDDEN
    };

    const result = signUpSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("role");
    }
  });

  it("rejects privilege escalation attempts to register as instructor", () => {
    const maliciousPayload = {
      fullName: "Attacker User",
      email: "attacker@example.com",
      password: "StrongPassword1",
      role: "instructor", // FORBIDDEN
    };

    const result = signUpSchema.safeParse(maliciousPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("role");
    }
  });

  it("rejects direct registration for student role requiring admission application", () => {
    const studentPayload = {
      fullName: "Alex Student",
      email: "alex@example.com",
      password: "ValidPassword1",
      role: "student",
    };

    const result = signUpSchema.safeParse(studentPayload);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Student self-registration is disabled. Prospective students must submit an admission application at /apply."
      );
    }
  });

  it("permits registration for parent role with compliant password", () => {
    const validParentPayload = {
      fullName: "Pat Parent",
      email: "pat@example.com",
      password: "ValidPassword1",
      role: "parent",
    };

    const result = signUpSchema.safeParse(validParentPayload);
    expect(result.success).toBe(true);
  });

  it("enforces strong password policy in registration", () => {
    const weakPasswords = [
      "short1A", // < 8 chars
      "nouppercase123", // no uppercase
      "NoNumbersHere", // no number
    ];

    for (const pwd of weakPasswords) {
      const result = signUpSchema.safeParse({
        fullName: "Test User",
        email: "test@example.com",
        password: pwd,
        role: "student",
      });
      expect(result.success).toBe(false);
    }
  });

  it("maps authoritative database roles to correct portal paths", () => {
    expect(getPortalRedirect("admin")).toBe("/admin");
    expect(getPortalRedirect("instructor")).toBe("/instructor");
    expect(getPortalRedirect("student")).toBe("/student");
    expect(getPortalRedirect("parent")).toBe("/parent");
  });
});
