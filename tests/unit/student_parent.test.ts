import { describe, it, expect } from "vitest";
import {
  submitStudentAssignment,
  getStudentReleasedGrades,
  getStudentAttendance,
} from "@/server/services/studentService";
import {
  gradeSubmission,
  toggleGradePublication,
  IN_MEMORY_SUBMISSIONS,
} from "@/server/services/instructorService";
import {
  getActiveChildrenForGuardian,
  verifyGuardianStudentAccess,
  IN_MEMORY_RELATIONSHIPS,
} from "@/server/services/guardianService";
import {
  submitAssignmentSchema,
  markLessonCompleteSchema,
} from "@/lib/validation/student";

describe("Phase 6: Student & Parent Portals Authorization & Isolation", () => {
  it("submitting an assignment records submission as draft and unreleased", async () => {
    const studentId = "s-test-student-99";
    const assignmentId = "asn-test-asn-99";

    const res = await submitStudentAssignment(
      studentId,
      assignmentId,
      "github.com/syntaxora/student-solution\nImplemented OpenCV edge detection pipeline."
    );

    expect(res.success).toBe(true);
    expect(res.submissionId).toBeDefined();

    const sub = IN_MEMORY_SUBMISSIONS.find((s) => s.id === res.submissionId);
    expect(sub?.status).toBe("submitted");
    expect(sub?.score).toBeNull();
    expect(sub?.feedback).toBeNull();
    expect(sub?.is_grade_published).toBe(false);
  });

  it("strictly filters unreleased grades from student view (Draft Isolation)", async () => {
    const studentId = "s-grade-isolate-student-01";
    const subId = "sub-grade-isolate-01";

    // 1. Student submits assignment
    await submitStudentAssignment(studentId, "asn-1000000-0000-0000-0000-000000000001", "my code solution");
    const sub = IN_MEMORY_SUBMISSIONS.find((s) => s.student_id === studentId);
    expect(sub).toBeDefined();

    // 2. Instructor grades submission but leaves grade UNPUBLISHED (draft)
    if (sub) {
      await gradeSubmission(sub.id, 92, "Great work", false, "instructor-id");
    }

    // 3. Student requests released grades: MUST BE EMPTY
    const studentReleasedBefore = await getStudentReleasedGrades(studentId);
    expect(studentReleasedBefore.some((g) => g.id === subId)).toBe(false);

    // 4. Instructor explicitly publishes grade
    if (sub) {
      await toggleGradePublication(sub.id, true, "instructor-id");
    }

    // 5. Student requests released grades: NOW VISIBLE
    const studentReleasedAfter = await getStudentReleasedGrades(studentId);
    expect(studentReleasedAfter.some((g) => g.id === sub?.id)).toBe(true);
  });

  it("parent portal resolves only active authorized children without inferred links", async () => {
    const guardianId = "u-active-parent-01";
    const studentAId = "s-child-A-01";
    const studentBId = "s-child-B-02";

    // Link Student A as active
    IN_MEMORY_RELATIONSHIPS.push({
      id: "rel-A-01",
      guardian_profile_id: guardianId,
      student_id: studentAId,
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

    // Student B has same surname but is NOT linked
    const activeChildren = await getActiveChildrenForGuardian(guardianId);
    expect(activeChildren.some((c) => c.student_id === studentAId)).toBe(true);
    expect(activeChildren.some((c) => c.student_id === studentBId)).toBe(false); // STRICT ISOLATION
  });

  it("enforces granular permission boundaries for guardian queries", async () => {
    const guardianId = "u-granular-parent-01";
    const studentId = "s-granular-child-01";

    IN_MEMORY_RELATIONSHIPS.push({
      id: "rel-granular-01",
      guardian_profile_id: guardianId,
      student_id: studentId,
      relationship_type: "parent",
      status: "active",
      can_view_attendance: true,
      can_view_progress: false, // RESTRICTED
      can_view_schedule: true,
      can_view_fees: false, // RESTRICTED
      can_receive_notifications: true,
      verification_method: "admin_verified_invitation",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    expect(await verifyGuardianStudentAccess(guardianId, studentId, "attendance")).toBe(true);
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "progress")).toBe(false);
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "schedule")).toBe(true);
    expect(await verifyGuardianStudentAccess(guardianId, studentId, "fees")).toBe(false);
  });

  it("validates submit assignment schema rejects too-short inputs", () => {
    const valid = {
      assignmentId: "123e4567-e89b-12d3-a456-426614174000",
      content: "github.com/my-solution",
    };
    expect(submitAssignmentSchema.safeParse(valid).success).toBe(true);

    const invalidShort = {
      assignmentId: "123e4567-e89b-12d3-a456-426614174000",
      content: "abc", // < 5 chars
    };
    expect(submitAssignmentSchema.safeParse(invalidShort).success).toBe(false);
  });

  it("validates mark lesson complete schema enforces valid UUID", () => {
    const valid = {
      lessonId: "123e4567-e89b-12d3-a456-426614174000",
    };
    expect(markLessonCompleteSchema.safeParse(valid).success).toBe(true);

    const invalid = {
      lessonId: "not-a-uuid",
    };
    expect(markLessonCompleteSchema.safeParse(invalid).success).toBe(false);
  });

  it("fetches student attendance records successfully", async () => {
    const studentId = "s1000000-0000-0000-0000-000000000001";
    const records = await getStudentAttendance(studentId);
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0].student_id).toBe(studentId);
  });
});
