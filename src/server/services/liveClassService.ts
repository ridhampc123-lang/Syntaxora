import { createClient } from "@/lib/supabase/server";
import { ClassSession } from "@/types";
import { getAllSessions } from "./scheduleService";
import { getStudentByProfileId } from "./studentService";
import { getEnrollments } from "./enrollmentService";
import { createClassMeeting, MeetingResult } from "@/server/integrations/meeting/meetingAdapter";
import { logAuditEvent } from "@/server/actions/admin";

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

export interface LiveClassStartResult {
  success: boolean;
  session?: ClassSession;
  meetingResult?: MeetingResult;
  error?: string;
}

export async function prepareOrStartLiveClass(
  sessionId: string,
  actorProfileId: string,
  actorRole: string
): Promise<LiveClassStartResult> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return { success: false, error: "Class session not found." };
  }

  // Section 10 & Phase 7/8: Only assigned instructor or admin can start the session
  const isAssignedInstructor = session.instructor_profile_id === actorProfileId;
  const isAdmin = actorRole === "admin";

  if (!isAdmin && !isAssignedInstructor) {
    return {
      success: false,
      error: "Unauthorized: You are not the assigned instructor for this session.",
    };
  }

  // Idempotency: If already in_progress and meeting_url exists, return active state
  if (session.status === "in_progress" && session.meeting_url) {
    return {
      success: true,
      session,
      meetingResult: {
        configured: true,
        provider: (session.meeting_provider as "zoom" | "google_meet" | "live_webrtc") || "live_webrtc",
        meetingUrl: session.meeting_url,
        meetingId: session.provider_meeting_id || undefined,
      },
    };
  }

  // Request meeting from provider adapter
  const meetingResult = await createClassMeeting({
    sessionId: session.id,
    title: session.title,
    startsAt: session.starts_at,
    durationMinutes: 90,
    providerPreference: (session.meeting_provider as "zoom" | "google_meet" | "live_webrtc") || undefined,
  });

  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    session.status = "in_progress";
    session.meeting_url = meetingResult.meetingUrl;
    session.provider_meeting_id = meetingResult.meetingId || null;
    session.started_at = nowIso;
    session.updated_at = nowIso;
    return { success: true, session, meetingResult };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .update({
        status: "in_progress",
        meeting_url: meetingResult.meetingUrl,
        provider_meeting_id: meetingResult.meetingId || null,
        started_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent(
      actorProfileId,
      "LIVE_CLASS_STARTED",
      "CLASS_SESSION",
      sessionId,
      {
        provider: meetingResult.provider,
        configured: meetingResult.configured,
        meetingId: meetingResult.meetingId,
      }
    );

    return { success: true, session: data as unknown as ClassSession, meetingResult };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function completeLiveClass(
  sessionId: string,
  actorProfileId: string,
  actorRole: string
): Promise<{ success: boolean; session?: ClassSession; error?: string }> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    return { success: false, error: "Class session not found." };
  }

  const isAssignedInstructor = session.instructor_profile_id === actorProfileId;
  const isAdmin = actorRole === "admin";

  if (!isAdmin && !isAssignedInstructor) {
    return {
      success: false,
      error: "Unauthorized: You are not authorized to complete this session.",
    };
  }

  const nowIso = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    session.status = "completed";
    session.ended_at = nowIso;
    session.updated_at = nowIso;
    return { success: true, session };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .update({
        status: "completed",
        ended_at: nowIso,
        updated_at: nowIso,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId,
      "LIVE_CLASS_COMPLETED",
      "CLASS_SESSION",
      sessionId,
      { completed_by: actorProfileId }
    );

    return { success: true, session: data as unknown as ClassSession };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export interface StudentJoinAuthorizationResult {
  authorized: boolean;
  meetingUrl?: string | null;
  sessionTitle?: string;
  reason?: string;
}

/**
 * Server-side authorization check before issuing live-class join access to a student.
 */
export async function authorizeStudentJoin(
  sessionId: string,
  studentProfileId: string
): Promise<StudentJoinAuthorizationResult> {
  // 1. Resolve student record
  const student = await getStudentByProfileId(studentProfileId);
  if (!student) {
    return { authorized: false, reason: "No student profile found for this account." };
  }

  // 2. Resolve session
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) {
    return { authorized: false, reason: "Class session not found." };
  }

  if (session.status === "cancelled") {
    return { authorized: false, reason: "This class session has been cancelled." };
  }

  // 3. Verify student holds an active enrollment in this course & batch
  const enrollments = await getEnrollments({ studentId: student.id });
  const matchingEnrollment = enrollments.find((e) => {
    if (e.course_id !== session.course_id) return false;
    // If session is batch-scoped, student must belong to the exact batch
    if (session.batch_id && e.batch_id !== session.batch_id) return false;
    return true;
  });

  if (!matchingEnrollment) {
    return {
      authorized: false,
      reason: "You are not enrolled in the cohort scheduled for this session.",
    };
  }

  if (matchingEnrollment.status !== "active") {
    return {
      authorized: false,
      reason: `Your enrollment is currently ${matchingEnrollment.status}. Active status required to join live classes.`,
    };
  }

  // Check enrollment expiration if configured
  if (matchingEnrollment.ends_at && new Date(matchingEnrollment.ends_at) < new Date()) {
    return {
      authorized: false,
      reason: "Your enrollment period for this course has expired.",
    };
  }

  // 4. Verify join window:
  // Allowed if:
  // - session is in_progress
  // - OR starts_at is within 15 minutes in the future and ends_at is in the future
  const now = new Date().getTime();
  const startsAtMs = new Date(session.starts_at).getTime();
  const endsAtMs = new Date(session.ends_at).getTime();
  const earlyWindowMs = 15 * 60 * 1000;

  if (session.status === "completed" || now > endsAtMs + 30 * 60 * 1000) {
    return { authorized: false, reason: "This session has already ended." };
  }

  if (session.status !== "in_progress" && now < startsAtMs - earlyWindowMs) {
    return {
      authorized: false,
      reason: "Classroom opens 15 minutes before scheduled start time.",
    };
  }

  // Authorized! Return meeting link
  return {
    authorized: true,
    meetingUrl: session.meeting_url || `https://syntaxora.com/live/${session.id.substring(0, 8)}`,
    sessionTitle: session.title,
  };
}
