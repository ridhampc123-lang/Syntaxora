import { createClient } from "@/lib/supabase/server";
import { Enrollment, EnrollmentStatus, Batch } from "@/types";
import { IN_MEMORY_BATCHES, getBatchById, getBatches } from "./batchService";
import { INITIAL_STUDENTS } from "./adminService";
import { INITIAL_ACADEMY_COURSES } from "./courseService";
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

// In-memory enrollment store for development & testing
export const IN_MEMORY_ENROLLMENTS: Enrollment[] = [
  {
    id: "e1000000-0000-0000-0000-000000000001",
    student_id: "s1000000-0000-0000-0000-000000000001", // Liam
    course_id: "c1000000-0000-0000-0000-000000000001",
    batch_id: "b1000000-0000-0000-0000-000000000001",
    status: "active",
    admission_source: "admission_application",
    payment_status: "verified",
    starts_at: "2026-10-01T00:00:00Z",
    created_at: "2026-09-15T00:00:00Z",
    student: INITIAL_STUDENTS[0],
    course: INITIAL_ACADEMY_COURSES[0],
    batch: IN_MEMORY_BATCHES[0],
  },
  {
    id: "e1000000-0000-0000-0000-000000000002",
    student_id: "s1000000-0000-0000-0000-000000000002", // Maya
    course_id: "c1000000-0000-0000-0000-000000000002",
    batch_id: "b1000000-0000-0000-0000-000000000002",
    status: "active",
    admission_source: "direct_admission",
    payment_status: "verified",
    starts_at: "2026-10-15T00:00:00Z",
    created_at: "2026-09-20T00:00:00Z",
    student: INITIAL_STUDENTS[1],
    course: INITIAL_ACADEMY_COURSES[1],
    batch: IN_MEMORY_BATCHES[1],
  },
];

export interface EnrollmentFilterOptions {
  courseId?: string;
  batchId?: string;
  studentId?: string;
  status?: string;
}

export async function getEnrollments(filters?: EnrollmentFilterOptions): Promise<Enrollment[]> {
  if (!isSupabaseConfigured()) {
    let result = [...IN_MEMORY_ENROLLMENTS];
    if (filters?.courseId) result = result.filter((e) => e.course_id === filters.courseId);
    if (filters?.batchId) result = result.filter((e) => e.batch_id === filters.batchId);
    if (filters?.studentId) result = result.filter((e) => e.student_id === filters.studentId);
    if (filters?.status) result = result.filter((e) => e.status === filters.status);
    return result;
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("enrollments")
      .select(`
        *,
        course:courses(*),
        batch:batches(*),
        student:students(
          id,
          student_code,
          status,
          profile:profiles(*)
        )
      `)
      .order("created_at", { ascending: false });

    if (filters?.courseId) query = query.eq("course_id", filters.courseId);
    if (filters?.batchId) query = query.eq("batch_id", filters.batchId);
    if (filters?.studentId) query = query.eq("student_id", filters.studentId);
    if (filters?.status) query = query.eq("status", filters.status);

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return IN_MEMORY_ENROLLMENTS;
    }

    return data as unknown as Enrollment[];
  } catch {
    return IN_MEMORY_ENROLLMENTS;
  }
}

export async function getStudentsAwaitingBatchAssignment(): Promise<Enrollment[]> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_ENROLLMENTS.filter((e) => !e.batch_id && e.status === "active");
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .select(`
        *,
        course:courses(*),
        student:students(
          id,
          student_code,
          profile:profiles(*)
        )
      `)
      .is("batch_id", null)
      .eq("status", "active");

    if (error || !data) return [];
    return data as unknown as Enrollment[];
  } catch {
    return [];
  }
}

export interface AssignStudentParams {
  studentId: string;
  courseId: string;
  batchId?: string | null;
  admissionSource?: string;
  paymentStatus?: string;
  actorProfileId?: string;
}

export interface AssignStudentResult {
  success: boolean;
  enrollment?: Enrollment;
  error?: string;
  availableAlternativeBatches?: Batch[];
}

export async function assignStudentToBatch(
  params: AssignStudentParams
): Promise<AssignStudentResult> {
  const { studentId, courseId, batchId, admissionSource, paymentStatus, actorProfileId } = params;

  // 1. Check if student already has active enrollment in the same batch or course
  const existingEnrollments = await getEnrollments({ studentId, courseId });
  const activeExisting = existingEnrollments.find(
    (e) => e.status === "active" || e.status === "pending"
  );

  if (activeExisting && activeExisting.batch_id === batchId && batchId) {
    return {
      success: false,
      error: "Student is already actively enrolled in this batch.",
      enrollment: activeExisting,
    };
  }

  // 2. If assigning to a specific batch, validate batch capacity and status
  if (batchId) {
    const batch = await getBatchById(batchId);
    if (!batch) {
      return { success: false, error: "Selected batch not found." };
    }

    if (batch.status === "cancelled" || batch.status === "completed") {
      return {
        success: false,
        error: `Cannot assign student to a ${batch.status} batch.`,
      };
    }

    // Check capacity
    const batchEnrollments = await getEnrollments({ batchId, status: "active" });
    if (batchEnrollments.length >= batch.capacity) {
      // Find alternative active or upcoming batches for this course
      const allCourseBatches = await getBatches({ courseId });
      const availableAlternatives = allCourseBatches.filter(
        (b) =>
          b.id !== batchId &&
          (b.status === "active" || b.status === "upcoming") &&
          (b.enrolled_count ?? 0) < b.capacity
      );

      return {
        success: false,
        error: `Batch capacity of ${batch.capacity} seats is full. Assignment blocked to prevent overbooking.`,
        availableAlternativeBatches: availableAlternatives,
      };
    }
  }

  // 3. If student already has an active course entitlement without a batch, update it!
  if (activeExisting && !activeExisting.batch_id && batchId) {
    if (!isSupabaseConfigured()) {
      activeExisting.batch_id = batchId;
      activeExisting.updated_at = new Date().toISOString();
      return { success: true, enrollment: activeExisting };
    }

    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("enrollments")
        .update({
          batch_id: batchId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", activeExisting.id)
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      await logAuditEvent(
        actorProfileId || null,
        "STUDENT_ASSIGNED_BATCH",
        "ENROLLMENT",
        activeExisting.id,
        { studentId, courseId, batchId }
      );

      return { success: true, enrollment: data as Enrollment };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Database error";
      return { success: false, error: msg };
    }
  }

  // 4. Create new enrollment
  const newEnrollment: Enrollment = {
    id: `e-${Date.now()}`,
    student_id: studentId,
    course_id: courseId,
    batch_id: batchId || null,
    status: "active",
    admission_source: admissionSource || "direct_admission",
    payment_status: paymentStatus || "verified",
    starts_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured()) {
    IN_MEMORY_ENROLLMENTS.unshift(newEnrollment);
    return { success: true, enrollment: newEnrollment };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .insert({
        student_id: studentId,
        course_id: courseId,
        batch_id: batchId || null,
        status: "active",
        admission_source: admissionSource || "direct_admission",
        payment_status: paymentStatus || "verified",
        starts_at: new Date().toISOString(),
        created_by_profile_id: actorProfileId || null,
      })
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId || null,
      "STUDENT_ENROLLED_BATCH",
      "ENROLLMENT",
      data.id,
      { studentId, courseId, batchId: batchId || "awaiting_assignment" }
    );

    return { success: true, enrollment: data as Enrollment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export interface TransferStudentBatchParams {
  enrollmentId: string;
  destinationBatchId: string;
  reason: string;
  actorProfileId: string;
}

export async function transferStudentBatch(
  params: TransferStudentBatchParams
): Promise<{ success: boolean; enrollment?: Enrollment; error?: string }> {
  const { enrollmentId, destinationBatchId, reason, actorProfileId } = params;

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: "A valid transfer reason is required for audit logs." };
  }

  // 1. Resolve enrollment
  const enrollments = await getEnrollments();
  const current = enrollments.find((e) => e.id === enrollmentId);
  if (!current) {
    return { success: false, error: "Enrollment record not found." };
  }

  if (current.batch_id === destinationBatchId) {
    return { success: false, error: "Student is already in the destination batch." };
  }

  // 2. Validate destination batch
  const destBatch = await getBatchById(destinationBatchId);
  if (!destBatch) {
    return { success: false, error: "Destination batch not found." };
  }

  if (destBatch.course_id !== current.course_id) {
    return { success: false, error: "Destination batch belongs to a different course." };
  }

  if (destBatch.status === "cancelled" || destBatch.status === "completed") {
    return { success: false, error: `Cannot transfer student to a ${destBatch.status} batch.` };
  }

  // Check capacity
  const destEnrollments = await getEnrollments({ batchId: destinationBatchId, status: "active" });
  if (destEnrollments.length >= destBatch.capacity) {
    return {
      success: false,
      error: `Destination batch ${destBatch.name} is at maximum capacity (${destBatch.capacity}).`,
    };
  }

  const previousBatchId = current.batch_id;

  if (!isSupabaseConfigured()) {
    current.previous_batch_id = previousBatchId;
    current.batch_id = destinationBatchId;
    current.transfer_reason = reason;
    current.updated_at = new Date().toISOString();
    return { success: true, enrollment: current };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("enrollments")
      .update({
        previous_batch_id: previousBatchId,
        batch_id: destinationBatchId,
        transfer_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId,
      "BATCH_TRANSFER",
      "ENROLLMENT",
      enrollmentId,
      {
        student_id: current.student_id,
        previous_batch_id: previousBatchId,
        destination_batch_id: destinationBatchId,
        reason,
      }
    );

    return { success: true, enrollment: data as Enrollment };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}

export async function updateEnrollmentStatus(
  enrollmentId: string,
  newStatus: EnrollmentStatus,
  actorProfileId?: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured()) {
    const item = IN_MEMORY_ENROLLMENTS.find((e) => e.id === enrollmentId);
    if (!item) return { success: false, error: "Enrollment not found" };
    item.status = newStatus;
    item.updated_at = new Date().toISOString();
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("enrollments")
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", enrollmentId);

    if (error) return { success: false, error: error.message };

    await logAuditEvent(
      actorProfileId || null,
      "ENROLLMENT_STATUS_UPDATED",
      "ENROLLMENT",
      enrollmentId,
      { newStatus }
    );

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Database error";
    return { success: false, error: msg };
  }
}
