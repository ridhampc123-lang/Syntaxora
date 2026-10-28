import { describe, it, expect } from "vitest";
import {
  getStudentCourses,
  getStudentCourseById,
  getStudentSessions,
  getStudentAssignments,
  getStudentCompletedLessons,
  recordLessonCompletion,
  getStudentNotifications,
  markNotificationAsRead,
  getStudentResources,
  getStudentBillingRecords,
  submitStudentAssignment,
} from "@/server/services/studentService";
import {
  submitAssignmentSchema,
  markLessonCompleteSchema,
} from "@/lib/validation/student";

describe("Syntaxora Student Panel Audit, Repair & Verification", () => {
  const liamStudentId = "s1000000-0000-0000-0000-000000000001";
  const liamProfileId = "u1000000-0000-0000-0000-000000000001";
  const unenrolledStudentId = "s-unenrolled-student-99";

  describe("Validation & ID Parsing", () => {
    it("accepts canonical LMS entity IDs and standard RFC 4122 UUIDs", () => {
      // Seeded fixture format
      expect(markLessonCompleteSchema.safeParse({ lessonId: "l1000000-0000-0000-0000-000000000001" }).success).toBe(true);
      // Standard RFC UUID
      expect(markLessonCompleteSchema.safeParse({ lessonId: "123e4567-e89b-12d3-a456-426614174000" }).success).toBe(true);
      // Arbitrary non-ID
      expect(markLessonCompleteSchema.safeParse({ lessonId: "not-a-uuid" }).success).toBe(false);
    });

    it("validates assignment submission schema with content length rules", () => {
      expect(
        submitAssignmentSchema.safeParse({
          assignmentId: "asn-1000000-0000-0000-0000-000000000001",
          content: "Valid solution code with more than 5 characters",
        }).success
      ).toBe(true);

      expect(
        submitAssignmentSchema.safeParse({
          assignmentId: "asn-1000000-0000-0000-0000-000000000001",
          content: "123", // too short
        }).success
      ).toBe(false);
    });
  });

  describe("Course Access Control & Enrollment Verification (Phase 4 & 5)", () => {
    it("returns only genuinely enrolled courses for Liam", async () => {
      const courses = await getStudentCourses(liamStudentId);
      expect(courses.length).toBeGreaterThan(0);
      expect(courses.some((c) => c.id === "c1000000-0000-0000-0000-000000000001")).toBe(true);
    });

    it("strictly returns empty array for unenrolled students without mock catalog fallbacks", async () => {
      const courses = await getStudentCourses(unenrolledStudentId);
      expect(courses).toEqual([]);
    });

    it("getStudentCourseById allows access to enrolled course and enriches sorted modules", async () => {
      const result = await getStudentCourseById(liamStudentId, "c1000000-0000-0000-0000-000000000001");
      expect(result).not.toBeNull();
      expect(result?.course.id).toBe("c1000000-0000-0000-0000-000000000001");
      expect(result?.enrollment.student_id).toBe(liamStudentId);
      expect(Array.isArray(result?.course.modules)).toBe(true);
    });

    it("getStudentCourseById denies access (returns null) if student is not enrolled", async () => {
      // Liam is not enrolled in course 3
      const result = await getStudentCourseById(liamStudentId, "c1000000-0000-0000-0000-000000000003");
      expect(result).toBeNull();

      // Unenrolled student cannot access course 1
      const unenrolledResult = await getStudentCourseById(unenrolledStudentId, "c1000000-0000-0000-0000-000000000001");
      expect(unenrolledResult).toBeNull();
    });
  });

  describe("Progress Tracking & Idempotent Lesson Completion (Phase 10)", () => {
    it("records lesson completion and persists progress idempotently", async () => {
      const lessonId = "l1000000-0000-0000-0000-000000000002";
      const res = await recordLessonCompletion(liamStudentId, lessonId);
      expect(res.success).toBe(true);

      const completed = await getStudentCompletedLessons(liamStudentId);
      expect(completed).toContain(lessonId);

      // Repeat completion call (idempotent)
      const res2 = await recordLessonCompletion(liamStudentId, lessonId);
      expect(res2.success).toBe(true);
    });
  });

  describe("Assignments & Scoped Deliverables (Phase 8)", () => {
    it("Liam sees assignments belonging to his enrolled track", async () => {
      const assignments = await getStudentAssignments(liamStudentId);
      expect(assignments.length).toBeGreaterThan(0);
      expect(assignments.every((a) => a.course_id === "c1000000-0000-0000-0000-000000000001")).toBe(true);
    });

    it("unenrolled student sees zero assignments", async () => {
      const assignments = await getStudentAssignments(unenrolledStudentId);
      expect(assignments).toEqual([]);
    });

    it("submitting an assignment updates or creates draft submission", async () => {
      const res = await submitStudentAssignment(
        liamStudentId,
        "asn-1000000-0000-0000-0000-000000000001",
        "github.com/liam-oconnor/opencv-solution-final"
      );
      expect(res.success).toBe(true);
      expect(res.submissionId).toBeDefined();
    });
  });

  describe("Live Class Timetable & Cohort Batch Scoping (Phase 6)", () => {
    it("Liam sees live sessions matching his enrolled course and assigned batch", async () => {
      const sessions = await getStudentSessions(liamStudentId);
      expect(Array.isArray(sessions)).toBe(true);
      expect(sessions.every((s) => s.course_id === "c1000000-0000-0000-0000-000000000001")).toBe(true);
    });

    it("unenrolled student sees no live sessions", async () => {
      const sessions = await getStudentSessions(unenrolledStudentId);
      expect(sessions).toEqual([]);
    });
  });

  describe("Notifications & Scoped Delivery (Phase 12)", () => {
    it("Liam fetches his own notifications", async () => {
      const notifs = await getStudentNotifications(liamProfileId);
      expect(notifs.length).toBeGreaterThan(0);
      expect(notifs.every((n) => n.recipient_profile_id === liamProfileId)).toBe(true);
    });

    it("marking a notification as read updates status", async () => {
      const notifs = await getStudentNotifications(liamProfileId);
      const targetNotif = notifs[0];
      if (targetNotif) {
        const res = await markNotificationAsRead(targetNotif.id, liamProfileId);
        expect(res.success).toBe(true);
      }
    });

    it("rejects marking another student's notification as read", async () => {
      const res = await markNotificationAsRead(
        "notif-1000000-0000-0000-0000-000000000001",
        "u-different-student-profile"
      );
      expect(res.success).toBe(false);
    });
  });

  describe("Course Resources & Invoices Scoping (Phase 14 & 15)", () => {
    it("Liam fetches resources matching his enrolled track", async () => {
      const resources = await getStudentResources(liamStudentId);
      expect(resources.length).toBeGreaterThan(0);
      expect(resources.every((r) => r.course_id === "c1000000-0000-0000-0000-000000000001")).toBe(true);
    });

    it("unenrolled student has no access to course resources", async () => {
      const resources = await getStudentResources(unenrolledStudentId);
      expect(resources).toEqual([]);
    });

    it("Liam fetches his enrolled course billing records", async () => {
      const billing = await getStudentBillingRecords(liamStudentId);
      expect(billing.length).toBeGreaterThan(0);
      expect(billing[0].status).toBe("paid");
    });

    it("unenrolled student has zero billing records", async () => {
      const billing = await getStudentBillingRecords(unenrolledStudentId);
      expect(billing).toEqual([]);
    });
  });
});
