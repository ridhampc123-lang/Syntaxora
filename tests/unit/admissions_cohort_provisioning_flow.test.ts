import { describe, it, expect, beforeEach } from "vitest";
import { getPublishedCourses, createCourse } from "@/server/services/courseService";
import {
  submitStudentApplication,
  listApplications,
  updateApplicationReview,
  IN_MEMORY_APPLICATIONS,
} from "@/server/services/applicationService";
import {
  generateUniqueTemporaryPassword,
  PROVISIONED_TEMP_PASSWORDS,
} from "@/server/services/provisioningService";
import { getBatches, IN_MEMORY_BATCHES } from "@/server/services/batchService";
import { IN_MEMORY_ENROLLMENTS } from "@/server/services/enrollmentService";
import { INITIAL_STUDENTS } from "@/server/services/adminService";
import { requestStudentLinkByCode } from "@/server/services/guardianService";
import { signInAction } from "@/server/actions/auth";

describe("Root-Level End-to-End Admissions, Batch Scheduling, and Unique Credentials Flow", () => {
  beforeEach(() => {
    // Clean up test-specific in-memory applications
    const testIndices: number[] = [];
    IN_MEMORY_APPLICATIONS.forEach((app, idx) => {
      if (app.email.includes("testflow_")) {
        testIndices.push(idx);
      }
    });
    for (let i = testIndices.length - 1; i >= 0; i--) {
      IN_MEMORY_APPLICATIONS.splice(testIndices[i], 1);
    }
  });

  it("1. Admin creates a published course, and it is instantly available in the public inquiry form", async () => {
    const slug = `robotics-quantum-${Date.now()}`;
    const courseResult = await createCourse({
      title: "Quantum Robotics & Autonomous Drones",
      slug,
      summary: "Advanced drone autonomy using neural edge perception.",
      description: "Full semester hands-on academy track for high school and university builders.",
      level: "advanced",
      audience_group: "teens",
      delivery_mode: "live_online",
      duration_weeks: 10,
      price_in_cents: 1800000,
      currency: "INR",
      status: "published",
    });

    expect(courseResult.success).toBe(true);
    expect(courseResult.course).toBeDefined();

    // Verify course appears in public inquiry courses list
    const publishedCourses = await getPublishedCourses();
    const found = publishedCourses.find((c) => c.slug === slug);
    expect(found).toBeDefined();
    expect(found?.title).toBe("Quantum Robotics & Autonomous Drones");
  });

  it("2. Student submits inquiry application for the course", async () => {
    const email = `testflow_applicant_${Date.now()}@example.com`;
    const appResult = await submitStudentApplication({
      fullName: "Aarav Sharma",
      email,
      phone: "+91 98765 12345",
      dateOfBirth: "2008-04-15",
      educationLevel: "High School / Secondary (Ages 15–18)",
      courseId: "c1000000-0000-0000-0000-000000000001",
      statementOfInterest: "I want to train neural networks for competitive drone racing.",
      consent: true,
    });

    expect(appResult.success).toBe(true);
    expect(appResult.reference).toMatch(/^APP-[A-Z0-9]+$/);
    expect(appResult.applicationId).toBeDefined();

    // Verify application is in the admin review queue
    const { applications } = await listApplications({ search: email });
    expect(applications.length).toBeGreaterThan(0);
    const app = applications.find((a) => a.email === email);
    expect(app).toBeDefined();
    expect(app?.status).toBe("pending");
  });

  it("3. Admin approves application with specific Cohort Batch & Schedule allocation and unique temporary password", async () => {
    const email = `testflow_admitted_${Date.now()}@example.com`;
    const subResult = await submitStudentApplication({
      fullName: "Ananya Iyer",
      email,
      phone: "+91 98200 54321",
      dateOfBirth: "2009-07-22",
      educationLevel: "High School / Secondary (Ages 15–18)",
      courseId: "c1000000-0000-0000-0000-000000000001",
      consent: true,
    });
    expect(subResult.success).toBe(true);

    const appId = subResult.applicationId!;
    const adminUserId = "admin-reviewer-01";
    const targetBatch = IN_MEMORY_BATCHES[0];

    // Admin reviews and approves, selecting targetBatch.id
    const reviewResult = await updateApplicationReview(
      appId,
      adminUserId,
      "approved",
      "Accepted into Alpha Cohort with live Monday/Wednesday schedule.",
      "Top candidate with strong robotics competition credentials.",
      targetBatch.id
    );

    expect(reviewResult.success).toBe(true);
    expect(reviewResult.studentCode).toMatch(/^STU-[A-Z0-9]+$/);
    expect(reviewResult.temporaryPassword).toMatch(/^Syntaxora![A-Z0-9]+$/);
    expect(reviewResult.assignedBatch).toBe(targetBatch.name);

    // Verify enrollment links the assigned batch
    const enrollment = IN_MEMORY_ENROLLMENTS.find(
      (e) => e.student_id === reviewResult.studentCode || IN_MEMORY_APPLICATIONS.find((a) => a.id === appId)?.provisioned_student_id === e.student_id
    );
    expect(enrollment).toBeDefined();
    expect(enrollment?.batch_id).toBe(targetBatch.id);

    // Verify password is registered in PROVISIONED_TEMP_PASSWORDS for immediate login
    const registeredPwd = PROVISIONED_TEMP_PASSWORDS.get(email.toLowerCase());
    expect(registeredPwd).toBe(reviewResult.temporaryPassword);
  });

  it("4. Two different students receive two distinct, unique temporary passwords and unique student codes", async () => {
    const pwd1 = generateUniqueTemporaryPassword();
    const pwd2 = generateUniqueTemporaryPassword();

    // High entropy passwords must be unique
    expect(pwd1).not.toBe(pwd2);
    expect(pwd1.startsWith("Syntaxora!")).toBe(true);
    expect(pwd2.startsWith("Syntaxora!")).toBe(true);
    expect(pwd1.length).toBeGreaterThanOrEqual(16);

    const email1 = `testflow_student1_${Date.now()}@example.com`;
    const email2 = `testflow_student2_${Date.now()}@example.com`;

    const [app1, app2] = await Promise.all([
      submitStudentApplication({
        fullName: "Student One",
        email: email1,
        educationLevel: "Middle School (Ages 12–14)",
        consent: true,
      }),
      submitStudentApplication({
        fullName: "Student Two",
        email: email2,
        educationLevel: "Middle School (Ages 12–14)",
        consent: true,
      }),
    ]);

    const rev1 = await updateApplicationReview(
      app1.applicationId!,
      "admin-01",
      "approved",
      "Approved",
      undefined,
      IN_MEMORY_BATCHES[0].id
    );

    const rev2 = await updateApplicationReview(
      app2.applicationId!,
      "admin-01",
      "approved",
      "Approved",
      undefined,
      IN_MEMORY_BATCHES[1].id
    );

    expect(rev1.studentCode).not.toBe(rev2.studentCode);
    expect(rev1.temporaryPassword).not.toBe(rev2.temporaryPassword);
    expect(rev1.assignedBatch).toBe(IN_MEMORY_BATCHES[0].name);
    expect(rev2.assignedBatch).toBe(IN_MEMORY_BATCHES[1].name);
  });

  it("5. Provisioned student can log in using their email and unique temporary password", async () => {
    const email = `testflow_login_${Date.now()}@example.com`;
    const app = await submitStudentApplication({
      fullName: "Kabir Mehta",
      email,
      educationLevel: "Undergraduate / University Student",
      consent: true,
    });

    const rev = await updateApplicationReview(
      app.applicationId!,
      "admin-01",
      "approved",
      "Welcome to University AI Track",
      undefined,
      IN_MEMORY_BATCHES[0].id
    );

    const uniquePassword = rev.temporaryPassword!;
    expect(uniquePassword).toBeDefined();

    // Simulate login via signInAction
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", uniquePassword);

    const loginResult = await signInAction(null, formData);
    expect(loginResult.success).toBe(true);
    expect(loginResult.redirectTo).toBe("/student");
  });

  it("6. Parent can link to the student using the student's permanent student code", async () => {
    const email = `testflow_child_${Date.now()}@example.com`;
    const app = await submitStudentApplication({
      fullName: "Rhea Sen",
      email,
      educationLevel: "Primary / Elementary (Ages 7–11)",
      guardianName: "Sunita Sen",
      guardianEmail: "sunita.sen@example.com",
      consent: true,
    });

    const rev = await updateApplicationReview(
      app.applicationId!,
      "admin-01",
      "approved",
      "Welcome Rhea!",
      undefined,
      IN_MEMORY_BATCHES[1].id
    );

    const studentCode = rev.studentCode!;
    expect(studentCode).toMatch(/^STU-[A-Z0-9]+$/);

    const guardianProfileId = `u4-guardian-${Date.now()}`;
    const linkResult = await requestStudentLinkByCode(
      guardianProfileId,
      "sunita.sen@example.com",
      studentCode,
      "parent"
    );

    expect(linkResult.success).toBe(true);
    expect(linkResult.status).toBe("pending");
    expect(linkResult.relationshipId).toBeDefined();
  });
});
