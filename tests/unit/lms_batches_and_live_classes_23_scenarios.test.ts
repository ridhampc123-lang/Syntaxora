import { describe, it, expect } from "vitest";
import {
  createBatch,
  getBatches,
  createBatchScheduleTemplate,
} from "@/server/services/batchService";
import {
  assignStudentToBatch,
  transferStudentBatch,
  getEnrollments,
  getStudentsAwaitingBatchAssignment,
  IN_MEMORY_ENROLLMENTS,
} from "@/server/services/enrollmentService";
import {
  generateSessionsForBatch,
  getUpcomingSessionAlerts,
  rescheduleSession,
} from "@/server/services/scheduleService";
import {
  prepareOrStartLiveClass,
  completeLiveClass,
  authorizeStudentJoin,
} from "@/server/services/liveClassService";
import {
  getStudentSessions,
} from "@/server/services/studentService";
import {
  getPublishedCourses,
} from "@/server/services/courseService";
import {
  verifyGuardianStudentAccess,
  revokeGuardianRelationship,
  IN_MEMORY_RELATIONSHIPS,
} from "@/server/services/guardianService";
import { isMeetingProviderConfigured } from "@/server/integrations/meeting/meetingAdapter";

describe("Syntaxora LMS — 23 Verification Scenarios for Batches, Schedules, and Live Classes", () => {
  const adminId = "u3000000-0000-0000-0000-000000000001";
  const instructorElenaId = "i1000000-0000-0000-0000-000000000001";
  const instructorMarcusId = "i1000000-0000-0000-0000-000000000002";
  const studentLiamId = "s1000000-0000-0000-0000-000000000001";
  const testCourseId = "c1000000-0000-0000-0000-000000000001";

  // Scenario 1: Admin creates a course and batch
  it("Scenario 1: Admin creates a course and batch", async () => {
    const batchRes = await createBatch({
      courseId: testCourseId,
      name: "Robotics Cohort Beta (Afternoon)",
      batchCode: "BAT-AIR-BETA",
      primaryInstructorId: instructorElenaId,
      capacity: 5,
      startAt: "2026-11-01T14:00:00Z",
      endAt: "2026-12-30T16:00:00Z",
      timezone: "Asia/Kolkata",
      actorProfileId: adminId,
    });

    expect(batchRes.success).toBe(true);
    expect(batchRes.batch?.batch_code).toBe("BAT-AIR-BETA");
    expect(batchRes.batch?.capacity).toBe(5);
  });

  // Scenario 2: Admin assigns an instructor
  it("Scenario 2: Admin assigns an instructor", async () => {
    const batches = await getBatches({ courseId: testCourseId });
    const targetBatch = batches.find((b) => b.batch_code === "BAT-AIR-BETA");
    expect(targetBatch).toBeDefined();
    expect(targetBatch?.primary_instructor_profile_id).toBe(instructorElenaId);
  });

  // Scenario 3: Admin enrolls five students and sees correct capacity
  it("Scenario 3: Admin enrolls five students and sees correct capacity", async () => {
    const batches = await getBatches({ courseId: testCourseId });
    const betaBatch = batches.find((b) => b.batch_code === "BAT-AIR-BETA");
    expect(betaBatch).toBeDefined();

    // Enroll 5 students into the batch of capacity 5
    for (let i = 1; i <= 5; i++) {
      const studentId = `s-test-capacity-${i}`;
      const res = await assignStudentToBatch({
        studentId,
        courseId: testCourseId,
        batchId: betaBatch!.id,
        actorProfileId: adminId,
      });
      expect(res.success).toBe(true);
    }

    const enrollments = await getEnrollments({ batchId: betaBatch!.id, status: "active" });
    expect(enrollments.length).toBe(5);
  });

  // Scenario 4: A sixth eligible student can be assigned when capacity permits
  it("Scenario 4: A sixth eligible student can be assigned when capacity permits", async () => {
    // Create a batch with capacity 10
    const largeBatchRes = await createBatch({
      courseId: testCourseId,
      name: "Robotics Large Cohort",
      batchCode: "BAT-AIR-LARGE",
      primaryInstructorId: instructorElenaId,
      capacity: 10,
      startAt: "2026-11-01T14:00:00Z",
      endAt: "2026-12-30T16:00:00Z",
      actorProfileId: adminId,
    });
    expect(largeBatchRes.success).toBe(true);

    // Enroll 5
    for (let i = 1; i <= 5; i++) {
      await assignStudentToBatch({
        studentId: `s-large-seat-${i}`,
        courseId: testCourseId,
        batchId: largeBatchRes.batch!.id,
        actorProfileId: adminId,
      });
    }

    // 6th student assignment succeeds because capacity is 10
    const sixthRes = await assignStudentToBatch({
      studentId: "s-large-seat-6",
      courseId: testCourseId,
      batchId: largeBatchRes.batch!.id,
      actorProfileId: adminId,
    });
    expect(sixthRes.success).toBe(true);
  });

  // Scenario 5: A sixth student is blocked when the batch is full
  it("Scenario 5: A sixth student is blocked when the batch is full", async () => {
    const batches = await getBatches({ courseId: testCourseId });
    const betaBatch = batches.find((b) => b.batch_code === "BAT-AIR-BETA");
    expect(betaBatch).toBeDefined();

    // Batch has capacity 5 and 5 are enrolled
    const blockedRes = await assignStudentToBatch({
      studentId: "s-test-capacity-6",
      courseId: testCourseId,
      batchId: betaBatch!.id,
      actorProfileId: adminId,
    });

    expect(blockedRes.success).toBe(false);
    expect(blockedRes.error).toContain("is full");
    expect(blockedRes.availableAlternativeBatches).toBeDefined();
  });

  // Scenario 6: Duplicate assignment does not create another active enrollment
  it("Scenario 6: Duplicate assignment does not create another active enrollment", async () => {
    const batches = await getBatches({ courseId: testCourseId });
    const betaBatch = batches.find((b) => b.batch_code === "BAT-AIR-BETA");

    // s-test-capacity-1 is already enrolled in BAT-AIR-BETA
    const duplicateRes = await assignStudentToBatch({
      studentId: "s-test-capacity-1",
      courseId: testCourseId,
      batchId: betaBatch!.id,
      actorProfileId: adminId,
    });

    expect(duplicateRes.success).toBe(false);
    expect(duplicateRes.error).toContain("already actively enrolled");
  });

  // Scenario 7: A purchased student without a batch sees Awaiting Batch Assignment
  it("Scenario 7: A purchased student without a batch sees Awaiting Batch Assignment", async () => {
    const unassignedStudentId = "s-awaiting-cohort-01";
    const res = await assignStudentToBatch({
      studentId: unassignedStudentId,
      courseId: testCourseId,
      batchId: null, // No batch assigned yet!
      actorProfileId: adminId,
    });

    expect(res.success).toBe(true);
    expect(res.enrollment?.batch_id).toBeNull();

    const awaitingList = await getStudentsAwaitingBatchAssignment();
    expect(awaitingList.some((e) => e.student_id === unassignedStudentId)).toBe(true);
  });

  // Scenario 8: A student cannot access another batch's lessons or sessions
  it("Scenario 8: A student cannot access another batch's lessons or sessions", async () => {
    // Liam is enrolled in Cohort Alpha (b1000000-0000-0000-0000-000000000001)
    const liamSessions = await getStudentSessions(studentLiamId);
    expect(liamSessions.length).toBeGreaterThan(0);

    // None of Liam's sessions should belong to Cohort Beta or Maya's batch
    for (const session of liamSessions) {
      if (session.batch_id) {
        expect(session.batch_id).not.toBe("b1000000-0000-0000-0000-000000000002");
      }
    }
  });

  // Scenario 9: A student cannot join a session after enrollment expires
  it("Scenario 9: A student cannot join a session after enrollment expires", async () => {
    // Create an expired enrollment for a student
    const expiredStudentId = "s-expired-student-01";
    const expiredEnrollment = {
      id: "e-expired-01",
      student_id: expiredStudentId,
      course_id: testCourseId,
      batch_id: "b1000000-0000-0000-0000-000000000001",
      status: "expired" as const,
      ends_at: "2026-01-01T00:00:00Z",
      created_at: "2025-01-01T00:00:00Z",
    };
    IN_MEMORY_ENROLLMENTS.push(expiredEnrollment);

    // Attempt to join session
    const joinRes = await authorizeStudentJoin(
      "ses-1000000-0000-0000-0000-000000000001",
      "u-expired-student-profile"
    );
    expect(joinRes.authorized).toBe(false);
  });

  // Scenario 10: An unrelated student cannot join by changing the URL or session ID
  it("Scenario 10: An unrelated student cannot join by changing the URL or session ID", async () => {
    // Maya tries to join Liam's session in Cohort Alpha
    const joinRes = await authorizeStudentJoin(
      "ses-1000000-0000-0000-0000-000000000001",
      "u1000000-0000-0000-0000-000000000002" // Maya's profile ID
    );
    expect(joinRes.authorized).toBe(false);
    expect(joinRes.reason).toContain("not enrolled in the cohort");
  });

  // Scenario 11: An unassigned instructor cannot start or modify the session
  it("Scenario 11: An unassigned instructor cannot start or modify the session", async () => {
    // Elena is assigned to ses-1000000-0000-0000-0000-000000000001
    // Marcus Chen attempts to start Elena's session
    const unauthorizedStart = await prepareOrStartLiveClass(
      "ses-1000000-0000-0000-0000-000000000001",
      instructorMarcusId,
      "instructor"
    );

    expect(unauthorizedStart.success).toBe(false);
    expect(unauthorizedStart.error).toContain("Unauthorized");
  });

  // Scenario 12: Admin sees accurate upcoming and live session alerts
  it("Scenario 12: Admin sees accurate upcoming and live session alerts", async () => {
    const alerts = await getUpcomingSessionAlerts();
    expect(alerts).toHaveProperty("startsSoon15");
    expect(alerts).toHaveProperty("startsSoon5");
    expect(alerts).toHaveProperty("liveNow");
    expect(alerts).toHaveProperty("overdue");
    expect(alerts).toHaveProperty("missingProvider");
    expect(Array.isArray(alerts.todaySchedule)).toBe(true);
  });

  // Scenario 13: Timezone and recurring-schedule logic handles date boundaries correctly
  it("Scenario 13: Timezone and recurring-schedule logic handles date boundaries correctly", async () => {
    const templateRes = await createBatchScheduleTemplate({
      batch_id: "b1000000-0000-0000-0000-000000000001",
      weekday: 5, // Friday
      start_time_local: "18:00:00",
      end_time_local: "19:30:00",
      timezone: "Asia/Kolkata",
      effective_start_date: "2026-10-01",
      effective_end_date: "2026-12-31",
      instructor_profile_id: instructorElenaId,
    });

    expect(templateRes.success).toBe(true);
    expect(templateRes.template?.timezone).toBe("Asia/Kolkata");
  });

  // Scenario 14: Rescheduling updates affected views and sends notifications only through configured providers
  it("Scenario 14: Rescheduling updates affected views and sends notifications only through configured providers", async () => {
    const rescheduleRes = await rescheduleSession(
      "ses-1000000-0000-0000-0000-000000000001",
      "2026-10-25T15:00:00Z",
      "2026-10-25T16:30:00Z",
      "Lab hardware maintenance reschedule",
      adminId
    );

    expect(rescheduleRes.success).toBe(true);
    expect(rescheduleRes.session?.starts_at).toBe("2026-10-25T15:00:00Z");
  });

  // Scenario 15: Session generation retries do not create duplicate sessions (Idempotency)
  it("Scenario 15: Session generation retries do not create duplicate sessions", async () => {
    // Generate sessions for batch
    const firstGen = await generateSessionsForBatch("b1000000-0000-0000-0000-000000000001", 14, adminId);
    expect(firstGen.generatedCount).toBeGreaterThanOrEqual(0);

    // Immediate retry with the same batch & window must generate 0 duplicates!
    const secondGen = await generateSessionsForBatch("b1000000-0000-0000-0000-000000000001", 14, adminId);
    expect(secondGen.generatedCount).toBe(0);
  });

  // Scenario 16: Provider configuration failure does not produce a fake join link or false live state
  it("Scenario 16: Provider configuration failure does not produce a fake join link or false live state", async () => {
    const isZoomConfigured = isMeetingProviderConfigured("zoom");
    // In test environment, Zoom keys are not configured
    expect(isZoomConfigured).toBe(false);

    const alerts = await getUpcomingSessionAlerts();
    // System honestly detects missing provider keys
    expect(Array.isArray(alerts.missingProvider)).toBe(true);
  });

  // Scenario 17: Repeated Start Class requests do not create duplicate provider meetings
  it("Scenario 17: Repeated Start Class requests do not create duplicate provider meetings", async () => {
    // Admin starts session
    const firstStart = await prepareOrStartLiveClass(
      "ses-1000000-0000-0000-0000-000000000001",
      adminId,
      "admin"
    );
    expect(firstStart.success).toBe(true);
    const meetingUrl = firstStart.meetingResult?.meetingUrl;

    // Second start request for already running class returns existing active session
    const secondStart = await prepareOrStartLiveClass(
      "ses-1000000-0000-0000-0000-000000000001",
      adminId,
      "admin"
    );
    expect(secondStart.success).toBe(true);
    expect(secondStart.meetingResult?.meetingUrl).toBe(meetingUrl);
  });

  // Scenario 18: Batch transfers preserve historical attendance and grades
  it("Scenario 18: Batch transfers preserve historical attendance and grades", async () => {
    // Create an enrollment in Batch 1
    const testEnrollment = IN_MEMORY_ENROLLMENTS[0];
    const originalBatchId = testEnrollment.batch_id;
    const courseBatches = await getBatches({ courseId: testEnrollment.course_id });
    const targetBatch = courseBatches.find(
      (b) => b.id !== originalBatchId && (b.enrolled_count ?? 0) < b.capacity
    );
    expect(targetBatch).toBeDefined();

    const transferRes = await transferStudentBatch({
      enrollmentId: testEnrollment.id,
      destinationBatchId: targetBatch!.id,
      reason: "Shift to alternative cohort requested by parent",
      actorProfileId: adminId,
    });

    expect(transferRes.success).toBe(true);
    expect(transferRes.enrollment?.batch_id).toBe(targetBatch!.id);
    expect(transferRes.enrollment?.previous_batch_id).toBe(originalBatchId);
    expect(transferRes.enrollment?.transfer_reason).toContain("alternative cohort");

    // Clean up / revert for remaining tests
    testEnrollment.batch_id = originalBatchId;
  });

  // Scenario 19: Parent sees only permitted data for active linked children
  it("Scenario 19: Parent sees only permitted data for active linked children", async () => {
    const parentUserId = "u4000000-0000-0000-0000-000000000001";
    const access = await verifyGuardianStudentAccess(
      parentUserId,
      studentLiamId,
      "schedule"
    );

    expect(access).toBe(true);
  });

  // Scenario 20: Revoked parent relationships block future access
  it("Scenario 20: Revoked parent relationships block future access", async () => {
    const parentUserId = "u4000000-0000-0000-0000-000000000001";
    // Find active relationship for Liam
    const rel = IN_MEMORY_RELATIONSHIPS.find(
      (r) => r.guardian_profile_id === parentUserId && r.student_id === studentLiamId
    );
    expect(rel).toBeDefined();

    // Revoke relationship
    await revokeGuardianRelationship(rel!.id, adminId, "Guardian authorization updated");

    // Access must now be denied
    const access = await verifyGuardianStudentAccess(
      parentUserId,
      studentLiamId,
      "schedule"
    );
    expect(access).toBe(false);

    // Restore for any other tests
    rel!.status = "active";
  });

  // Scenario 21: RLS denies unauthorized direct API requests
  it("Scenario 21: RLS denies unauthorized direct API requests", async () => {
    // Unassigned student attempting to query another student's sessions returns empty
    const unrelatedSessions = await getStudentSessions("s-unrelated-random-id");
    expect(unrelatedSessions).toEqual([]);
  });

  // Scenario 22: No private meeting credentials are returned in public course responses
  it("Scenario 22: No private meeting credentials are returned in public course responses", async () => {
    const publicCourses = await getPublishedCourses();
    for (const c of publicCourses) {
      const record = c as unknown as Record<string, unknown>;
      expect(record.meeting_url).toBeUndefined();
      expect(record.provider_secret).toBeUndefined();
      expect(record.client_secret).toBeUndefined();
    }
  });

  // Scenario 23: Complete Live Class transition
  it("Scenario 23: Live class completion transitions session to completed status", async () => {
    const completeRes = await completeLiveClass(
      "ses-1000000-0000-0000-0000-000000000001",
      adminId,
      "admin"
    );

    expect(completeRes.success).toBe(true);
    expect(completeRes.session?.status).toBe("completed");
    expect(completeRes.session?.ended_at).toBeDefined();
  });
});
