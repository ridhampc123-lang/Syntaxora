import { describe, it, expect } from "vitest";
import {
  createSessionSchema,
  recordAttendanceSchema,
  createAssignmentSchema,
  gradeSubmissionSchema,
  toggleGradePublicationSchema,
} from "@/lib/validation/instructor";
import {
  createClassSession,
  recordStudentAttendance,
  gradeSubmission,
  toggleGradePublication,
  IN_MEMORY_SESSIONS,
  IN_MEMORY_ATTENDANCE,
  IN_MEMORY_SUBMISSIONS,
} from "@/server/services/instructorService";

describe("Phase 5: Instructor & Class Operations", () => {
  it("enforces chronological bounds on class session scheduling", () => {
    const valid = {
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Edge AI Lab: OpenCV",
      description: "Real-time video streaming",
      startsAt: "2026-10-25T14:00:00Z",
      endsAt: "2026-10-25T15:30:00Z", // After start
      meetingProvider: "live_webrtc" as const,
    };
    expect(createSessionSchema.safeParse(valid).success).toBe(true);

    const invalidInvertedTimes = {
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Edge AI Lab: OpenCV",
      startsAt: "2026-10-25T15:30:00Z",
      endsAt: "2026-10-25T14:00:00Z", // Invalid: ends before starts
      meetingProvider: "live_webrtc" as const,
    };
    const res = createSessionSchema.safeParse(invalidInvertedTimes);
    expect(res.success).toBe(false);
  });

  it("creates class session and validates chronological integrity in service", async () => {
    const invalidRes = await createClassSession({
      courseId: "c1000000-0000-0000-0000-000000000001",
      instructorProfileId: "i1000000-0000-0000-0000-000000000001",
      title: "Invalid Session",
      startsAt: "2026-10-26T16:00:00Z",
      endsAt: "2026-10-26T15:00:00Z",
    });
    expect(invalidRes.success).toBe(false);
    expect(invalidRes.error).toContain("chronologically after");

    const validRes = await createClassSession({
      courseId: "c1000000-0000-0000-0000-000000000001",
      instructorProfileId: "i1000000-0000-0000-0000-000000000001",
      title: "Computer Vision Model Evaluation",
      startsAt: "2026-10-27T14:00:00Z",
      endsAt: "2026-10-27T15:30:00Z",
    });
    expect(validRes.success).toBe(true);
    expect(validRes.session).toBeDefined();
    expect(IN_MEMORY_SESSIONS.some((s) => s.id === validRes.session?.id)).toBe(true);
  });

  it("validates attendance recording schema with valid enum statuses", () => {
    const valid = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
      studentId: "123e4567-e89b-12d3-a456-426614174001",
      status: "present" as const,
    };
    expect(recordAttendanceSchema.safeParse(valid).success).toBe(true);

    const invalidStatus = {
      sessionId: "123e4567-e89b-12d3-a456-426614174000",
      studentId: "123e4567-e89b-12d3-a456-426614174001",
      status: "unknown_status",
    };
    expect(recordAttendanceSchema.safeParse(invalidStatus).success).toBe(false);
  });

  it("records attendance and preserves correction reason on updates", async () => {
    const sessionId = "ses-test-att-01";
    const studentId = "stu-test-att-01";
    const instructorId = "i1000000-0000-0000-0000-000000000001";

    // 1. Initial attendance record: absent
    const res1 = await recordStudentAttendance(sessionId, studentId, "absent", instructorId);
    expect(res1.success).toBe(true);

    const initial = IN_MEMORY_ATTENDANCE.find(
      (a) => a.class_session_id === sessionId && a.student_id === studentId
    );
    expect(initial?.status).toBe("absent");

    // 2. Correction to excused with audit reason
    const correctionReason = "Guardian called with medical clinic notice";
    const res2 = await recordStudentAttendance(
      sessionId,
      studentId,
      "excused",
      instructorId,
      correctionReason
    );
    expect(res2.success).toBe(true);

    const updated = IN_MEMORY_ATTENDANCE.find(
      (a) => a.class_session_id === sessionId && a.student_id === studentId
    );
    expect(updated?.status).toBe("excused");
    expect(updated?.correction_reason).toBe(correctionReason);
  });

  it("validates assignment creation schema", () => {
    const valid = {
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Neural Network Classification Project",
      description: "Implement a multi-layer perceptron for digit classification using PyTorch.",
      dueAt: "2026-11-01T23:59:59Z",
      maxScore: 100,
    };
    expect(createAssignmentSchema.safeParse(valid).success).toBe(true);

    const invalidShortDesc = {
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      title: "Project",
      description: "Short", // < 10 chars
      dueAt: "2026-11-01T23:59:59Z",
    };
    expect(createAssignmentSchema.safeParse(invalidShortDesc).success).toBe(false);
  });

  it("enforces explicit grade publication workflow (draft until published)", async () => {
    const submissionId = "sub-test-grade-01";
    const graderId = "i1000000-0000-0000-0000-000000000001";

    // Setup submission
    IN_MEMORY_SUBMISSIONS.push({
      id: submissionId,
      assignment_id: "asn-1000000-0000-0000-0000-000000000001",
      student_id: "s1000000-0000-0000-0000-000000000001",
      content: "github.com/student/repo",
      status: "submitted",
      score: null,
      feedback: null,
      is_grade_published: false,
      submitted_at: new Date().toISOString(),
    });

    // 1. Grade saved as draft: isGradePublished = false
    const gradeRes = await gradeSubmission(
      submissionId,
      88,
      "Solid architecture and clean unit test suite.",
      false, // DRAFT
      graderId
    );
    expect(gradeRes.success).toBe(true);

    const draft = IN_MEMORY_SUBMISSIONS.find((s) => s.id === submissionId);
    expect(draft?.score).toBe(88);
    expect(draft?.is_grade_published).toBe(false);

    // 2. Publish grade explicitly
    const pubRes = await toggleGradePublication(submissionId, true, graderId);
    expect(pubRes.success).toBe(true);

    const published = IN_MEMORY_SUBMISSIONS.find((s) => s.id === submissionId);
    expect(published?.is_grade_published).toBe(true);

    // 3. Unpublish back to draft
    const unpubRes = await toggleGradePublication(submissionId, false, graderId);
    expect(unpubRes.success).toBe(true);

    const unpublished = IN_MEMORY_SUBMISSIONS.find((s) => s.id === submissionId);
    expect(unpublished?.is_grade_published).toBe(false);
  });

  it("validates grade submission schema rejects negative scores", () => {
    const invalidNegative = {
      submissionId: "123e4567-e89b-12d3-a456-426614174000",
      score: -10, // Invalid
      feedback: "Needs improvement",
      isGradePublished: false,
    };
    expect(gradeSubmissionSchema.safeParse(invalidNegative).success).toBe(false);

    const valid = {
      submissionId: "123e4567-e89b-12d3-a456-426614174000",
      score: 95,
      feedback: "Outstanding work on OpenCV pipeline",
      isGradePublished: true,
    };
    expect(gradeSubmissionSchema.safeParse(valid).success).toBe(true);
    expect(toggleGradePublicationSchema.safeParse({ submissionId: "123e4567-e89b-12d3-a456-426614174000", isGradePublished: true }).success).toBe(true);
  });
});
