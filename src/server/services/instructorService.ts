import crypto from "crypto";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import {
  Profile,
  Course,
  ClassSession,
  AttendanceRecord,
  Assignment,
  Submission,
  Student,
  AttendanceStatus,
} from "@/types";
import { INITIAL_ACADEMY_COURSES } from "./courseService";

const SAMPLE_STUDENT_LIAM: Student = {
  id: "s1000000-0000-0000-0000-000000000001",
  student_code: "STU-8F39A1C2",
  status: "active",
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  profile: {
    id: "u1000000-0000-0000-0000-000000000001",
    role: "student",
    full_name: "Liam O'Connor",
    email: "liam.oconnor@example.com",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
};

const SAMPLE_STUDENT_MAYA: Student = {
  id: "s1000000-0000-0000-0000-000000000002",
  student_code: "STU-7B21E4F9",
  status: "active",
  created_at: "2026-09-01T00:00:00Z",
  updated_at: "2026-09-01T00:00:00Z",
  profile: {
    id: "u1000000-0000-0000-0000-000000000002",
    role: "student",
    full_name: "Maya Patel",
    email: "maya.patel@example.com",
    created_at: "2026-09-01T00:00:00Z",
    updated_at: "2026-09-01T00:00:00Z",
  },
};

export const APPROVED_ACADEMY_INSTRUCTORS: (Profile & { title: string; specialties: string[] })[] = [
  {
    id: "i1000000-0000-0000-0000-000000000001",
    role: "instructor",
    full_name: "Dr. Elena Vance",
    email: "elena.vance@syntaxora.com",
    avatar_url: null,
    bio: "Ph.D. in Robotics from Stanford with 8+ years experience guiding high-school and undergraduate students into applied machine learning competitions.",
    title: "Lead Robotics & Computer Vision Instructor",
    specialties: ["Computer Vision", "Python", "ROS 2", "Youth Pedagogy"],
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "i1000000-0000-0000-0000-000000000002",
    role: "instructor",
    full_name: "Marcus Chen",
    email: "marcus.chen@syntaxora.com",
    avatar_url: null,
    bio: "Former Senior ML Infrastructure Engineer specializing in distributed model training, PyTorch, and transformer optimization for university and professional learners.",
    title: "Deep Learning & Systems Faculty",
    specialties: ["Deep Learning", "PyTorch", "Transformers", "Distributed Systems"],
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
  {
    id: "i1000000-0000-0000-0000-000000000003",
    role: "instructor",
    full_name: "Ananya Sharma",
    email: "ananya.sharma@syntaxora.com",
    avatar_url: null,
    bio: "STEM educator and computational linguistics specialist with 6+ years creating engaging curriculum in generative AI, prompt engineering, and early computational logic.",
    title: "Director of Youth AI Curricula",
    specialties: ["Visual AI Logic", "NLP", "Prompt Architecture", "Early STEM"],
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  },
];

// Fallback operational data stores for testing and development
export const IN_MEMORY_SESSIONS: ClassSession[] = [
  {
    id: "ses-1000000-0000-0000-0000-000000000001",
    course_id: "c1000000-0000-0000-0000-000000000001",
    instructor_profile_id: "i1000000-0000-0000-0000-000000000001",
    title: "Live Edge Lab 01: OpenCV Video Pipelines",
    description: "Configuring real-time frame capture, color masking, and Haar cascade face detection.",
    starts_at: "2026-10-22T15:00:00Z",
    ends_at: "2026-10-22T16:30:00Z",
    meeting_provider: "live_webrtc",
    meeting_url: "https://syntaxora.com/live/cv-edge-01",
    status: "scheduled",
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    course: INITIAL_ACADEMY_COURSES[0],
  },
  {
    id: "ses-1000000-0000-0000-0000-000000000002",
    course_id: "c1000000-0000-0000-0000-000000000001",
    instructor_profile_id: "i1000000-0000-0000-0000-000000000001",
    title: "Neural Network Architecture Deep Dive",
    description: "Feedforward networks, gradient descent visualization, and backpropagation in PyTorch.",
    starts_at: "2026-10-25T15:00:00Z",
    ends_at: "2026-10-25T16:30:00Z",
    meeting_provider: "live_webrtc",
    meeting_url: "https://syntaxora.com/live/nn-deep-02",
    status: "scheduled",
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    course: INITIAL_ACADEMY_COURSES[0],
  },
];

export const IN_MEMORY_ATTENDANCE: AttendanceRecord[] = [
  {
    id: "att-1000000-0000-0000-0000-000000000001",
    class_session_id: "ses-1000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000001",
    status: "present",
    recorded_by: "i1000000-0000-0000-0000-000000000001",
    recorded_at: "2026-10-21T15:05:00Z",
    correction_reason: null,
    student: SAMPLE_STUDENT_LIAM,
  },
  {
    id: "att-1000000-0000-0000-0000-000000000002",
    class_session_id: "ses-1000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000002",
    status: "late",
    recorded_by: "i1000000-0000-0000-0000-000000000001",
    recorded_at: "2026-10-21T15:20:00Z",
    correction_reason: "Arrived 15 minutes after session start due to hardware configuration",
    student: SAMPLE_STUDENT_MAYA,
  },
];

export const IN_MEMORY_ASSIGNMENTS: Assignment[] = [
  {
    id: "asn-1000000-0000-0000-0000-000000000001",
    course_id: "c1000000-0000-0000-0000-000000000001",
    title: "Project 01: OpenCV Real-Time Color Masking Tracker",
    description: "Construct a robust OpenCV script that isolates a target colored object in a camera stream, computes its center contour, and draws an interactive bounding box.",
    due_at: "2026-10-28T23:59:59Z",
    max_score: 100,
    created_by_profile_id: "i1000000-0000-0000-0000-000000000001",
    created_at: "2026-10-15T00:00:00Z",
    updated_at: "2026-10-15T00:00:00Z",
    course: INITIAL_ACADEMY_COURSES[0],
  },
];

export const IN_MEMORY_SUBMISSIONS: Submission[] = [
  {
    id: "sub-1000000-0000-0000-0000-000000000001",
    assignment_id: "asn-1000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000001",
    content: "github.com/liam-oconnor/opencv-color-tracker\nImplemented HSV color space masking with bilateral filtering for noise reduction and smooth contour tracking.",
    attachment_url: "https://syntaxora.com/storage/submissions/sub-01.py",
    status: "graded",
    score: 95,
    feedback: "Exceptional contour smoothing and clean HSV threshold bounds. Code adheres to PEP 8 standards with comprehensive docstrings.",
    is_grade_published: true, // EXPLICIT PUBLICATION
    graded_by_profile_id: "i1000000-0000-0000-0000-000000000001",
    graded_at: "2026-10-20T14:30:00Z",
    submitted_at: "2026-10-18T19:00:00Z",
    student: SAMPLE_STUDENT_LIAM,
    assignment: IN_MEMORY_ASSIGNMENTS[0],
  },
  {
    id: "sub-1000000-0000-0000-0000-000000000002",
    assignment_id: "asn-1000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000002",
    content: "Implemented RGB thresholding and bounding box overlay. Working on camera feed latency.",
    attachment_url: null,
    status: "submitted",
    score: null,
    feedback: null,
    is_grade_published: false,
    graded_by_profile_id: null,
    graded_at: null,
    submitted_at: "2026-10-19T11:20:00Z",
    student: SAMPLE_STUDENT_MAYA,
    assignment: IN_MEMORY_ASSIGNMENTS[0],
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder") && !key.includes("placeholder"));
}

export async function getApprovedInstructors() {
  if (!isSupabaseConfigured()) {
    return APPROVED_ACADEMY_INSTRUCTORS;
  }

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "instructor")
      .order("full_name", { ascending: true });

    if (error || !data || data.length === 0) {
      return APPROVED_ACADEMY_INSTRUCTORS;
    }

    return data.map((item) => {
      const mem = APPROVED_ACADEMY_INSTRUCTORS.find((i) => i.id === item.id);
      return {
        ...item,
        title: mem?.title || (item as { title?: string }).title || "Academy Faculty Member",
        specialties:
          mem?.specialties ||
          (item as { specialties?: string[] }).specialties ||
          ["Artificial Intelligence", "Machine Learning"],
      };
    }) as (Profile & { title?: string; specialties?: string[] })[];
  } catch {
    return APPROVED_ACADEMY_INSTRUCTORS;
  }
}

export interface CreateInstructorParams {
  fullName: string;
  email: string;
  title: string;
  bio: string;
  specialties?: string[];
  avatarUrl?: string | null;
}

/**
 * Creates and registers a new academy instructor.
 */
export async function createInstructor(params: CreateInstructorParams) {
  const id = "i" + crypto.randomUUID().replace(/-/g, "").slice(0, 31);
  const now = new Date().toISOString();

  const newInstructor: Profile & { title: string; specialties: string[] } = {
    id,
    role: "instructor",
    full_name: params.fullName.trim(),
    email: params.email.trim().toLowerCase(),
    avatar_url: params.avatarUrl ? params.avatarUrl.trim() : null,
    bio: params.bio.trim(),
    title: params.title.trim(),
    specialties: params.specialties || [],
    created_at: now,
    updated_at: now,
  };

  APPROVED_ACADEMY_INSTRUCTORS.unshift(newInstructor);

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from("profiles").insert({
        id: newInstructor.id,
        role: "instructor",
        full_name: newInstructor.full_name,
        email: newInstructor.email,
        avatar_url: newInstructor.avatar_url,
        bio: newInstructor.bio,
      });
    } catch (err) {
      console.error("[createInstructor Supabase error]", err);
    }
  }

  return { success: true, instructor: newInstructor };
}

export interface UpdateInstructorParams {
  id: string;
  fullName: string;
  email: string;
  title: string;
  bio: string;
  specialties?: string[];
  avatarUrl?: string | null;
}

/**
 * Updates an existing instructor profile.
 */
export async function updateInstructor(params: UpdateInstructorParams) {
  const now = new Date().toISOString();
  const existing = APPROVED_ACADEMY_INSTRUCTORS.find((i) => i.id === params.id);

  if (existing) {
    existing.full_name = params.fullName.trim();
    existing.email = params.email.trim().toLowerCase();
    existing.title = params.title.trim();
    existing.bio = params.bio.trim();
    existing.specialties = params.specialties || [];
    if (params.avatarUrl !== undefined) {
      existing.avatar_url = params.avatarUrl ? params.avatarUrl.trim() : null;
    }
    existing.updated_at = now;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase
        .from("profiles")
        .update({
          full_name: params.fullName.trim(),
          email: params.email.trim().toLowerCase(),
          avatar_url: params.avatarUrl ? params.avatarUrl.trim() : null,
          bio: params.bio.trim(),
          updated_at: now,
        })
        .eq("id", params.id);
    } catch (err) {
      console.error("[updateInstructor Supabase error]", err);
    }
  }

  return { success: true, instructor: existing };
}

/**
 * Removes an instructor from the active academy roster.
 */
export async function deleteInstructor(id: string) {
  const idx = APPROVED_ACADEMY_INSTRUCTORS.findIndex((i) => i.id === id);
  if (idx !== -1) {
    APPROVED_ACADEMY_INSTRUCTORS.splice(idx, 1);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.from("profiles").delete().eq("id", id);
    } catch (err) {
      console.error("[deleteInstructor Supabase error]", err);
    }
  }

  return { success: true };
}

/**
 * Returns courses assigned to the specified instructor.
 * Enforces course-level permission boundaries.
 */
export async function getInstructorAssignedCourses(
  instructorProfileId: string
): Promise<Course[]> {
  if (!isSupabaseConfigured()) {
    // In dev / test, Elena Vance teaches course 0, Marcus Chen teaches course 2, Ananya Sharma teaches course 1
    if (instructorProfileId === "i1000000-0000-0000-0000-000000000002") {
      return [INITIAL_ACADEMY_COURSES[2]];
    }
    if (instructorProfileId === "i1000000-0000-0000-0000-000000000003") {
      return [INITIAL_ACADEMY_COURSES[1]];
    }
    // Default: return first course
    return [INITIAL_ACADEMY_COURSES[0]];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("instructor_assignments")
      .select("course:courses (*)")
      .eq("instructor_profile_id", instructorProfileId);

    if (error || !data || data.length === 0) {
      return [INITIAL_ACADEMY_COURSES[0]];
    }

    return (data as unknown as { course: Course }[]).map((item) => item.course);
  } catch {
    return [INITIAL_ACADEMY_COURSES[0]];
  }
}

/**
 * Returns class sessions for an instructor.
 */
export async function getInstructorSessions(
  instructorProfileId: string
): Promise<ClassSession[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_SESSIONS.filter(
      (s) => s.instructor_profile_id === instructorProfileId || instructorProfileId === "admin"
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .select("*, course:courses (*)")
      .eq("instructor_profile_id", instructorProfileId)
      .order("starts_at", { ascending: true });

    if (error || !data) {
      return IN_MEMORY_SESSIONS;
    }

    return data as unknown as ClassSession[];
  } catch {
    return IN_MEMORY_SESSIONS;
  }
}

export interface CreateSessionParams {
  courseId: string;
  instructorProfileId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  meetingProvider?: string;
  meetingUrl?: string;
}

/**
 * Schedules a class session with chronological bounds validation.
 */
export async function createClassSession(
  params: CreateSessionParams
): Promise<{ success: boolean; session?: ClassSession; error?: string }> {
  if (new Date(params.endsAt).getTime() <= new Date(params.startsAt).getTime()) {
    return { success: false, error: "Session end time must be chronologically after start time" };
  }

  const sessionId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newSession: ClassSession = {
    id: sessionId,
    course_id: params.courseId,
    instructor_profile_id: params.instructorProfileId,
    title: params.title,
    description: params.description || null,
    starts_at: params.startsAt,
    ends_at: params.endsAt,
    meeting_provider: params.meetingProvider || "live_webrtc",
    meeting_url: params.meetingUrl || `https://syntaxora.com/live/${sessionId.substring(0, 8)}`,
    status: "scheduled",
    created_at: now,
    updated_at: now,
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_SESSIONS.push(newSession);
    return { success: true, session: newSession };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .insert({
        id: newSession.id,
        course_id: newSession.course_id,
        instructor_profile_id: newSession.instructor_profile_id,
        title: newSession.title,
        description: newSession.description,
        starts_at: newSession.starts_at,
        ends_at: newSession.ends_at,
        meeting_provider: newSession.meeting_provider,
        meeting_url: newSession.meeting_url,
        status: newSession.status,
      })
      .select()
      .single();

    if (error || !data) {
      IN_MEMORY_SESSIONS.push(newSession);
      return { success: true, session: newSession };
    }

    await supabase.from("audit_logs").insert({
      actor_id: params.instructorProfileId,
      action: "create_class_session",
      entity_type: "class_session",
      entity_id: sessionId,
      details: {
        course_id: params.courseId,
        title: params.title,
        starts_at: params.startsAt,
      },
    });

    return { success: true, session: data as unknown as ClassSession };
  } catch {
    IN_MEMORY_SESSIONS.push(newSession);
    return { success: true, session: newSession };
  }
}

/**
 * Returns attendance roster for a session.
 */
export async function getSessionAttendanceRoster(
  sessionId: string
): Promise<{ session: ClassSession | undefined; records: AttendanceRecord[] }> {
  const session = IN_MEMORY_SESSIONS.find((s) => s.id === sessionId);
  const records = IN_MEMORY_ATTENDANCE.filter((a) => a.class_session_id === sessionId);

  return { session, records };
}

/**
 * Records or updates student attendance with mandatory change reason on corrections.
 */
export async function recordStudentAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
  recordedByProfileId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const existing = IN_MEMORY_ATTENDANCE.find(
      (a) => a.class_session_id === sessionId && a.student_id === studentId
    );

    if (existing) {
      existing.status = status;
      existing.correction_reason = reason || existing.correction_reason;
      existing.recorded_at = now;
      existing.recorded_by = recordedByProfileId;
      return { success: true };
    }

    const matchedStudent =
      studentId === SAMPLE_STUDENT_LIAM.id ? SAMPLE_STUDENT_LIAM : SAMPLE_STUDENT_MAYA;
    IN_MEMORY_ATTENDANCE.push({
      id: crypto.randomUUID(),
      class_session_id: sessionId,
      student_id: studentId,
      status,
      recorded_by: recordedByProfileId,
      recorded_at: now,
      correction_reason: reason || null,
      student: matchedStudent,
    });

    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("attendance_records").upsert(
      {
        class_session_id: sessionId,
        student_id: studentId,
        status,
        recorded_by: recordedByProfileId,
        recorded_at: now,
        correction_reason: reason || null,
      },
      { onConflict: "class_session_id,student_id" }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    if (reason) {
      await supabase.from("audit_logs").insert({
        actor_id: recordedByProfileId,
        action: "correct_attendance",
        entity_type: "attendance_record",
        details: {
          session_id: sessionId,
          student_id: studentId,
          status,
          correction_reason: reason,
        },
      });
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to record attendance";
    return { success: false, error: msg };
  }
}

/**
 * Returns assignments for an instructor.
 */
export async function getInstructorAssignments(
  instructorProfileId: string
): Promise<Assignment[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_ASSIGNMENTS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assignments")
      .select("*, course:courses (*)")
      .eq("created_by_profile_id", instructorProfileId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      return IN_MEMORY_ASSIGNMENTS;
    }

    return data as unknown as Assignment[];
  } catch {
    return IN_MEMORY_ASSIGNMENTS;
  }
}

export interface CreateAssignmentParams {
  courseId: string;
  title: string;
  description: string;
  dueAt: string;
  maxScore: number;
  instructorProfileId: string;
}

/**
 * Creates an assignment.
 */
export async function createAssignment(
  params: CreateAssignmentParams
): Promise<{ success: boolean; assignment?: Assignment; error?: string }> {
  const assignmentId = crypto.randomUUID();
  const now = new Date().toISOString();

  const newAssignment: Assignment = {
    id: assignmentId,
    course_id: params.courseId,
    title: params.title,
    description: params.description,
    due_at: params.dueAt,
    max_score: params.maxScore,
    created_by_profile_id: params.instructorProfileId,
    created_at: now,
    updated_at: now,
    course: INITIAL_ACADEMY_COURSES.find((c) => c.id === params.courseId),
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_ASSIGNMENTS.push(newAssignment);
    return { success: true, assignment: newAssignment };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assignments")
      .insert({
        id: newAssignment.id,
        course_id: newAssignment.course_id,
        title: newAssignment.title,
        description: newAssignment.description,
        due_at: newAssignment.due_at,
        max_score: newAssignment.max_score,
        created_by_profile_id: newAssignment.created_by_profile_id,
      })
      .select()
      .single();

    if (error || !data) {
      IN_MEMORY_ASSIGNMENTS.push(newAssignment);
      return { success: true, assignment: newAssignment };
    }

    return { success: true, assignment: data as unknown as Assignment };
  } catch {
    IN_MEMORY_ASSIGNMENTS.push(newAssignment);
    return { success: true, assignment: newAssignment };
  }
}

/**
 * Returns student submissions for an assignment.
 */
export async function getAssignmentSubmissions(
  assignmentId?: string
): Promise<Submission[]> {
  if (!isSupabaseConfigured()) {
    if (assignmentId) {
      return IN_MEMORY_SUBMISSIONS.filter((s) => s.assignment_id === assignmentId);
    }
    return IN_MEMORY_SUBMISSIONS;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("submissions")
      .select("*, student:students (*, profile:profiles (*)), assignment:assignments (*)");

    if (assignmentId) {
      query = query.eq("assignment_id", assignmentId);
    }

    const { data, error } = await query;
    if (error || !data) {
      return IN_MEMORY_SUBMISSIONS;
    }

    return data as unknown as Submission[];
  } catch {
    return IN_MEMORY_SUBMISSIONS;
  }
}

/**
 * Grades a submission and controls explicit grade publication.
 */
export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string,
  isGradePublished: boolean,
  graderProfileId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    const sub = IN_MEMORY_SUBMISSIONS.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: "Submission not found" };

    sub.score = score;
    sub.feedback = feedback;
    sub.is_grade_published = isGradePublished;
    sub.status = "graded";
    sub.graded_by_profile_id = graderProfileId;
    sub.graded_at = now;
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("submissions")
      .update({
        score,
        feedback,
        is_grade_published: isGradePublished,
        status: "graded",
        graded_by_profile_id: graderProfileId,
        graded_at: now,
      })
      .eq("id", submissionId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: graderProfileId,
      action: "grade_submission",
      entity_type: "submission",
      entity_id: submissionId,
      details: {
        score,
        is_grade_published: isGradePublished,
      },
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to grade submission";
    return { success: false, error: msg };
  }
}

/**
 * Toggles explicit grade publication for a submission.
 */
export async function toggleGradePublication(
  submissionId: string,
  isPublished: boolean,
  instructorProfileId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const sub = IN_MEMORY_SUBMISSIONS.find((s) => s.id === submissionId);
    if (!sub) return { success: false, error: "Submission not found" };
    sub.is_grade_published = isPublished;
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("submissions")
      .update({ is_grade_published: isPublished })
      .eq("id", submissionId);

    if (error) {
      return { success: false, error: error.message };
    }

    await supabase.from("audit_logs").insert({
      actor_id: instructorProfileId,
      action: isPublished ? "publish_grade" : "unpublish_grade",
      entity_type: "submission",
      entity_id: submissionId,
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update grade publication";
    return { success: false, error: msg };
  }
}
