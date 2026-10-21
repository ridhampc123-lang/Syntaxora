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
