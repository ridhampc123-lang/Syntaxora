"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/services/authService";
import { CourseLevel, AudienceGroup, DeliveryMode, StudentStatus, AttendanceStatus } from "@/types";
import {
  createStudentSchema,
  createCourseSchema,
  attendanceCorrectionSchema,
} from "@/lib/validation/admin";

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

// Helper to record immutable audit log entries
export async function logAuditEvent(
  actorProfileId: string | null,
  action: string,
  entityType: string,
  entityId?: string | null,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_logs").insert({
      actor_profile_id: actorProfileId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details: details || {},
    });
  } catch (err) {
    console.error("[Audit Log Failed]", { action, entityType, err });
  }
}

export async function createStudentAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    dateOfBirth: formData.get("dateOfBirth")?.toString() || "",
    emergencyPhone: formData.get("emergencyPhone")?.toString() || "",
    notes: formData.get("notes")?.toString() || "",
  };

  const validation = createStudentSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return { success: false, message: "Validation error", errors };
  }

  try {
    const supabase = await createClient();

    // Generate unique random student code e.g. STU-9A4B2C1D
    const randomSuffix = Math.random().toString(36).substring(2, 10).toUpperCase();
    const studentCode = `STU-${randomSuffix}`;

    const { data: student, error } = await supabase
      .from("students")
      .insert({
        student_code: studentCode,
        date_of_birth: validation.data.dateOfBirth || null,
        emergency_contact_phone: validation.data.emergencyPhone || null,
        status: "active" as StudentStatus,
        notes: validation.data.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "STUDENT_CREATED", "STUDENT", student.id, {
      student_code: studentCode,
      name: validation.data.fullName,
    });

    revalidatePath("/admin/students");
    return {
      success: true,
      message: `Student successfully created with student code ${studentCode}.`,
    };
  } catch (err) {
    console.error("[Create Student Error]", err);
    return {
      success: false,
      message: "An unexpected error occurred while creating student.",
    };
  }
}

export async function createCourseAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    title: formData.get("title")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    summary: formData.get("summary")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    level: formData.get("level")?.toString() || "beginner",
    audienceGroup: formData.get("audienceGroup")?.toString() || "teens",
    deliveryMode: formData.get("deliveryMode")?.toString() || "live_online",
    durationWeeks: formData.get("durationWeeks")?.toString() || "8",
    priceInDollars: formData.get("priceInDollars")?.toString() || "0",
  };

  const validation = createCourseSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return { success: false, message: "Validation error", errors };
  }

  try {
    const supabase = await createClient();
    const priceInCents = Math.round(validation.data.priceInDollars * 100);

    const { data: course, error } = await supabase
      .from("courses")
      .insert({
        title: validation.data.title,
        slug: validation.data.slug,
        summary: validation.data.summary,
        description: validation.data.description,
        level: validation.data.level as CourseLevel,
        audience_group: validation.data.audienceGroup as AudienceGroup,
        delivery_mode: validation.data.deliveryMode as DeliveryMode,
        duration_weeks: validation.data.durationWeeks,
        price_in_cents: priceInCents,
        currency: "USD",
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "COURSE_CREATED", "COURSE", course.id, {
      title: validation.data.title,
      slug: validation.data.slug,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return {
      success: true,
      message: `Course "${validation.data.title}" created as draft.`,
    };
  } catch (err) {
    console.error("[Create Course Error]", err);
    return { success: false, message: "Failed to create course." };
  }
}

export async function toggleCoursePublishAction(
  courseId: string,
  currentStatus: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  try {
    const supabase = await createClient();
    const nextStatus = currentStatus === "published" ? "draft" : "published";
    const publishedAt = nextStatus === "published" ? new Date().toISOString() : null;

    const { error } = await supabase
      .from("courses")
      .update({
        status: nextStatus,
        published_at: publishedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "COURSE_STATUS_TOGGLED", "COURSE", courseId, {
      previous_status: currentStatus,
      new_status: nextStatus,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return {
      success: true,
      message: `Course is now ${nextStatus}.`,
    };
  } catch (err) {
    console.error("[Toggle Course Error]", err);
    return { success: false, message: "Failed to update course status." };
  }
}

export async function correctAttendanceAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin", "instructor"]);

  const rawData = {
    attendanceId: formData.get("attendanceId")?.toString() || "",
    newStatus: formData.get("newStatus")?.toString() || "present",
    correctionReason: formData.get("correctionReason")?.toString() || "",
  };

  const validation = attendanceCorrectionSchema.safeParse(rawData);
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.issues[0]?.message || "Validation failed",
    };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("attendance_records")
      .update({
        status: validation.data.newStatus as AttendanceStatus,
        correction_reason: validation.data.correctionReason,
        recorded_by_profile_id: actor.userId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", validation.data.attendanceId);

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "ATTENDANCE_CORRECTED", "ATTENDANCE", validation.data.attendanceId, {
      new_status: validation.data.newStatus,
      reason: validation.data.correctionReason,
    });

    revalidatePath("/admin/attendance");
    revalidatePath("/instructor/attendance");
    return {
      success: true,
      message: "Attendance successfully updated and recorded in audit log.",
    };
  } catch (err) {
    console.error("[Attendance Correction Error]", err);
    return { success: false, message: "Failed to correct attendance." };
  }
}
