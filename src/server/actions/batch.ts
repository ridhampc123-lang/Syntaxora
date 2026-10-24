"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/services/authService";
import {
  createBatchSchema,
  assignStudentSchema,
  transferBatchSchema,
} from "@/lib/validation/batch";
import {
  createBatch,
  updateBatchStatus,
} from "@/server/services/batchService";
import { BatchStatus } from "@/types";
import {
  assignStudentToBatch,
  transferStudentBatch,
} from "@/server/services/enrollmentService";
import {
  generateSessionsForBatch,
  rescheduleSession,
} from "@/server/services/scheduleService";
import {
  prepareOrStartLiveClass,
  completeLiveClass,
  authorizeStudentJoin,
} from "@/server/services/liveClassService";

export interface BatchActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: unknown;
}

export async function createBatchAction(
  prevState: BatchActionResult | null,
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    courseId: formData.get("courseId")?.toString(),
    name: formData.get("name")?.toString(),
    batchCode: formData.get("batchCode")?.toString(),
    primaryInstructorId: formData.get("primaryInstructorId")?.toString(),
    capacity: formData.get("capacity"),
    startAt: formData.get("startAt")?.toString(),
    endAt: formData.get("endAt")?.toString(),
    timezone: formData.get("timezone")?.toString() || "Asia/Kolkata",
    waitlistEnabled: formData.get("waitlistEnabled") === "true",
    waitlistCapacity: formData.get("waitlistCapacity") || 0,
  };

  const validation = createBatchSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return { success: false, message: "Validation error", errors };
  }

  const result = await createBatch({
    ...validation.data,
    actorProfileId: actor.userId,
  });

  if (!result.success) {
    return { success: false, message: result.error || "Failed to create batch" };
  }

  revalidatePath("/admin/batches");
  revalidatePath("/admin/courses");
  revalidatePath("/admin/enrollments");

  return {
    success: true,
    message: `Batch ${result.batch?.batch_code} created successfully with ${result.batch?.capacity} seats.`,
    data: result.batch,
  };
}

export async function updateBatchStatusAction(
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);
  const batchId = formData.get("batchId")?.toString() || "";
  const status = formData.get("status")?.toString() as BatchStatus;

  if (!batchId || !status) {
    return { success: false, message: "Missing batch ID or status." };
  }

  const result = await updateBatchStatus(batchId, status, actor.userId);
  if (!result.success) {
    return { success: false, message: result.error || "Failed to update batch status" };
  }

  revalidatePath("/admin/batches");
  revalidatePath(`/admin/batches/${batchId}`);
  return { success: true, message: `Batch status transitioned to ${status}.` };
}

export async function assignStudentAction(
  prevState: BatchActionResult | null,
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    studentId: formData.get("studentId")?.toString(),
    courseId: formData.get("courseId")?.toString(),
    batchId: formData.get("batchId")?.toString() || null,
    admissionSource: formData.get("admissionSource")?.toString() || "direct_admission",
    paymentStatus: formData.get("paymentStatus")?.toString() || "verified",
  };

  const validation = assignStudentSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return { success: false, message: "Validation error", errors };
  }

  const result = await assignStudentToBatch({
    ...validation.data,
    actorProfileId: actor.userId,
  });

  if (!result.success) {
    return {
      success: false,
      message: result.error || "Failed to assign student to batch.",
      data: { availableAlternativeBatches: result.availableAlternativeBatches },
    };
  }

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/batches");
  revalidatePath("/admin/students");

  return {
    success: true,
    message: "Student successfully assigned and enrolled in cohort.",
    data: result.enrollment,
  };
}

export async function transferStudentBatchAction(
  prevState: BatchActionResult | null,
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    enrollmentId: formData.get("enrollmentId")?.toString(),
    destinationBatchId: formData.get("destinationBatchId")?.toString(),
    reason: formData.get("reason")?.toString(),
  };

  const validation = transferBatchSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return { success: false, message: "Validation error", errors };
  }

  const result = await transferStudentBatch({
    enrollmentId: validation.data.enrollmentId,
    destinationBatchId: validation.data.destinationBatchId,
    reason: validation.data.reason,
    actorProfileId: actor.userId,
  });

  if (!result.success) {
    return { success: false, message: result.error || "Failed to transfer batch." };
  }

  revalidatePath("/admin/enrollments");
  revalidatePath("/admin/batches");

  return {
    success: true,
    message: "Student batch transfer executed successfully with historical records preserved.",
    data: result.enrollment,
  };
}

export async function generateBatchSessionsAction(
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);
  const batchId = formData.get("batchId")?.toString() || "";
  const windowDays = Number(formData.get("windowDays")) || 30;

  if (!batchId) {
    return { success: false, message: "Missing batch ID." };
  }

  const result = await generateSessionsForBatch(batchId, windowDays, actor.userId);
  if (result.error) {
    return { success: false, message: result.error };
  }

  revalidatePath("/admin/batches");
  revalidatePath("/admin/live-classes");
  revalidatePath(`/admin/batches/${batchId}`);

  return {
    success: true,
    message: `Generated ${result.generatedCount} class sessions for the next ${windowDays} days.`,
    data: { count: result.generatedCount },
  };
}

export async function startLiveClassAction(
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin", "instructor"]);
  const sessionId = formData.get("sessionId")?.toString() || "";

  if (!sessionId) {
    return { success: false, message: "Missing class session ID." };
  }

  const result = await prepareOrStartLiveClass(sessionId, actor.userId, actor.profile.role);
  if (!result.success) {
    return { success: false, message: result.error || "Failed to start live class." };
  }

  revalidatePath("/admin/live-classes");
  revalidatePath("/instructor/sessions");
  revalidatePath("/student/classes");

  return {
    success: true,
    message: "Live class started successfully. Meeting room active.",
    data: result,
  };
}

export async function completeLiveClassAction(
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin", "instructor"]);
  const sessionId = formData.get("sessionId")?.toString() || "";

  if (!sessionId) {
    return { success: false, message: "Missing class session ID." };
  }

  const result = await completeLiveClass(sessionId, actor.userId, actor.profile.role);
  if (!result.success) {
    return { success: false, message: result.error || "Failed to complete live class." };
  }

  revalidatePath("/admin/live-classes");
  revalidatePath("/instructor/sessions");
  revalidatePath("/student/classes");

  return {
    success: true,
    message: "Live class ended. Attendance records are now ready for finalization.",
  };
}

export async function requestStudentJoinAccessAction(
  sessionId: string
): Promise<{ success: boolean; meetingUrl?: string | null; title?: string; error?: string }> {
  const actor = await requireRole(["student", "admin"]);
  const result = await authorizeStudentJoin(sessionId, actor.userId);

  if (!result.authorized) {
    return { success: false, error: result.reason || "Unauthorized to enter classroom." };
  }

  return {
    success: true,
    meetingUrl: result.meetingUrl,
    title: result.sessionTitle,
  };
}

export async function rescheduleSessionAction(
  prevState: BatchActionResult | null,
  formData: FormData
): Promise<BatchActionResult> {
  const actor = await requireRole(["admin"]);
  const sessionId = formData.get("sessionId")?.toString() || "";
  const newStartsAt = formData.get("newStartsAt")?.toString() || "";
  const newEndsAt = formData.get("newEndsAt")?.toString() || "";
  const reason = formData.get("reason")?.toString() || "";

  if (!sessionId || !newStartsAt || !newEndsAt) {
    return { success: false, message: "Missing session ID or rescheduled dates." };
  }

  const result = await rescheduleSession(sessionId, newStartsAt, newEndsAt, reason, actor.userId);
  if (!result.success) {
    return { success: false, message: result.error || "Failed to reschedule session." };
  }

  revalidatePath("/admin/live-classes");
  revalidatePath("/instructor/sessions");
  revalidatePath("/student/classes");

  return {
    success: true,
    message: "Class session rescheduled successfully. All affected portals updated.",
  };
}
