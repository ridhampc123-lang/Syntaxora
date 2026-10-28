"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/server/services/authService";
import { CourseLevel, AudienceGroup, DeliveryMode, StudentStatus, AttendanceStatus } from "@/types";
import {
  createStudentSchema,
  createCourseSchema,
  updateCourseDetailsSchema,
  addCourseModuleSchema,
  updateCourseModuleSchema,
  addLessonSchema,
  attendanceCorrectionSchema,
  createInstructorSchema,
  updateInstructorSchema,
} from "@/lib/validation/admin";
import {
  createInstructor,
  updateInstructor,
  deleteInstructor,
} from "@/server/services/instructorService";
import {
  createCourse,
  updateCourse,
  deleteCourse,
  toggleCoursePublishStatus,
  addCourseModule,
  updateCourseModule,
  deleteCourseModule,
  addLessonToModule,
  deleteLessonFromModule,
} from "@/server/services/courseService";

export interface ActionResult {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  courseId?: string;
  studentCode?: string;
  temporaryPassword?: string;
  assignedBatch?: string;
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

export async function updateStudentStatusAction(
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);
  const studentId = formData.get("studentId")?.toString();
  const status = formData.get("status")?.toString() as StudentStatus;

  if (!studentId || !status) {
    return { success: false, message: "Missing student ID or status." };
  }

  const validStatuses: StudentStatus[] = ["active", "pending", "paused", "archived"];
  if (!validStatuses.includes(status)) {
    return { success: false, message: "Invalid student status." };
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    let client: any = null;
    try {
      client = createAdminClient();
    } catch {
      client = await createClient();
    }

    const { error } = await client
      .from("students")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", studentId);

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "STUDENT_STATUS_UPDATED", "STUDENT", studentId, {
      new_status: status,
    });

    revalidatePath("/admin/students");
    return {
      success: true,
      message: `Student account status transitioned to ${status}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update student status.";
    return { success: false, message: msg };
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
    priceInRupees: formData.get("priceInRupees")?.toString() || formData.get("priceInDollars")?.toString() || "0",
    priceInDollars: formData.get("priceInRupees")?.toString() || formData.get("priceInDollars")?.toString() || "0",
    initialTopicsJson: formData.get("initialTopicsJson")?.toString() || "",
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
    const priceAmount = validation.data.priceInRupees ?? validation.data.priceInDollars;
    const priceInCents = Math.round(priceAmount * 100);

    let initialTopics: { title: string; description?: string; lessons?: string[] }[] = [];
    if (validation.data.initialTopicsJson) {
      try {
        const parsed = JSON.parse(validation.data.initialTopicsJson);
        if (Array.isArray(parsed)) {
          initialTopics = parsed;
        }
      } catch {
        // Fallback: ignore bad JSON
      }
    }

    const result = await createCourse({
      title: validation.data.title,
      slug: validation.data.slug,
      summary: validation.data.summary,
      description: validation.data.description,
      level: validation.data.level as CourseLevel,
      audience_group: validation.data.audienceGroup as AudienceGroup,
      delivery_mode: validation.data.deliveryMode as DeliveryMode,
      duration_weeks: validation.data.durationWeeks,
      price_in_cents: priceInCents,
      currency: "INR",
      status: "draft",
      initialTopics,
    });

    if (!result.success || !result.course) {
      return { success: false, message: result.error || "Failed to create course." };
    }

    await logAuditEvent(actor.userId, "COURSE_CREATED", "COURSE", result.course.id, {
      title: validation.data.title,
      slug: validation.data.slug,
      topicsCount: initialTopics.length,
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");
    return {
      success: true,
      message: `Course "${validation.data.title}" created successfully.`,
      courseId: result.course.id,
    };
  } catch (err) {
    console.error("[Create Course Error]", err);
    return { success: false, message: "Failed to create course." };
  }
}

export async function updateCourseDetailsAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    courseId: formData.get("courseId")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    slug: formData.get("slug")?.toString() || "",
    summary: formData.get("summary")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    level: formData.get("level")?.toString() || "beginner",
    audienceGroup: formData.get("audienceGroup")?.toString() || "teens",
    deliveryMode: formData.get("deliveryMode")?.toString() || "live_online",
    durationWeeks: formData.get("durationWeeks")?.toString() || "8",
    priceInRupees: formData.get("priceInRupees")?.toString() || formData.get("priceInDollars")?.toString() || "0",
    priceInDollars: formData.get("priceInRupees")?.toString() || formData.get("priceInDollars")?.toString() || "0",
    status: formData.get("status")?.toString() || undefined,
  };

  const validation = updateCourseDetailsSchema.safeParse(rawData);
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
    const priceAmount = validation.data.priceInRupees ?? validation.data.priceInDollars;
    const priceInCents = Math.round(priceAmount * 100);

    const result = await updateCourse(validation.data.courseId, {
      title: validation.data.title,
      slug: validation.data.slug,
      summary: validation.data.summary,
      description: validation.data.description,
      level: validation.data.level as CourseLevel,
      audience_group: validation.data.audienceGroup as AudienceGroup,
      delivery_mode: validation.data.deliveryMode as DeliveryMode,
      duration_weeks: validation.data.durationWeeks,
      price_in_cents: priceInCents,
      currency: "INR",
      status: validation.data.status as "draft" | "published" | undefined,
    });

    if (!result.success) {
      return { success: false, message: result.error || "Failed to update course." };
    }

    await logAuditEvent(actor.userId, "COURSE_UPDATED", "COURSE", validation.data.courseId, {
      title: validation.data.title,
      slug: validation.data.slug,
      priceInDollars: validation.data.priceInDollars,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${validation.data.courseId}`);
    revalidatePath("/courses");
    revalidatePath(`/courses/${validation.data.slug}`);

    return {
      success: true,
      message: "Course details and pricing successfully updated.",
    };
  } catch (err) {
    console.error("[Update Course Error]", err);
    return { success: false, message: "Failed to update course details." };
  }
}

export async function deleteCourseAction(courseId: string): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  try {
    const result = await deleteCourse(courseId);
    if (!result.success) {
      return { success: false, message: result.error || "Failed to delete course." };
    }

    await logAuditEvent(actor.userId, "COURSE_DELETED", "COURSE", courseId, {});

    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    return {
      success: true,
      message: "Course successfully deleted.",
    };
  } catch (err) {
    console.error("[Delete Course Error]", err);
    return { success: false, message: "Failed to delete course." };
  }
}

export async function toggleCoursePublishAction(
  courseId: string,
  currentStatus: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  try {
    const result = await toggleCoursePublishStatus(courseId, currentStatus);
    if (!result.success) {
      return { success: false, message: result.error || "Failed to update course status." };
    }

    await logAuditEvent(actor.userId, "COURSE_STATUS_TOGGLED", "COURSE", courseId, {
      previous_status: currentStatus,
      new_status: result.newStatus,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: `Course is now ${result.newStatus}.`,
    };
  } catch (err) {
    console.error("[Toggle Course Error]", err);
    return { success: false, message: "Failed to update course status." };
  }
}

export async function addCourseModuleAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    courseId: formData.get("courseId")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    description: formData.get("description")?.toString() || "",
    lessonsRaw: formData.get("lessonsRaw")?.toString() || "",
  };

  const validation = addCourseModuleSchema.safeParse(rawData);
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
    // Parse raw lessons text (line by line or semicolon separated)
    const lessons: { title: string; lessonType: "lecture" | "lab" | "project" | "quiz"; isPreview: boolean }[] = [];
    if (validation.data.lessonsRaw) {
      const lines = validation.data.lessonsRaw
        .split(/[\n;]+/)
        .map((s) => s.trim())
        .filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        lessons.push({
          title: lines[i],
          lessonType: i === lines.length - 1 && lines.length > 2 ? "project" : "lecture",
          isPreview: i === 0,
        });
      }
    }

    const result = await addCourseModule(validation.data.courseId, {
      title: validation.data.title,
      description: validation.data.description,
      lessons,
    });

    if (!result.success || !result.module) {
      return { success: false, message: result.error || "Failed to add topic module." };
    }

    await logAuditEvent(actor.userId, "COURSE_MODULE_ADDED", "COURSE_MODULE", result.module.id, {
      courseId: validation.data.courseId,
      title: validation.data.title,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${validation.data.courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: `Topic "${validation.data.title}" added to syllabus.`,
    };
  } catch (err) {
    console.error("[Add Course Module Error]", err);
    return { success: false, message: "Failed to add topic." };
  }
}

export async function updateCourseModuleAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    courseId: formData.get("courseId")?.toString() || "",
    moduleId: formData.get("moduleId")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    description: formData.get("description")?.toString() || "",
  };

  const validation = updateCourseModuleSchema.safeParse(rawData);
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
    const result = await updateCourseModule(validation.data.courseId, validation.data.moduleId, {
      title: validation.data.title,
      description: validation.data.description,
    });

    if (!result.success) {
      return { success: false, message: result.error || "Failed to update topic." };
    }

    await logAuditEvent(actor.userId, "COURSE_MODULE_UPDATED", "COURSE_MODULE", validation.data.moduleId, {
      courseId: validation.data.courseId,
      title: validation.data.title,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${validation.data.courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: "Topic details updated successfully.",
    };
  } catch (err) {
    console.error("[Update Course Module Error]", err);
    return { success: false, message: "Failed to update topic." };
  }
}

export async function deleteCourseModuleAction(
  courseId: string,
  moduleId: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  try {
    const result = await deleteCourseModule(courseId, moduleId);
    if (!result.success) {
      return { success: false, message: result.error || "Failed to delete topic." };
    }

    await logAuditEvent(actor.userId, "COURSE_MODULE_DELETED", "COURSE_MODULE", moduleId, {
      courseId,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: "Topic module removed.",
    };
  } catch (err) {
    console.error("[Delete Course Module Error]", err);
    return { success: false, message: "Failed to delete topic." };
  }
}

export async function addLessonAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    courseId: formData.get("courseId")?.toString() || "",
    moduleId: formData.get("moduleId")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    lessonType: formData.get("lessonType")?.toString() || "lecture",
    description: formData.get("description")?.toString() || "",
    isPreview: formData.get("isPreview") === "true" || formData.get("isPreview") === "on",
  };

  const validation = addLessonSchema.safeParse(rawData);
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
    const result = await addLessonToModule(validation.data.courseId, validation.data.moduleId, {
      title: validation.data.title,
      description: validation.data.description,
      lessonType: validation.data.lessonType,
      isPreview: validation.data.isPreview,
    });

    if (!result.success || !result.lesson) {
      return { success: false, message: result.error || "Failed to add lesson." };
    }

    await logAuditEvent(actor.userId, "LESSON_ADDED", "LESSON", result.lesson.id, {
      courseId: validation.data.courseId,
      moduleId: validation.data.moduleId,
      title: validation.data.title,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${validation.data.courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: `Lesson "${validation.data.title}" added to topic.`,
    };
  } catch (err) {
    console.error("[Add Lesson Error]", err);
    return { success: false, message: "Failed to add lesson." };
  }
}

export async function deleteLessonAction(
  courseId: string,
  moduleId: string,
  lessonId: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  try {
    const result = await deleteLessonFromModule(courseId, moduleId, lessonId);
    if (!result.success) {
      return { success: false, message: result.error || "Failed to remove lesson." };
    }

    await logAuditEvent(actor.userId, "LESSON_DELETED", "LESSON", lessonId, {
      courseId,
      moduleId,
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/courses");

    return {
      success: true,
      message: "Lesson removed.",
    };
  } catch (err) {
    console.error("[Delete Lesson Error]", err);
    return { success: false, message: "Failed to remove lesson." };
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

export async function reviewApplicationAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    applicationId: formData.get("applicationId")?.toString() || "",
    decision: formData.get("decision")?.toString() || "",
    decisionReason: formData.get("decisionReason")?.toString() || "",
    adminNotes: formData.get("adminNotes")?.toString() || "",
    batchId: formData.get("batchId")?.toString() || "",
  };

  const { applicationReviewSchema } = await import("@/lib/validation/application");
  const { updateApplicationReview } = await import("@/server/services/applicationService");

  const validation = applicationReviewSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the review fields.",
      errors,
    };
  }

  const result = await updateApplicationReview(
    validation.data.applicationId,
    actor.userId,
    validation.data.decision,
    validation.data.decisionReason,
    validation.data.adminNotes,
    validation.data.batchId
  );

  if (result.success) {
    await logAuditEvent(
      actor.userId,
      "APPLICATION_REVIEWED",
      "STUDENT_APPLICATION",
      validation.data.applicationId,
      {
        decision: validation.data.decision,
        reason: validation.data.decisionReason,
        batch_id: validation.data.batchId || null,
      }
    );
    revalidatePath("/admin/applications");
    revalidatePath("/admin");
  }

  return {
    success: result.success,
    message: result.message,
    studentCode: result.studentCode,
    temporaryPassword: result.temporaryPassword,
    assignedBatch: result.assignedBatch,
  };
}

export async function resendStudentSetupEmailAction(
  applicationId: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);
  const { resendStudentSetupEmail } = await import("@/server/services/provisioningService");
  const result = await resendStudentSetupEmail(applicationId, actor.userId);

  await logAuditEvent(
    actor.userId,
    "STUDENT_SETUP_EMAIL_RESENT",
    "STUDENT_APPLICATION",
    applicationId,
    { delivered: result.success, provider: result.provider }
  );

  return {
    success: result.success,
    message: result.message,
    studentCode: result.studentCode,
    temporaryPassword: result.temporaryPassword,
    assignedBatch: result.assignedBatch,
  };
}

export async function resetStudentCredentialsAction(
  applicationId: string
): Promise<{
  success: boolean;
  message: string;
  studentCode?: string;
  email?: string;
  temporaryPassword?: string;
}> {
  const actor = await requireRole(["admin"]);
  const { resetStudentCredentials } = await import("@/server/services/provisioningService");
  const result = await resetStudentCredentials(applicationId, actor.userId);

  return result;
}

export async function createInstructorAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    bio: formData.get("bio")?.toString() || "",
    specialties: formData.get("specialties")?.toString() || "",
    avatarUrl: formData.get("avatarUrl")?.toString() || "",
  };

  const validation = createInstructorSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the errors in the instructor form.",
      errors,
    };
  }

  const specialtiesList = validation.data.specialties
    ? validation.data.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const result = await createInstructor({
    fullName: validation.data.fullName,
    email: validation.data.email,
    title: validation.data.title,
    bio: validation.data.bio,
    specialties: specialtiesList,
    avatarUrl: validation.data.avatarUrl || null,
  });

  if (result.success) {
    await logAuditEvent(
      actor.userId,
      "INSTRUCTOR_CREATED",
      "INSTRUCTOR",
      result.instructor?.id,
      {
        fullName: validation.data.fullName,
        email: validation.data.email,
      }
    );
    revalidatePath("/admin/instructors");
    revalidatePath("/instructors");
    revalidatePath("/");
    return {
      success: true,
      message: "Faculty member added successfully.",
    };
  }

  return {
    success: false,
    message: "Failed to create instructor.",
  };
}

export async function updateInstructorAction(
  prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);

  const rawData = {
    instructorId: formData.get("instructorId")?.toString() || "",
    fullName: formData.get("fullName")?.toString() || "",
    email: formData.get("email")?.toString() || "",
    title: formData.get("title")?.toString() || "",
    bio: formData.get("bio")?.toString() || "",
    specialties: formData.get("specialties")?.toString() || "",
    avatarUrl: formData.get("avatarUrl")?.toString() || "",
  };

  const validation = updateInstructorSchema.safeParse(rawData);
  if (!validation.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of validation.error.issues) {
      const path = issue.path[0]?.toString() || "form";
      if (!errors[path]) errors[path] = [];
      errors[path].push(issue.message);
    }
    return {
      success: false,
      message: "Please correct the errors in the instructor form.",
      errors,
    };
  }

  const specialtiesList = validation.data.specialties
    ? validation.data.specialties
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const result = await updateInstructor({
    id: validation.data.instructorId,
    fullName: validation.data.fullName,
    email: validation.data.email,
    title: validation.data.title,
    bio: validation.data.bio,
    specialties: specialtiesList,
    avatarUrl: validation.data.avatarUrl || null,
  });

  if (result.success) {
    await logAuditEvent(
      actor.userId,
      "INSTRUCTOR_UPDATED",
      "INSTRUCTOR",
      validation.data.instructorId,
      {
        fullName: validation.data.fullName,
      }
    );
    revalidatePath("/admin/instructors");
    revalidatePath("/instructors");
    revalidatePath("/");
    return {
      success: true,
      message: "Faculty member updated successfully.",
    };
  }

  return {
    success: false,
    message: "Failed to update instructor.",
  };
}

export async function deleteInstructorAction(
  instructorId: string
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);
  const result = await deleteInstructor(instructorId);

  if (result.success) {
    await logAuditEvent(
      actor.userId,
      "INSTRUCTOR_DELETED",
      "INSTRUCTOR",
      instructorId
    );
    revalidatePath("/admin/instructors");
    revalidatePath("/instructors");
    revalidatePath("/");
    return {
      success: true,
      message: "Faculty member removed from active roster.",
    };
  }

  return {
    success: false,
    message: "Failed to remove faculty member.",
  };
}

export async function verifyManualPaymentAction(
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);
  const orderId = formData.get("orderId")?.toString();
  const paymentMethod = formData.get("paymentMethod")?.toString() || "bank_transfer";
  const reference = formData.get("reference")?.toString() || "";
  const notes = formData.get("notes")?.toString() || "";

  if (!orderId) {
    return { success: false, message: "Missing order ID." };
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    let client: any = null;
    try {
      client = createAdminClient();
    } catch {
      client = await createClient();
    }

    const now = new Date().toISOString();

    // 1. Fetch the order
    const { data: order, error: orderErr } = await client
      .from("payment_orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return { success: false, message: "Payment order not found." };
    }

    // 2. Update order status to paid
    await client
      .from("payment_orders")
      .update({ status: "paid", updated_at: now })
      .eq("id", orderId);

    // 3. Insert payment record
    await client
      .from("payments")
      .insert({
        order_id: orderId,
        amount_in_cents: order.amount_in_cents,
        currency: order.currency,
        status: "paid",
        payment_method: paymentMethod,
        provider_payment_id: reference || `manual-${Date.now()}`,
        paid_at: now,
        raw_response: { verified_by: actor.userId, notes },
      });

    // 4. Update student enrollment payment_status if exists
    if (order.student_id && order.course_id) {
      await client
        .from("enrollments")
        .update({ payment_status: "verified", updated_at: now })
        .eq("student_id", order.student_id)
        .eq("course_id", order.course_id);
    }

    await logAuditEvent(actor.userId, "PAYMENT_MANUALLY_VERIFIED", "PAYMENT", orderId, {
      amount_in_cents: order.amount_in_cents,
      currency: order.currency,
      method: paymentMethod,
      reference,
      notes,
    });

    revalidatePath("/admin/payments");
    revalidatePath("/admin/enrollments");
    revalidatePath("/admin");

    return {
      success: true,
      message: "Payment successfully verified and enrollment reconciled.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to verify payment.";
    return { success: false, message: msg };
  }
}

export async function toggleEnquiryStatusAction(
  formData: FormData
): Promise<ActionResult> {
  const actor = await requireRole(["admin"]);
  const enquiryId = formData.get("enquiryId")?.toString();
  const newStatus = formData.get("newStatus")?.toString() || "read";

  if (!enquiryId) {
    return { success: false, message: "Missing enquiry ID." };
  }

  try {
    const { createAdminClient } = await import("@/lib/supabase/admin");
    let client: any = null;
    try {
      client = createAdminClient();
    } catch {
      client = await createClient();
    }

    const { error } = await client
      .from("contact_enquiries")
      .update({ status: newStatus })
      .eq("id", enquiryId);

    if (error) {
      return { success: false, message: error.message };
    }

    await logAuditEvent(actor.userId, "ENQUIRY_STATUS_UPDATED", "ENQUIRY", enquiryId, {
      status: newStatus,
    });

    revalidatePath("/admin/enquiries");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Enquiry marked as ${newStatus}.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update enquiry.";
    return { success: false, message: msg };
  }
}




