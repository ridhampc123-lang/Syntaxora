import { createClient } from "@/lib/supabase/server";
import { Batch, BatchStatus, BatchScheduleTemplate, Student } from "@/types";
import { INITIAL_ACADEMY_COURSES } from "./courseService";
import { APPROVED_ACADEMY_INSTRUCTORS } from "./instructorService";
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

// Canonical in-memory batch store for development & testing
export const IN_MEMORY_BATCHES: (Batch & { enrolled_students?: Student[] })[] = [
  {
    id: "b1000000-0000-0000-0000-000000000001",
    course_id: "c1000000-0000-0000-0000-000000000001",
    name: "Teens AI Robotics — Cohort Alpha (Morning)",
    batch_code: "BAT-AIR-01",
    primary_instructor_profile_id: "i1000000-0000-0000-0000-000000000001",
    capacity: 20,
    start_at: "2026-10-01T09:00:00Z",
    end_at: "2026-12-15T11:00:00Z",
    timezone: "Asia/Kolkata",
    status: "active",
    waitlist_enabled: true,
    waitlist_capacity: 5,
    created_at: "2026-09-15T00:00:00Z",
    updated_at: "2026-09-15T00:00:00Z",
    course: INITIAL_ACADEMY_COURSES[0],
    primary_instructor: APPROVED_ACADEMY_INSTRUCTORS[0],
    enrolled_count: 5,
  },
  {
    id: "b1000000-0000-0000-0000-000000000002",
    course_id: "c1000000-0000-0000-0000-000000000002",
    name: "Young Explorers — Weekend Lab 1",
    batch_code: "BAT-YAE-01",
    primary_instructor_profile_id: "i1000000-0000-0000-0000-000000000003",
    capacity: 15,
    start_at: "2026-10-15T10:00:00Z",
    end_at: "2026-12-30T12:00:00Z",
    timezone: "Asia/Kolkata",
    status: "upcoming",
    waitlist_enabled: false,
    waitlist_capacity: 0,
    created_at: "2026-09-20T00:00:00Z",
    updated_at: "2026-09-20T00:00:00Z",
    course: INITIAL_ACADEMY_COURSES[1],
    primary_instructor: APPROVED_ACADEMY_INSTRUCTORS[2],
    enrolled_count: 2,
  },
];

export const IN_MEMORY_SCHEDULE_TEMPLATES: BatchScheduleTemplate[] = [
  {
    id: "st-1000000-0000-0000-0000-000000000001",
    batch_id: "b1000000-0000-0000-0000-000000000001",
    weekday: 1, // Monday
    start_time_local: "09:00:00",
    end_time_local: "10:30:00",
    timezone: "Asia/Kolkata",
    effective_start_date: "2026-10-01",
    effective_end_date: "2026-12-15",
    instructor_profile_id: "i1000000-0000-0000-0000-000000000001",
    created_at: "2026-09-15T00:00:00Z",
    updated_at: "2026-09-15T00:00:00Z",
  },
  {
    id: "st-1000000-0000-0000-0000-000000000002",
    batch_id: "b1000000-0000-0000-0000-000000000001",
    weekday: 3, // Wednesday
    start_time_local: "09:00:00",
    end_time_local: "10:30:00",
    timezone: "Asia/Kolkata",
    effective_start_date: "2026-10-01",
    effective_end_date: "2026-12-15",
    instructor_profile_id: "i1000000-0000-0000-0000-000000000001",
    created_at: "2026-09-15T00:00:00Z",
    updated_at: "2026-09-15T00:00:00Z",
  },
];

export interface BatchFilterOptions {
  courseId?: string;
  instructorId?: string;
  status?: BatchStatus;
  search?: string;
}

export async function getBatches(filters?: BatchFilterOptions): Promise<Batch[]> {
  if (!isSupabaseConfigured()) {
    let result = [...IN_MEMORY_BATCHES];
    if (filters?.courseId) {
      result = result.filter((b) => b.course_id === filters.courseId);
    }
    if (filters?.instructorId) {
      result = result.filter((b) => b.primary_instructor_profile_id === filters.instructorId);
    }
    if (filters?.status) {
      result = result.filter((b) => b.status === filters.status);
    }
    if (filters?.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(term) ||
          b.batch_code.toLowerCase().includes(term) ||
          b.course?.title.toLowerCase().includes(term)
      );
    }
    return result;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("batches")
      .select(`
        *,
        course:courses(*),
        primary_instructor:profiles!batches_primary_instructor_profile_id_fkey(*),
        enrollments:enrollments(count)
      `)
      .order("start_at", { ascending: false });

    if (filters?.courseId) {
      query = query.eq("course_id", filters.courseId);
    }
    if (filters?.instructorId) {
      query = query.eq("primary_instructor_profile_id", filters.instructorId);
    }
    if (filters?.status) {
      query = query.eq("status", filters.status);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,batch_code.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return IN_MEMORY_BATCHES;
    }

    return data.map((b) => {
      const record = b as unknown as Batch & { enrollments?: { count: number }[] };
      return {
        ...record,
        enrolled_count: record.enrollments?.[0]?.count || 0,
      };
    }) as Batch[];
  } catch {
    return IN_MEMORY_BATCHES;
  }
}

export async function getBatchById(id: string): Promise<Batch | null> {
  if (!isSupabaseConfigured()) {
    const found = IN_MEMORY_BATCHES.find((b) => b.id === id);
    return found || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("batches")
      .select(`
        *,
        course:courses(*),
        primary_instructor:profiles!batches_primary_instructor_profile_id_fkey(*),
        enrollments:enrollments(
          id,
          status,
          student:students(
            id,
            student_code,
            profile:profiles(*)
          )
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const found = IN_MEMORY_BATCHES.find((b) => b.id === id);
      return found || null;
    }

    return {
      ...data,
      enrolled_count: data.enrollments?.length || 0,
    } as unknown as Batch;
  } catch {
    const found = IN_MEMORY_BATCHES.find((b) => b.id === id);
    return found || null;
  }
}

export async function checkInstructorScheduleConflict(
  instructorId: string,
  startsAt: string,
  endsAt: string,
  excludeSessionId?: string
): Promise<{ hasConflict: boolean; conflictingSessionTitle?: string }> {
  if (!isSupabaseConfigured()) {
    return { hasConflict: false };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("class_sessions")
      .select("id, title, starts_at, ends_at")
      .eq("instructor_profile_id", instructorId)
      .neq("status", "cancelled")
      .lt("starts_at", endsAt)
      .gt("ends_at", startsAt);

    if (excludeSessionId) {
      query = query.neq("id", excludeSessionId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return { hasConflict: false };
    }

    return {
      hasConflict: true,
      conflictingSessionTitle: data[0].title,
    };
  } catch {
    return { hasConflict: false };
  }
}

export interface CreateBatchInput {
  courseId: string;
  name: string;
  batchCode: string;
  primaryInstructorId: string;
  capacity: number;
  startAt: string;
  endAt: string;
  timezone?: string;
  waitlistEnabled?: boolean;
  waitlistCapacity?: number;
  actorProfileId?: string;
}

export async function createBatch(
  input: CreateBatchInput
): Promise<{ success: boolean; batch?: Batch; error?: string }> {
  if (new Date(input.endAt) <= new Date(input.startAt)) {
    return { success: false, error: "Batch end date must be strictly after start date." };
  }

  if (input.capacity <= 0) {
    return { success: false, error: "Capacity must be greater than zero." };
  }

  const newBatch: Batch = {
    id: `b-${Date.now()}`,
    course_id: input.courseId,
    name: input.name,
    batch_code: input.batchCode.toUpperCase(),
    primary_instructor_profile_id: input.primaryInstructorId,
    capacity: input.capacity,
    start_at: input.startAt,
    end_at: input.endAt,
    timezone: input.timezone || "Asia/Kolkata",
    status: "upcoming",
    waitlist_enabled: Boolean(input.waitlistEnabled),
    waitlist_capacity: input.waitlistCapacity || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    course: INITIAL_ACADEMY_COURSES.find((c) => c.id === input.courseId),
    primary_instructor: APPROVED_ACADEMY_INSTRUCTORS.find((i) => i.id === input.primaryInstructorId),
    enrolled_count: 0,
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_BATCHES.unshift(newBatch);
    return { success: true, batch: newBatch };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("batches")
      .insert({
        course_id: input.courseId,
        name: input.name,
        batch_code: input.batchCode.toUpperCase(),
        primary_instructor_profile_id: input.primaryInstructorId,
        capacity: input.capacity,
        start_at: input.startAt,
        end_at: input.endAt,
        timezone: input.timezone || "Asia/Kolkata",
        status: "upcoming",
        waitlist_enabled: Boolean(input.waitlistEnabled),
        waitlist_capacity: input.waitlistCapacity || 0,
        created_by_profile_id: input.actorProfileId || null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent(
      input.actorProfileId || null,
      "BATCH_CREATED",
      "BATCH",
      data.id,
      { batch_code: data.batch_code, name: data.name, capacity: data.capacity }
    );

    return { success: true, batch: data as Batch };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function updateBatchStatus(
  batchId: string,
  newStatus: BatchStatus,
  actorProfileId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const batch = IN_MEMORY_BATCHES.find((b) => b.id === batchId);
    if (!batch) return { success: false, error: "Batch not found" };
    batch.status = newStatus;
    batch.updated_at = new Date().toISOString();
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("batches")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", batchId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId || null,
      "BATCH_STATUS_UPDATED",
      "BATCH",
      batchId,
      { newStatus }
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function getBatchScheduleTemplates(batchId: string): Promise<BatchScheduleTemplate[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_SCHEDULE_TEMPLATES.filter((s) => s.batch_id === batchId);
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("batch_schedule_templates")
      .select("*")
      .eq("batch_id", batchId)
      .order("weekday", { ascending: true });

    if (error || !data) {
      return IN_MEMORY_SCHEDULE_TEMPLATES.filter((s) => s.batch_id === batchId);
    }

    return data as BatchScheduleTemplate[];
  } catch {
    return IN_MEMORY_SCHEDULE_TEMPLATES.filter((s) => s.batch_id === batchId);
  }
}

export async function createBatchScheduleTemplate(
  template: Omit<BatchScheduleTemplate, "id" | "created_at" | "updated_at">,
  actorProfileId?: string
): Promise<{ success: boolean; template?: BatchScheduleTemplate; error?: string }> {
  const newTemplate: BatchScheduleTemplate = {
    ...template,
    id: `st-${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_SCHEDULE_TEMPLATES.push(newTemplate);
    return { success: true, template: newTemplate };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("batch_schedule_templates")
      .insert({
        batch_id: template.batch_id,
        weekday: template.weekday,
        start_time_local: template.start_time_local,
        end_time_local: template.end_time_local,
        timezone: template.timezone,
        effective_start_date: template.effective_start_date,
        effective_end_date: template.effective_end_date,
        instructor_profile_id: template.instructor_profile_id || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId || null,
      "SCHEDULE_TEMPLATE_CREATED",
      "BATCH_SCHEDULE",
      data.id,
      { batch_id: template.batch_id, weekday: template.weekday }
    );

    return { success: true, template: data as BatchScheduleTemplate };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}
