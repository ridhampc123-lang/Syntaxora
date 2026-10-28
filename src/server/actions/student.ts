"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/services/authService";
import {
  submitAssignmentSchema,
  markLessonCompleteSchema,
} from "@/lib/validation/student";
import {
  getStudentByProfileId,
  submitStudentAssignment,
  recordLessonCompletion,
} from "@/server/services/studentService";

export async function submitAssignmentAction(formData: FormData) {
  try {
    const auth = await requireRole(["student", "admin"]);
    const student = await getStudentByProfileId(auth.userId);

    if (!student) {
      return { success: false, error: "No active student record linked to this account" };
    }

    const rawInput = {
      assignmentId: formData.get("assignmentId"),
      content: formData.get("content"),
      attachmentUrl: formData.get("attachmentUrl") || undefined,
    };

    const parsed = submitAssignmentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid submission payload",
      };
    }

    const result = await submitStudentAssignment(
      student.id,
      parsed.data.assignmentId,
      parsed.data.content,
      parsed.data.attachmentUrl
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/student/assignments");
    revalidatePath("/student");
    revalidatePath("/instructor/submissions");

    return { success: true, submissionId: result.submissionId };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit assignment";
    return { success: false, error: msg };
  }
}

export async function markLessonCompleteAction(formData: FormData) {
  try {
    const auth = await requireRole(["student", "admin"]);
    const student = await getStudentByProfileId(auth.userId);

    if (!student) {
      return { success: false, error: "No active student record linked to this account" };
    }

    const rawInput = {
      lessonId: formData.get("lessonId"),
    };

    const parsed = markLessonCompleteSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid lesson ID",
      };
    }

    const result = await recordLessonCompletion(student.id, parsed.data.lessonId);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/student/courses");
    revalidatePath("/student");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record lesson progress";
    return { success: false, error: msg };
  }
}

export async function markNotificationAsReadAction(formData: FormData): Promise<void> {
  try {
    const auth = await requireRole(["student", "admin"]);
    const notificationId = formData.get("notificationId")?.toString();

    if (notificationId) {
      const { markNotificationAsRead } = await import("@/server/services/studentService");
      const result = await markNotificationAsRead(notificationId, auth.userId);

      if (result.success) {
        revalidatePath("/student/notifications");
        revalidatePath("/student");
      }
    }
  } catch {
    // Non-throwing form action
  }
}

export async function submitStudentQueryAction(formData: FormData): Promise<void> {
  try {
    const auth = await requireRole(["student", "admin"]);
    const subject = formData.get("subject")?.toString()?.trim();
    const category = formData.get("category")?.toString() || "academic";
    const message = formData.get("message")?.toString()?.trim();

    if (subject && message) {
      const { logAuditEvent } = await import("@/server/actions/admin");
      await logAuditEvent(
        auth.userId,
        "STUDENT_SUPPORT_QUERY_SUBMITTED",
        "SUPPORT",
        undefined,
        {
          email: auth.email,
          subject,
          category,
          message,
        }
      );

      revalidatePath("/student/support");
    }
  } catch {
    // Non-throwing form action
  }
}

export async function submitStudentLeaveNoticeAction(formData: FormData) {
  try {
    const auth = await requireRole(["student", "admin"]);
    const student = await getStudentByProfileId(auth.userId);

    if (!student) {
      return { success: false, error: "No active student record linked to this account" };
    }

    const startDate = formData.get("startDate")?.toString();
    const endDate = formData.get("endDate")?.toString();
    const reasonCategory = formData.get("reasonCategory")?.toString() || "academic_conflict";
    const explanation = formData.get("explanation")?.toString() || "";

    if (!startDate || !endDate || !explanation.trim()) {
      return { success: false, error: "Please provide start date, end date, and an explanation." };
    }

    // In-memory or audit recording
    const { logAuditEvent } = await import("@/server/actions/admin");
    await logAuditEvent(
      auth.userId,
      "STUDENT_LEAVE_FILED",
      "ATTENDANCE",
      student.id,
      {
        student_id: student.id,
        start_date: startDate,
        end_date: endDate,
        category: reasonCategory,
        explanation: explanation.trim(),
      }
    );

    revalidatePath("/student/attendance");
    revalidatePath("/student");

    return {
      success: true,
      message: "Leave notification recorded. Your instructor has been notified of your absence.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record absence notification";
    return { success: false, error: msg };
  }
}
