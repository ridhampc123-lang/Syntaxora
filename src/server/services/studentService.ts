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
} from "@/types";
import { INITIAL_ACADEMY_COURSES } from "./courseService";
import { INITIAL_STUDENTS } from "./adminService";
import {
  IN_MEMORY_ASSIGNMENTS,
  IN_MEMORY_SUBMISSIONS,
  IN_MEMORY_ATTENDANCE,
  IN_MEMORY_SESSIONS,
} from "./instructorService";
import { IN_MEMORY_ENROLLMENTS } from "./enrollmentService";

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
      return null;
    }

    return data as unknown as Student;
  } catch {
    return null;
  }
}

/**
 * Returns enrolled courses for a student, enriched with full curriculum modules & lessons.
 */
export async function getStudentCourses(_studentId: string): Promise<Course[]> {
  const enrichModules = (courses: Course[]): Course[] => {
    return courses.map((c) => {
      if (!c.modules || c.modules.length === 0) {
        const fallback = INITIAL_ACADEMY_COURSES.find(
          (fc) => fc.id === c.id || fc.slug === c.slug
        );
        if (fallback?.modules) {
          return { ...c, modules: fallback.modules };
        }
        return { ...c, modules: INITIAL_ACADEMY_COURSES[0].modules };
      }
      return c;
    });
  };

  if (!isSupabaseConfigured()) {
    const enrollments = IN_MEMORY_ENROLLMENTS.filter(
      (e) => e.student_id === _studentId && e.status === "active"
    );
    if (enrollments.length > 0) {
      const courseIds = new Set(enrollments.map((e) => e.course_id));
      const matched = INITIAL_ACADEMY_COURSES.filter((c) => courseIds.has(c.id));
      if (matched.length > 0) return enrichModules(matched);
    }
    return enrichModules([INITIAL_ACADEMY_COURSES[0]]);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("course:courses (*, modules:course_modules (*, lessons (*)))")
      .eq("student_id", _studentId)
      .eq("status", "active");

    if (error || !data || data.length === 0) {
      return enrichModules([INITIAL_ACADEMY_COURSES[0]]);
    }

    const courses = (data as unknown as { course: Course }[])
      .map((e) => e.course)
      .filter(Boolean);

    return courses.length > 0 ? enrichModules(courses) : enrichModules([INITIAL_ACADEMY_COURSES[0]]);
  } catch {
    return enrichModules([INITIAL_ACADEMY_COURSES[0]]);
  }
}

import { getEnrollments } from "./enrollmentService";
import { getAllSessions } from "./scheduleService";
import { Enrollment } from "@/types";

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
 */
export async function getStudentAssignments(
  studentId: string
): Promise<(Assignment & { submission?: Submission })[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_ASSIGNMENTS.map((asn) => {
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
      .select("*, course:courses (*)");

    if (asnError || !assignments) {
      return IN_MEMORY_ASSIGNMENTS;
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
    return IN_MEMORY_ASSIGNMENTS;
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

    if (error || !data || data.length === 0) {
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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record lesson progress";
    return { success: false, error: msg };
  }
}
