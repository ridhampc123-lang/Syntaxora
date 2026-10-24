import { describe, it, expect, beforeEach } from "vitest";
import {
  generateRandomStudentCode,
  generateUniqueStudentCode,
  provisionStudentFromApplication,
  resendStudentSetupEmail,
} from "@/server/services/provisioningService";
import {
  submitStudentApplication,
  getApplicationById,
} from "@/server/services/applicationService";
import { INITIAL_STUDENTS } from "@/server/services/adminService";

describe("Student Account Provisioning Service", () => {
  beforeEach(() => {
    // Reset or clean up fixtures
  });

  it("generates a student code conforming to the STU-XXXXXXXX format with no PII", () => {
    const code = generateRandomStudentCode();
    expect(code).toMatch(/^STU-[0-9A-F]{8}$/);
  });

  it("generates unique codes across successive invocations", async () => {
    const code1 = await generateUniqueStudentCode();
    const code2 = await generateUniqueStudentCode();
    expect(code1).not.toBe(code2);
    expect(code1).toMatch(/^STU-[0-9A-F]{8}/);
    expect(code2).toMatch(/^STU-[0-9A-F]{8}/);
  });

  it("provisions a student account only after approval and creates a canonical student record", async () => {
    // Submit an application
    const appRes = await submitStudentApplication({
      fullName: "Zara Chen",
      email: "zara.chen.provisioning@example.com",
      phone: "+1 (555) 777-8899",
      educationLevel: "Middle School (Grade 8)",
      courseId: "c1000000-0000-0000-0000-000000000001",
      consent: true,
      guardianName: "Hui Chen",
      guardianEmail: "hui.chen@example.com",
      guardianPhone: "+1 (555) 777-8800",
      statementOfInterest: "Excited about neural networks and robotics.",
    });

    expect(appRes.success).toBe(true);
    expect(appRes.applicationId).toBeDefined();

    const adminId = "u3000000-0000-0000-0000-000000000001";
    const provRes = await provisionStudentFromApplication(
      appRes.applicationId!,
      adminId,
      "Approved for Robotics cohort"
    );

    expect(provRes.success).toBe(true);
    expect(provRes.studentCode).toMatch(/^STU-[0-9A-F]{8}/);
    expect(provRes.studentId).toBeDefined();
    // Honest email reporting
    expect(provRes.emailStatus.provider).toBe("unconfigured");
    expect(provRes.emailStatus.sent).toBe(false);

    // Verify application state updated
    const app = await getApplicationById(appRes.applicationId!);
    expect(app?.status).toBe("approved");
    expect(app?.provisioned_student_id).toBe(provRes.studentId);
    expect(app?.reviewed_by_profile_id).toBe(adminId);

    // Verify student is in canonical store
    const student = INITIAL_STUDENTS.find((s) => s.id === provRes.studentId);
    expect(student).toBeDefined();
    expect(student?.student_code).toBe(provRes.studentCode);
    expect(student?.profile?.email).toBe("zara.chen.provisioning@example.com");
  });

  it("is idempotent: repeated approval attempts do not create duplicate accounts or duplicate codes", async () => {
    const appRes = await submitStudentApplication({
      fullName: "Julian Vance",
      email: "julian.vance.idempotent@example.com",
      educationLevel: "High School",
      consent: true,
    });

    const adminId = "u3000000-0000-0000-0000-000000000001";
    const firstProv = await provisionStudentFromApplication(appRes.applicationId!, adminId);
    expect(firstProv.success).toBe(true);
    const initialCode = firstProv.studentCode;
    const initialId = firstProv.studentId;

    // Second execution (e.g. repeated click, webhook, network retry)
    const secondProv = await provisionStudentFromApplication(appRes.applicationId!, adminId);
    expect(secondProv.success).toBe(true);
    expect(secondProv.alreadyProvisioned).toBe(true);
    expect(secondProv.studentCode).toBe(initialCode);
    expect(secondProv.studentId).toBe(initialId);
  });

  it("refuses to silently merge when an existing canonical student with the email already exists", async () => {
    // Liam O'Connor already exists in INITIAL_STUDENTS with email liam.oconnor@example.com
    const appRes = await submitStudentApplication({
      fullName: "Liam O'Connor Duplicate",
      email: "liam.oconnor@example.com",
      educationLevel: "High School",
      consent: true,
    });

    const adminId = "u3000000-0000-0000-0000-000000000001";
    const provRes = await provisionStudentFromApplication(appRes.applicationId!, adminId);

    expect(provRes.success).toBe(false);
    expect(provRes.message).toContain("already exists");
    expect(provRes.message).toContain("not silently merged");
  });

  it("allows resending setup email and returns honest delivery status", async () => {
    const appRes = await submitStudentApplication({
      fullName: "Maya Lin",
      email: "maya.lin.resend@example.com",
      educationLevel: "High School",
      consent: true,
    });

    const adminId = "u3000000-0000-0000-0000-000000000001";
    await provisionStudentFromApplication(appRes.applicationId!, adminId);

    const resend = await resendStudentSetupEmail(appRes.applicationId!, adminId);
    expect(resend.provider).toBe("unconfigured");
    expect(resend.success).toBe(false);
    expect(resend.message).toContain("Email provider not configured");
  });
});
