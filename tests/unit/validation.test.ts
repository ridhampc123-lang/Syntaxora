import { describe, it, expect, vi, beforeEach } from "vitest";
import { contactFormSchema } from "@/lib/validation/contact";

const createClientMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

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

describe("Contact Action Behavior", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("returns a failure response when the database insert fails", async () => {
    const { submitContactEnquiry } = await import("@/server/actions/contact");

    createClientMock.mockResolvedValue({
      from: vi.fn().mockReturnValue({
        insert: vi.fn().mockResolvedValue({
          error: new Error("Supabase insert failed"),
        }),
      }),
    });

    const formData = new FormData();
    formData.set("fullName", "Jane Doe");
    formData.set("email", "jane@example.com");
    formData.set("phone", "+1 555-0199");
    formData.set("subject", "Admissions inquiry");
    formData.set("message", "I would like to learn more about the robotics track.");
    formData.set("botField", "");

    const result = await submitContactEnquiry(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toContain("could not submit your enquiry right now");
    expect(result.values?.fullName).toBe("Jane Doe");
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

