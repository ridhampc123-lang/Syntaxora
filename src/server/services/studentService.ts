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
import {
  IN_MEMORY_SESSIONS,
  IN_MEMORY_ASSIGNMENTS,
  IN_MEMORY_SUBMISSIONS,
  IN_MEMORY_ATTENDANCE,
} from "./instructorService";

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
    // In dev / test, Liam O'Connor is the primary sample student
    return {
      id: "s1000000-0000-0000-0000-000000000001",
      profile_id: profileId,
      student_code: "STU-8F39A1C2",
      date_of_birth: "2010-04-12",
      emergency_contact_phone: "+1 (555) 234-5678",
      status: "active",
      notes: "Enrolled in Teens Robotics Track",
      created_at: "2026-09-01T00:00:00Z",
      updated_at: "2026-09-01T00:00:00Z",
      profile: {
        id: profileId,
        role: "student",
        full_name: "Liam O'Connor",
        email: "liam.oconnor@example.com",
        created_at: "2026-09-01T00:00:00Z",
        updated_at: "2026-09-01T00:00:00Z",
      },
    };
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
 * Returns enrolled courses for a student.
 */
export async function getStudentCourses(_studentId: string): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    return [INITIAL_ACADEMY_COURSES[0]];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select("course:courses (*)")
      .eq("student_id", _studentId)
      .eq("status", "active");

    if (error || !data || data.length === 0) {
      return [INITIAL_ACADEMY_COURSES[0]];
    }

    return (data as unknown as { course: Course }[]).map((e) => e.course);
  } catch {
    return [INITIAL_ACADEMY_COURSES[0]];
  }
}

/**
 * Returns class sessions for a student's enrolled courses.
 */
export async function getStudentSessions(studentId?: string): Promise<ClassSession[]> {
  if (!isSupabaseConfigured()) {
    return studentId ? IN_MEMORY_SESSIONS : IN_MEMORY_SESSIONS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .select("*, course:courses (*)")
      .order("starts_at", { ascending: true });

    if (error || !data) {
      return IN_MEMORY_SESSIONS;
    }

    return data as unknown as ClassSession[];
  } catch {
    return IN_MEMORY_SESSIONS;
  }
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
 * Returns attendance history for a student.
 */
export async function getStudentAttendance(
  studentId: string
): Promise<AttendanceRecord[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("attendance_records")
      .select("*, session:class_sessions (*)")
      .eq("student_id", studentId)
      .order("recorded_at", { ascending: false });

    if (error || !data) {
      return IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId);
    }

    return data as unknown as AttendanceRecord[];
  } catch {
    return IN_MEMORY_ATTENDANCE.filter((a) => a.student_id === studentId);
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
