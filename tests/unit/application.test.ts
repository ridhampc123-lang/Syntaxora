import { describe, it, expect } from "vitest";
import { studentApplicationSchema } from "@/lib/validation/application";
import { signUpSchema } from "@/lib/validation/auth";
import {
  submitStudentApplication,
  generateApplicationReference,
  IN_MEMORY_APPLICATIONS,
} from "@/server/services/applicationService";

describe("Phase A: Student Applications & Registration Restrictions", () => {
  it("rejects public sign-up with role: 'student' and provides clear admissions application notice", () => {
    const studentSignUp = {
      fullName: "Alex Morgan",
      email: "alex.student@example.com",
      password: "Password123",
      role: "student",
    };

    const result = signUpSchema.safeParse(studentSignUp);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain(
        "Student self-registration is disabled. Prospective students must submit an admission application at /apply."
      );
    }
  });

  it("permits public sign-up for role: 'parent'", () => {
    const parentSignUp = {
      fullName: "Sarah O'Connor",
      email: "sarah.parent@example.com",
      password: "Password123",
      role: "parent",
    };

    const result = signUpSchema.safeParse(parentSignUp);
    expect(result.success).toBe(true);
  });

  it("validates valid student application data and normalizes email", () => {
    const input = {
      fullName: "Maya Patel",
      email: " Maya.Patel@Example.COM ",
      phone: "+1 (555) 234-5678",
      dateOfBirth: "2011-06-15",
      educationLevel: "High School / Secondary (Ages 15–18)",
      guardianName: "Dev Patel",
      guardianEmail: "Dev.Patel@Example.COM",
      statementOfInterest: "Passionate about computer vision and robotics.",
      consent: true,
    };

    const result = studentApplicationSchema.safeParse(input);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("maya.patel@example.com");
      expect(result.data.guardianEmail).toBe("dev.patel@example.com");
    }
  });

  it("fails application validation if consent is not granted", () => {
    const input = {
      fullName: "Maya Patel",
      email: "maya.patel@example.com",
      educationLevel: "High School / Secondary (Ages 15–18)",
      consent: false,
    };

    const result = studentApplicationSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("consent");
    }
  });

  it("generates a valid, non-sequential application reference matching APP-XXXXXXXX", () => {
    const ref = generateApplicationReference();
    expect(ref).toMatch(/^APP-[A-F0-9]{8}$/);
  });

  it("submits application and returns reference without creating a user or session", async () => {
    const appData = {
      fullName: "New Applicant",
      email: "new.applicant@testdomain.com",
      educationLevel: "Middle School (Ages 12–14)",
      consent: true,
    };

    const result = await submitStudentApplication(appData);
    expect(result.success).toBe(true);
    expect(result.reference).toBeDefined();
    expect(result.reference).toMatch(/^APP-/);

    // Verify it was added to memory store with status 'pending'
    const stored = IN_MEMORY_APPLICATIONS.find(
      (a) => a.email === "new.applicant@testdomain.com"
    );
    expect(stored).toBeDefined();
    expect(stored?.status).toBe("pending");
    expect(stored?.provisioned_student_id).toBeNull();
  });

  it("preserves submitted form values and returns field-specific errors upon validation failure", async () => {
    const { submitApplicationAction } = await import("@/server/actions/application");

    const formData = new FormData();
    formData.set("fullName", "J"); // Invalid: less than 2 chars
    formData.set("email", "invalid-email"); // Invalid: not an email
    formData.set("phone", "+91 9999999999");
    formData.set("educationLevel", ""); // Invalid: missing
    formData.set("statementOfInterest", "Interested in AI");
    // consent is omitted (false)

    const result = await submitApplicationAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.values).toBeDefined();
    expect(result.values?.fullName).toBe("J");
    expect(result.values?.email).toBe("invalid-email");
    expect(result.values?.phone).toBe("+91 9999999999");
    expect(result.values?.statementOfInterest).toBe("Interested in AI");

    // Field-specific error warnings
    expect(result.errors?.fullName).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.educationLevel).toBeDefined();
    expect(result.errors?.consent).toBeDefined();
    expect(result.message).toContain("Please correct the");
  });
});
