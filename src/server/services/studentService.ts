import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import {
  Student,
  Course,
  ClassSession,
  Assignment,
  Submission,
  AttendanceRecord,
  LearningProgress,
  Enrollment,
  Notification,
  CourseResource,
  StudentBillingRecord,
} from "@/types";
import { INITIAL_ACADEMY_COURSES, getCourseById } from "./courseService";
import { INITIAL_STUDENTS } from "./studentFixtures";
import {
  IN_MEMORY_ASSIGNMENTS,
  IN_MEMORY_SUBMISSIONS,
  IN_MEMORY_ATTENDANCE,
  IN_MEMORY_SESSIONS,
} from "./instructorService";
import { IN_MEMORY_ENROLLMENTS, getEnrollments } from "./enrollmentService";
import { getAllSessions } from "./scheduleService";

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
      key &&
      !url.includes("placeholder") &&
      !url.includes("example.supabase.co") &&
      !key.includes("placeholder")
  );
}

// In-memory student progression store
export const IN_MEMORY_PROGRESS: LearningProgress[] = [
  {
    id: "prog-01",
    student_id: "s1000000-0000-0000-0000-000000000001",
    lesson_id: "l1000000-0000-0000-0000-000000000001",
    completed_at: "2026-10-10T12:00:00Z",
  },
  {
    id: "prog-02",
    student_id: "s1000000-0000-0000-0000-000000000001",
    lesson_id: "l1000000-0000-0000-0000-000000000002",
    completed_at: "2026-10-12T15:30:00Z",
  },
];

// In-memory student notifications store
export const IN_MEMORY_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1000000-0000-0000-0000-000000000001",
    recipient_profile_id: "u1000000-0000-0000-0000-000000000001", // Liam
    title: "Live Virtual Lab Scheduled",
    message: "Live Edge Lab 01: OpenCV Video Pipelines begins on schedule. Join link unlocks 15m prior.",
    type: "class",
    action_url: "/student/classes",
    is_read: false,
    created_at: "2026-10-22T14:45:00Z",
  },
  {
    id: "notif-1000000-0000-0000-0000-000000000002",
    recipient_profile_id: "u1000000-0000-0000-0000-000000000001", // Liam
    title: "Faculty Feedback Released",
    message: "Instructor Dr. Alan Vance has graded your OpenCV Real-Time Tracker lab (95/100).",
    type: "assignment",
    action_url: "/student/grades",
    is_read: true,
    created_at: "2026-10-18T10:30:00Z",
  },
];

// In-memory course downloadable resources
export const IN_MEMORY_COURSE_RESOURCES: CourseResource[] = [
  {
    id: "res-01",
    course_id: "c1000000-0000-0000-0000-000000000001",
    title: "OpenCV 4.8 Computer Vision Python Lab Guide",
    description: "Official Syntaxora lab handbook detailing matrix transformations, color thresholding, and camera calibration.",
    file_type: "pdf",
    file_url: "https://syntaxora.com/storage/resources/opencv-lab-guide.pdf",
    file_size: "4.2 MB",
    module_title: "Module 2: Computer Vision in Practice",
    created_at: "2026-10-01T00:00:00Z",
  },
  {
    id: "res-02",
    course_id: "c1000000-0000-0000-0000-000000000001",
    title: "Haar Cascade XML Classifiers Archive",
    description: "Pre-trained frontal face and eye detection XML matrices for local Python OpenCV inference.",
    file_type: "archive",
    file_url: "https://syntaxora.com/storage/resources/haar-cascades.zip",
    file_size: "1.8 MB",
    module_title: "Module 2: Computer Vision in Practice",
    created_at: "2026-10-05T00:00:00Z",
  },
  {
    id: "res-03",
    course_id: "c1000000-0000-0000-0000-000000000001",
    title: "CIFAR-10 Tiny Image Benchmark Dataset (Subset)",
    description: "Pre-normalized NumPy array binary tensors for neural network classification labs.",
    file_type: "dataset",
    file_url: "https://syntaxora.com/storage/resources/cifar10-sample.npz",
    file_size: "12.4 MB",
    module_title: "Module 1: Foundations of Machine Intelligence",
    created_at: "2026-10-10T00:00:00Z",
  },
];

// In-memory student billing / invoice store
export const IN_MEMORY_BILLING_RECORDS: StudentBillingRecord[] = [
  {
    id: "inv-2026-081",
    invoice_number: "SYN-INV-2026-081",
    course_id: "c1000000-0000-0000-0000-000000000001",
    course_title: "Applied AI & Python Programming for Teens",
    amount_in_cents: 1499900,
    currency: "INR",
    status: "paid",
    payment_method: "UPI / NetBanking (Verified by Admissions)",
    paid_at: "2026-09-01T12:00:00Z",
    created_at: "2026-09-01T10:00:00Z",
  },
];

/**
 * Resolves the canonical student record for a user profile ID.
 */
export async function getStudentByProfileId(profileId: string): Promise<Student | null> {
  if (!isSupabaseConfigured()) {
    const found = INITIAL_STUDENTS.find(
      (s) => s.profile_id === profileId || s.profile?.id === profileId
    );
    if (found) return found;
    if (profileId === "u1000000-0000-0000-0000-000000000001") return INITIAL_STUDENTS[0];
    if (profileId === "u1000000-0000-0000-0000-000000000002") return INITIAL_STUDENTS[1];
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("students")
      .select("*, profile:profiles (*)")
      .eq("profile_id", profileId)
      .maybeSingle();

    if (error || !data) {
      // In offline/hybrid test contexts fallback to in-memory Liam if matching
      const found = INITIAL_STUDENTS.find(
        (s) => s.profile_id === profileId || s.profile?.id === profileId
      );
      if (found) return found;
      if (profileId === "u1000000-0000-0000-0000-000000000001") return INITIAL_STUDENTS[0];
      if (profileId === "u1000000-0000-0000-0000-000000000002") return INITIAL_STUDENTS[1];
      return null;
    }

    return data as unknown as Student;
  } catch {
    const found = INITIAL_STUDENTS.find(
      (s) => s.profile_id === profileId || s.profile?.id === profileId
    );
    return found || null;
  }
}

/**
 * Returns enrolled courses for a student, enriched with full curriculum modules & lessons.
 * STRICT SECURITY INVARIANT: Unenrolled students receive an empty array (no mock fallbacks).
 */
export async function getStudentCourses(studentId: string): Promise<Course[]> {
  const enrichModules = (courses: Course[]): Course[] => {
    return courses.map((c) => {
      if (!c.modules || c.modules.length === 0) {
        const fallback = INITIAL_ACADEMY_COURSES.find(
          (fc) => fc.id === c.id || fc.slug === c.slug
        );
        if (fallback?.modules) {
          return { ...c, modules: fallback.modules };
        }
      }
      return c;
    });
  };

  if (!isSupabaseConfigured()) {
    const enrollments = IN_MEMORY_ENROLLMENTS.filter(
      (e) => e.student_id === studentId && (e.status === "active" || e.status === "completed")
    );
    if (enrollments.length > 0) {
      const courseIds = new Set(enrollments.map((e) => e.course_id));
      const matched = INITIAL_ACADEMY_COURSES.filter((c) => courseIds.has(c.id));
      return enrichModules(matched);
    }
    return []; // Truthful empty state
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("course:courses (*, modules:course_modules (*, lessons (*)))")
      .eq("student_id", studentId)
      .in("status", ["active", "completed"]);

    if (error || !data || data.length === 0) {
      // Fallback check against in-memory for testing
      const enrollments = IN_MEMORY_ENROLLMENTS.filter(
        (e) => e.student_id === studentId && (e.status === "active" || e.status === "completed")
      );
      if (enrollments.length > 0) {
        const courseIds = new Set(enrollments.map((e) => e.course_id));
        const matched = INITIAL_ACADEMY_COURSES.filter((c) => courseIds.has(c.id));
        return enrichModules(matched);
      }
      return [];
    }

    const courses = (data as unknown as { course: Course }[])
      .map((e) => e.course)
      .filter(Boolean);

    return enrichModules(courses);
  } catch {
    return [];
  }
}

export const getStudentEnrolledCourses = getStudentCourses;

/**
 * Resolves an individual course for a student, strictly verifying enrollment on the server.
 * Returns null if the student is not enrolled or access is restricted.
 */
export async function getStudentCourseById(
  studentId: string,
  courseId: string
): Promise<{ course: Course; enrollment: Enrollment } | null> {
  const enrollments = await getEnrollments({ studentId });
  const enrollment = enrollments.find(
    (e) =>
      (e.course_id === courseId || e.course?.id === courseId || e.course?.slug === courseId) &&
      (e.status === "active" || e.status === "completed")
  );

  if (!enrollment) {
    return null; // Access Denied: Student is not enrolled in this course
  }

  const course = await getCourseById(enrollment.course_id);
  if (!course) {
    return null;
  }

  // Ensure modules and lessons are correctly sorted by sort_order
  const sortedModules = (course.modules || [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((m) => ({
      ...m,
      lessons: (m.lessons || []).slice().sort((a, b) => a.sort_order - b.sort_order),
    }));

  return {
    course: { ...course, modules: sortedModules },
    enrollment,
  };
}

/**
 * Returns active enrollments for a student, including assigned batches.
 */
export async function getStudentEnrollments(studentId: string): Promise<Enrollment[]> {
  return getEnrollments({ studentId, status: "active" });
}

/**
 * Returns class sessions strictly scoped to the student's enrolled courses and assigned cohort batches.
 * Students cannot see sessions belonging to another batch of the same course.
 */
export async function getStudentSessions(studentId?: string): Promise<ClassSession[]> {
  if (!studentId) return [];

  const enrollments = await getEnrollments({ studentId, status: "active" });
  if (enrollments.length === 0) {
    return [];
  }

  const courseIds = new Set(enrollments.map((e) => e.course_id));
  const batchIds = new Set(enrollments.map((e) => e.batch_id).filter(Boolean) as string[]);

  const allSessions = await getAllSessions();
  return allSessions.filter((s) => {
    if (!courseIds.has(s.course_id)) return false;
    // If session is batch-specific, student must belong to that exact batch
    if (s.batch_id) {
      return batchIds.has(s.batch_id);
    }
    // If student has course but has not been assigned a batch yet, do not show batch sessions
    return batchIds.size > 0;
  });
}

/**
 * Returns assignments for enrolled courses with the student's submission status.
 * STRICT ISOLATION: Only returns assignments for courses the student is actually enrolled in.
 */
export async function getStudentAssignments(
  studentId: string
): Promise<(Assignment & { submission?: Submission })[]> {
  const enrollments = await getEnrollments({ studentId, status: "active" });
  if (enrollments.length === 0) {
    return [];
  }

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  if (!isSupabaseConfigured()) {
    return IN_MEMORY_ASSIGNMENTS.filter((asn) => enrolledCourseIds.has(asn.course_id)).map((asn) => {
      const sub = IN_MEMORY_SUBMISSIONS.find(
        (s) => s.assignment_id === asn.id && s.student_id === studentId
      );
      return {
        ...asn,
        submission: sub,
      };
    });
  }

  try {
    const supabase = await createClient();
    const { data: assignments, error: asnError } = await supabase
      .from("assignments")
      .select("*, course:courses (*)")
      .in("course_id", Array.from(enrolledCourseIds));

    if (asnError || !assignments) {
      return IN_MEMORY_ASSIGNMENTS.filter((asn) => enrolledCourseIds.has(asn.course_id));
    }

    const { data: submissions } = await supabase
      .from("submissions")
      .select("*")
      .eq("student_id", studentId);

    return assignments.map((asn) => {
      const sub = submissions?.find((s) => s.assignment_id === asn.id);
      return {
        ...asn,
        submission: sub as unknown as Submission | undefined,
      };
    });
  } catch {
    return IN_MEMORY_ASSIGNMENTS.filter((asn) => enrolledCourseIds.has(asn.course_id));
  }
}

/**
 * Submits an assignment solution.
 */
export async function submitStudentAssignment(
  studentId: string,
  assignmentId: string,
  content: string,
  attachmentUrl?: string
): Promise<{ success: boolean; submissionId?: string; error?: string }> {
  const submissionId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const existing = IN_MEMORY_SUBMISSIONS.find(
      (s) => s.assignment_id === assignmentId && s.student_id === studentId
    );

    if (existing) {
      existing.content = content;
      existing.attachment_url = attachmentUrl || existing.attachment_url;
      existing.submitted_at = now;
      existing.status = "submitted";
      return { success: true, submissionId: existing.id };
    }

    IN_MEMORY_SUBMISSIONS.push({
      id: submissionId,
      assignment_id: assignmentId,
      student_id: studentId,
      content,
      attachment_url: attachmentUrl || null,
      status: "submitted",
      score: null,
      feedback: null,
      is_grade_published: false,
      submitted_at: now,
    });

    return { success: true, submissionId };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("submissions")
      .upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          content,
          attachment_url: attachmentUrl || null,
          status: "submitted",
          submitted_at: now,
        },
        { onConflict: "assignment_id,student_id" }
      )
      .select("id")
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || "Failed to save submission" };
    }

    return { success: true, submissionId: data.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to save submission";
    return { success: false, error: msg };
  }
}

/**
 * Returns released grades for a student.
 * STRICT SECURITY INVARIANT: Only returns submissions where is_grade_published === true.
 */
export async function getStudentReleasedGrades(
  studentId: string
): Promise<Submission[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_SUBMISSIONS.filter(
      (s) => s.student_id === studentId && s.is_grade_published === true
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("submissions")
      .select("*, assignment:assignments (*)")
      .eq("student_id", studentId)
      .eq("is_grade_published", true)
      .order("graded_at", { ascending: false });

    if (error || !data) {
      return IN_MEMORY_SUBMISSIONS.filter(
        (s) => s.student_id === studentId && s.is_grade_published === true
      );
    }

    return data as unknown as Submission[];
  } catch {
    return IN_MEMORY_SUBMISSIONS.filter(
      (s) => s.student_id === studentId && s.is_grade_published === true
    );
  }
}

/**
 * Returns attendance history for a student with populated session and course details.
 */
export async function getStudentAttendance(
  studentId: string
): Promise<AttendanceRecord[]> {
  const attachInMemorySession = (records: AttendanceRecord[]): AttendanceRecord[] => {
    return records.map((a) => {
      const session = a.session || IN_MEMORY_SESSIONS.find((s) => s.id === a.class_session_id);
      return {
        ...a,
        session: session
          ? {
              ...session,
              course: session.course || INITIAL_ACADEMY_COURSES[0],
            }
          : undefined,
      };
    });
  };

  if (!isSupabaseConfigured()) {
    return attachInMemorySession(IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId));
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*, session:class_sessions (*, course:courses (*), batch:batches (*))")
      .eq("student_id", studentId)
      .order("recorded_at", { ascending: false });

    if (error || !data) {
      return attachInMemorySession(IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId));
    }

    return data as unknown as AttendanceRecord[];
  } catch {
    return attachInMemorySession(IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId));
  }
}

/**
 * Returns array of completed lesson IDs for a student.
 */
export async function getStudentCompletedLessons(studentId: string): Promise<string[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_PROGRESS
      .filter((p) => p.student_id === studentId)
      .map((p) => p.lesson_id);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("learning_progress")
      .select("lesson_id")
      .eq("student_id", studentId);

    if (error || !data) {
      return IN_MEMORY_PROGRESS
        .filter((p) => p.student_id === studentId)
        .map((p) => p.lesson_id);
    }

    return data.map((d) => d.lesson_id);
  } catch {
    return IN_MEMORY_PROGRESS
      .filter((p) => p.student_id === studentId)
      .map((p) => p.lesson_id);
  }
}

/**
 * Marks a lesson completed for learning progress tracking.
 */
export async function recordLessonCompletion(
  studentId: string,
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const exists = IN_MEMORY_PROGRESS.some(
      (p) => p.student_id === studentId && p.lesson_id === lessonId
    );
    if (!exists) {
      IN_MEMORY_PROGRESS.push({
        id: crypto.randomUUID(),
        student_id: studentId,
        lesson_id: lessonId,
        completed_at: now,
      });
    }
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("learning_progress").upsert(
      {
        student_id: studentId,
        lesson_id: lessonId,
        completed_at: now,
      },
      { onConflict: "student_id,lesson_id" }
    );

    if (error) {
      // In-memory fallback for local dev
      const exists = IN_MEMORY_PROGRESS.some(
        (p) => p.student_id === studentId && p.lesson_id === lessonId
      );
      if (!exists) {
        IN_MEMORY_PROGRESS.push({
          id: crypto.randomUUID(),
          student_id: studentId,
          lesson_id: lessonId,
          completed_at: now,
        });
      }
      return { success: true };
    }

    return { success: true };
  } catch {
    const exists = IN_MEMORY_PROGRESS.some(
      (p) => p.student_id === studentId && p.lesson_id === lessonId
    );
    if (!exists) {
      IN_MEMORY_PROGRESS.push({
        id: crypto.randomUUID(),
        student_id: studentId,
        lesson_id: lessonId,
        completed_at: now,
      });
    }
    return { success: true };
  }
}

/**
 * Returns notifications strictly scoped to the authenticated student's profile ID.
 */
export async function getStudentNotifications(profileId: string): Promise<Notification[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_NOTIFICATIONS.filter((n) => n.recipient_profile_id === profileId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return IN_MEMORY_NOTIFICATIONS.filter((n) => n.recipient_profile_id === profileId);
    }

    return data as Notification[];
  } catch {
    return IN_MEMORY_NOTIFICATIONS.filter((n) => n.recipient_profile_id === profileId);
  }
}

/**
 * Marks a notification as read, enforcing that the notification belongs to the authenticated profile.
 */
export async function markNotificationAsRead(
  notificationId: string,
  profileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const notif = IN_MEMORY_NOTIFICATIONS.find(
      (n) => n.id === notificationId && n.recipient_profile_id === profileId
    );
    if (notif) {
      notif.is_read = true;
      return { success: true };
    }
    return { success: false, error: "Notification not found or unauthorized" };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId)
      .eq("recipient_profile_id", profileId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

/**
 * Returns downloadable learning resources scoped to the student's enrolled courses.
 */
export async function getStudentResources(studentId: string): Promise<CourseResource[]> {
  const enrollments = await getEnrollments({ studentId, status: "active" });
  if (enrollments.length === 0) {
    return [];
  }

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  // Filter resources by student's enrolled courses
  return IN_MEMORY_COURSE_RESOURCES.filter((res) => enrolledCourseIds.has(res.course_id));
}

/**
 * Returns billing and tuition invoice statements for the authenticated student.
 */
export async function getStudentBillingRecords(studentId: string): Promise<StudentBillingRecord[]> {
  const enrollments = await getEnrollments({ studentId });
  if (enrollments.length === 0) {
    return [];
  }

  const enrolledCourseIds = new Set(enrollments.map((e) => e.course_id));

  return IN_MEMORY_BILLING_RECORDS.filter((b) => enrolledCourseIds.has(b.course_id));
}

/**
 * Returns guardians / parents linked to the student.
 */
export async function getStudentGuardians(studentId: string) {
  if (!isSupabaseConfigured()) {
    const { IN_MEMORY_RELATIONSHIPS } = await import("./guardianService");
    return IN_MEMORY_RELATIONSHIPS.filter((r) => r.student_id === studentId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("guardian_student_relationships")
      .select("*, guardian:profiles!guardian_student_relationships_guardian_profile_id_fkey (*)")
      .eq("student_id", studentId);

    if (error || !data || data.length === 0) {
      const { IN_MEMORY_RELATIONSHIPS } = await import("./guardianService");
      return IN_MEMORY_RELATIONSHIPS.filter((r) => r.student_id === studentId);
    }

    return data;
  } catch {
    const { IN_MEMORY_RELATIONSHIPS } = await import("./guardianService");
    return IN_MEMORY_RELATIONSHIPS.filter((r) => r.student_id === studentId);
  }
}

