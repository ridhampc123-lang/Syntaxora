import { describe, it, expect } from "vitest";
import { contactFormSchema } from "@/lib/validation/contact";

describe("Contact Form Validation Schema", () => {
  it("validates correct form inputs successfully", () => {
    const validData = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      phone: "+1 555-0199",
      subject: "Inquiry about Teen Python track",
      message: "Hello, I would like to know the prerequisites for the upcoming cohort.",
      botField: "",
    };
    const result = contactFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("fails when email is improperly formatted", () => {
    const invalidData = {
      fullName: "Jane Doe",
      email: "not-an-email",
      subject: "Course inquiry",
      message: "A message with enough characters for validation.",
      botField: "",
    };
    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("fails when message is too short", () => {
    const invalidData = {
      fullName: "Jane Doe",
      email: "jane@example.com",
      subject: "Course inquiry",
      message: "Short",
      botField: "",
    };
    const result = contactFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("message");
    }
  });

  it("fails honeypot botField when filled by bots", () => {
    const botData = {
      fullName: "Bot Name",
      email: "bot@spam.com",
      subject: "Spam offer",
      message: "Spam message content here that is long enough.",
      botField: "I am a bot",
    };
    const result = contactFormSchema.safeParse(botData);
    expect(result.success).toBe(false);
  });
});

describe("Parent Sign Up Schema & Student Code Linking", () => {
  it("validates parent registration with a valid student code", async () => {
    const { signUpSchema } = await import("@/lib/validation/auth");
    const validData = {
      fullName: "Eleanor Vance",
      email: "eleanor.vance@example.com",
      password: "Password123",
      role: "parent",
      studentCode: "STU-8F39A1C2",
      relationshipType: "parent",
    };
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("validates parent registration without student code (optional)", async () => {
    const { signUpSchema } = await import("@/lib/validation/auth");
    const validData = {
      fullName: "David Chen",
      email: "david.chen@example.com",
      password: "Password123",
      role: "parent",
      studentCode: "",
    };
    const result = signUpSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("rejects student direct self-registration", async () => {
    const { signUpSchema } = await import("@/lib/validation/auth");
    const studentData = {
      fullName: "Direct Student",
      email: "student@example.com",
      password: "Password123",
      role: "student",
    };
    const result = signUpSchema.safeParse(studentData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain("Student self-registration is disabled");
    }
  });
});

