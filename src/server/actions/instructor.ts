"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/server/services/authService";
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
  createAssignment,
  gradeSubmission,
  toggleGradePublication,
} from "@/server/services/instructorService";
import { AttendanceStatus } from "@/types";

export async function createClassSessionAction(formData: FormData) {
  try {
    const user = await requireRole(["instructor", "admin"]);

    const rawInput = {
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      startsAt: formData.get("startsAt"),
      endsAt: formData.get("endsAt"),
      meetingProvider: formData.get("meetingProvider") || "live_webrtc",
      meetingUrl: formData.get("meetingUrl") || undefined,
    };

    const parsed = createSessionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid session payload",
      };
    }

    const result = await createClassSession({
      courseId: parsed.data.courseId,
      instructorProfileId: user.userId,
      title: parsed.data.title,
      description: parsed.data.description,
      startsAt: parsed.data.startsAt,
      endsAt: parsed.data.endsAt,
      meetingProvider: parsed.data.meetingProvider,
      meetingUrl: parsed.data.meetingUrl,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/instructor/sessions");
    revalidatePath("/instructor");

    return { success: true, sessionId: result.session?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to schedule class session";
    return { success: false, error: msg };
  }
}

export async function recordAttendanceAction(formData: FormData) {
  try {
    const user = await requireRole(["instructor", "admin"]);

    const rawInput = {
      sessionId: formData.get("sessionId"),
      studentId: formData.get("studentId"),
      status: formData.get("status"),
      correctionReason: formData.get("correctionReason") || undefined,
    };

    const parsed = recordAttendanceSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid attendance payload",
      };
    }

    const result = await recordStudentAttendance(
      parsed.data.sessionId,
      parsed.data.studentId,
      parsed.data.status as AttendanceStatus,
      user.userId,
      parsed.data.correctionReason
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/instructor/attendance");
    revalidatePath("/admin/attendance");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record attendance";
    return { success: false, error: msg };
  }
}

export async function createAssignmentAction(formData: FormData) {
  try {
    const user = await requireRole(["instructor", "admin"]);

    const rawInput = {
      courseId: formData.get("courseId"),
      title: formData.get("title"),
      description: formData.get("description"),
      dueAt: formData.get("dueAt"),
      maxScore: Number(formData.get("maxScore") || 100),
    };

    const parsed = createAssignmentSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid assignment payload",
      };
    }

    const result = await createAssignment({
      courseId: parsed.data.courseId,
      title: parsed.data.title,
      description: parsed.data.description,
      dueAt: parsed.data.dueAt,
      maxScore: parsed.data.maxScore,
      instructorProfileId: user.userId,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/instructor/assignments");
    revalidatePath("/instructor");

    return { success: true, assignmentId: result.assignment?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to create assignment";
    return { success: false, error: msg };
  }
}

export async function gradeSubmissionAction(formData: FormData) {
  try {
    const user = await requireRole(["instructor", "admin"]);

    const rawInput = {
      submissionId: formData.get("submissionId"),
      score: Number(formData.get("score")),
      feedback: formData.get("feedback"),
      isGradePublished: formData.get("isGradePublished") === "true",
    };

    const parsed = gradeSubmissionSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid grading payload",
      };
    }

    const result = await gradeSubmission(
      parsed.data.submissionId,
      parsed.data.score,
      parsed.data.feedback,
      parsed.data.isGradePublished,
      user.userId
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/instructor/submissions");
    revalidatePath("/student");
    revalidatePath("/parent");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record grade";
    return { success: false, error: msg };
  }
}

export async function toggleGradePublicationAction(formData: FormData) {
  try {
    const user = await requireRole(["instructor", "admin"]);

    const rawInput = {
      submissionId: formData.get("submissionId"),
      isGradePublished: formData.get("isGradePublished") === "true",
    };

    const parsed = toggleGradePublicationSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message || "Invalid publication payload",
      };
    }

    const result = await toggleGradePublication(
      parsed.data.submissionId,
      parsed.data.isGradePublished,
      user.userId
    );

    if (!result.success) {
      return { success: false, error: result.error };
    }

    revalidatePath("/instructor/submissions");
    revalidatePath("/student");
    revalidatePath("/parent");

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update grade publication";
    return { success: false, error: msg };
  }
}
