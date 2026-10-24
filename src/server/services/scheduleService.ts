import { createClient } from "@/lib/supabase/server";
import { ClassSession, SessionStatus } from "@/types";
import { getBatchById, getBatchScheduleTemplates } from "./batchService";
import { IN_MEMORY_SESSIONS } from "./instructorService";
import { isMeetingProviderConfigured } from "@/server/integrations/meeting/meetingAdapter";
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

export interface SessionFilterOptions {
  courseId?: string;
  batchId?: string;
  instructorId?: string;
  status?: SessionStatus;
  date?: string; // YYYY-MM-DD
}

export async function getAllSessions(filters?: SessionFilterOptions): Promise<ClassSession[]> {
  if (!isSupabaseConfigured()) {
    let result = [...IN_MEMORY_SESSIONS];
    if (filters?.courseId) result = result.filter((s) => s.course_id === filters.courseId);
    if (filters?.batchId) result = result.filter((s) => s.batch_id === filters.batchId);
    if (filters?.instructorId) result = result.filter((s) => s.instructor_profile_id === filters.instructorId);
    if (filters?.status) result = result.filter((s) => s.status === filters.status);
    if (filters?.date) {
      result = result.filter((s) => s.starts_at.startsWith(filters.date!));
    }
    return result.sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("class_sessions")
      .select(`
        *,
        course:courses(*),
        batch:batches(*),
        instructor:profiles!class_sessions_instructor_profile_id_fkey(*)
      `)
      .order("starts_at", { ascending: true });

    if (filters?.courseId) query = query.eq("course_id", filters.courseId);
    if (filters?.batchId) query = query.eq("batch_id", filters.batchId);
    if (filters?.instructorId) query = query.eq("instructor_profile_id", filters.instructorId);
    if (filters?.status) query = query.eq("status", filters.status);
    if (filters?.date) {
      query = query
        .gte("starts_at", `${filters.date}T00:00:00Z`)
        .lte("starts_at", `${filters.date}T23:59:59Z`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return IN_MEMORY_SESSIONS;
    }

    return data as unknown as ClassSession[];
  } catch {
    return IN_MEMORY_SESSIONS;
  }
}

export interface ScheduleAlerts {
  startsSoon15: ClassSession[];
  startsSoon5: ClassSession[];
  liveNow: ClassSession[];
  overdue: ClassSession[];
  missingProvider: ClassSession[];
  unassignedInstructor: ClassSession[];
  todaySchedule: ClassSession[];
  tomorrowSchedule: ClassSession[];
}

export async function getUpcomingSessionAlerts(): Promise<ScheduleAlerts> {
  const sessions = await getAllSessions();
  const now = new Date();
  const nowMs = now.getTime();
  const in5MinMs = nowMs + 5 * 60 * 1000;
  const in15MinMs = nowMs + 15 * 60 * 1000;

  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(nowMs + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const startsSoon15: ClassSession[] = [];
  const startsSoon5: ClassSession[] = [];
  const liveNow: ClassSession[] = [];
  const overdue: ClassSession[] = [];
  const missingProvider: ClassSession[] = [];
  const unassignedInstructor: ClassSession[] = [];
  const todaySchedule: ClassSession[] = [];
  const tomorrowSchedule: ClassSession[] = [];

  for (const s of sessions) {
    if (s.status === "cancelled") continue;

    const startMs = new Date(s.starts_at).getTime();
    const endMs = new Date(s.ends_at).getTime();

    // Check live state
    if (s.status === "in_progress" || (startMs <= nowMs && endMs >= nowMs)) {
      liveNow.push(s);
    }

    // Check countdown windows for scheduled sessions
    if (s.status === "scheduled") {
      if (startMs > nowMs && startMs <= in15MinMs) {
        startsSoon15.push(s);
      }
      if (startMs > nowMs && startMs <= in5MinMs) {
        startsSoon5.push(s);
      }
      if (startMs < nowMs) {
        overdue.push(s);
      }
    }

    // Missing provider check
    if (s.meeting_provider === "zoom" && !isMeetingProviderConfigured("zoom")) {
      missingProvider.push(s);
    } else if (s.meeting_provider === "google_meet" && !isMeetingProviderConfigured("google_meet")) {
      missingProvider.push(s);
    }

    // Missing instructor check
    if (!s.instructor_profile_id) {
      unassignedInstructor.push(s);
    }

    // Daily buckets
    if (s.starts_at.startsWith(todayStr)) {
      todaySchedule.push(s);
    } else if (s.starts_at.startsWith(tomorrowStr)) {
      tomorrowSchedule.push(s);
    }
  }

  return {
    startsSoon15,
    startsSoon5,
    liveNow,
    overdue,
    missingProvider,
    unassignedInstructor,
    todaySchedule,
    tomorrowSchedule,
  };
}

/**
 * Idempotently generates class sessions for a batch over a planning window (e.g. 30 days)
 * from its recurring schedule templates.
 */
export async function generateSessionsForBatch(
  batchId: string,
  windowDays: number = 30,
  actorProfileId?: string
): Promise<{ generatedCount: number; sessions: ClassSession[]; error?: string }> {
  const batch = await getBatchById(batchId);
  if (!batch) {
    return { generatedCount: 0, sessions: [], error: "Batch not found" };
  }

  const templates = await getBatchScheduleTemplates(batchId);
  if (templates.length === 0) {
    return { generatedCount: 0, sessions: [], error: "No schedule templates defined for this batch." };
  }

  const existingSessions = await getAllSessions({ batchId });
  const existingStartTimes = new Set(existingSessions.map((s) => s.starts_at));

  const newSessions: ClassSession[] = [];
  const now = new Date();
  const windowEnd = new Date(now.getTime() + windowDays * 24 * 60 * 60 * 1000);

  // Iterate day by day over the planning window
  const currentDay = new Date(now);
  currentDay.setHours(0, 0, 0, 0);

  while (currentDay <= windowEnd) {
    const weekday = currentDay.getDay(); // 0 = Sun, 1 = Mon ...
    const dateStr = currentDay.toISOString().split("T")[0];

    // Find templates matching this weekday
    const matchingTemplates = templates.filter(
      (t) =>
        t.weekday === weekday &&
        dateStr >= t.effective_start_date &&
        dateStr <= t.effective_end_date
    );

    for (const t of matchingTemplates) {
      // Build ISO timestamptz for starts_at and ends_at
      const startsAt = `${dateStr}T${t.start_time_local}Z`;
      const endsAt = `${dateStr}T${t.end_time_local}Z`;

      // IDEMPOTENCY CHECK: If session already exists on this exact start time, skip!
      if (existingStartTimes.has(startsAt)) {
        continue;
      }

      const session: ClassSession = {
        id: `ses-gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        course_id: batch.course_id,
        batch_id: batch.id,
        instructor_profile_id: t.instructor_profile_id || batch.primary_instructor_profile_id,
        title: `${batch.name} — Class Session`,
        description: `Scheduled session generated from recurring template (Weekday ${t.weekday})`,
        starts_at: startsAt,
        ends_at: endsAt,
        timezone: t.timezone || batch.timezone,
        meeting_provider: "live_webrtc",
        status: "scheduled",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      newSessions.push(session);
      existingStartTimes.add(startsAt); // Prevent intra-loop collision
    }

    currentDay.setDate(currentDay.getDate() + 1);
  }

  if (newSessions.length === 0) {
    return { generatedCount: 0, sessions: [] };
  }

  if (!isSupabaseConfigured()) {
    IN_MEMORY_SESSIONS.push(...newSessions);
    return { generatedCount: newSessions.length, sessions: newSessions };
  }

  try {
    const supabase = await createClient();
    const payload = newSessions.map((s) => ({
      course_id: s.course_id,
      batch_id: s.batch_id,
      instructor_profile_id: s.instructor_profile_id,
      title: s.title,
      description: s.description,
      starts_at: s.starts_at,
      ends_at: s.ends_at,
      timezone: s.timezone,
      meeting_provider: s.meeting_provider,
      status: "scheduled",
      created_by_profile_id: actorProfileId || null,
    }));

    const { data, error } = await supabase.from("class_sessions").insert(payload).select();
    if (error) {
      return { generatedCount: 0, sessions: [], error: error.message };
    }

    await logAuditEvent(
      actorProfileId || null,
      "SESSIONS_BATCH_GENERATED",
      "BATCH",
      batchId,
      { count: data.length, windowDays }
    );

    return { generatedCount: data.length, sessions: data as unknown as ClassSession[] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { generatedCount: 0, sessions: [], error: msg };
  }
}

export async function rescheduleSession(
  sessionId: string,
  newStartsAt: string,
  newEndsAt: string,
  reason: string,
  actorProfileId?: string
): Promise<{ success: boolean; session?: ClassSession; error?: string }> {
  if (new Date(newEndsAt) <= new Date(newStartsAt)) {
    return { success: false, error: "Session end time must be after start time." };
  }

  if (!isSupabaseConfigured()) {
    const session = IN_MEMORY_SESSIONS.find((s) => s.id === sessionId);
    if (!session) return { success: false, error: "Session not found" };
    session.starts_at = newStartsAt;
    session.ends_at = newEndsAt;
    session.updated_at = new Date().toISOString();
    return { success: true, session };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("class_sessions")
      .update({
        starts_at: newStartsAt,
        ends_at: newEndsAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId || null,
      "SESSION_RESCHEDULED",
      "CLASS_SESSION",
      sessionId,
      { newStartsAt, newEndsAt, reason }
    );

    return { success: true, session: data as unknown as ClassSession };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}
