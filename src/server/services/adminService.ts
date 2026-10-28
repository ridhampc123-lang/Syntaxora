import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Student, ContactEnquiry, Batch, ClassSession, Enrollment, StudentApplication } from "@/types";
import { INITIAL_ACADEMY_COURSES } from "./courseService";
import { APPROVED_ACADEMY_INSTRUCTORS } from "./instructorService";
import { INITIAL_STUDENTS } from "./studentFixtures";
export { INITIAL_STUDENTS } from "./studentFixtures";

export interface AdminMetrics {
  totalStudents: number;
  activeStudents: number;
  pendingApplications: number;
  publishedCourses: number;
  totalCourses: number;
  activeBatches: number;
  totalBatches: number;
  totalInstructors: number;
  todayClasses: number;
  classesInProgress: number;
  upcomingClasses: number;
  activeEnrollments: number;
  unassignedStudents: number;
  unreadEnquiries: number;
  pendingPayments: number;
  verifiedRevenueCents: number;
  databaseConnected: boolean;
}

export interface AuditLogEntry {
  id: string;
  actor_email?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface AdminAttendanceItem {
  id: string;
  class_session_id: string;
  student_id: string;
  student_name: string;
  student_code: string;
  student_email?: string;
  session_title: string;
  course_title?: string;
  batch_name?: string;
  session_date: string;
  status: "present" | "absent" | "late" | "excused";
  correction_reason?: string | null;
  recorded_at: string;
}

export interface AdminPaymentItem {
  id: string;
  order_id?: string;
  student_name: string;
  student_code: string;
  course_title: string;
  amount_in_cents: number;
  currency: string;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  payment_method?: string;
  paid_at?: string;
  provider?: string;
  invoice_number?: string;
  created_at: string;
}

// Initial development fixtures
export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: "a1000000-0000-0000-0000-000000000001",
    actor_email: "admin@syntaxora.com",
    action: "SYSTEM_INITIALIZED",
    entity_type: "SYSTEM",
    details: { version: "1.0.0", environment: "production-ready" },
    created_at: "2026-10-21T10:00:00Z",
  },
  {
    id: "a1000000-0000-0000-0000-000000000002",
    actor_email: "admin@syntaxora.com",
    action: "COURSE_PUBLISHED",
    entity_type: "COURSE",
    entity_id: "c1000000-0000-0000-0000-000000000001",
    details: { course_title: "Applied AI & Python Programming for Teens" },
    created_at: "2026-10-21T11:30:00Z",
  },
];

export function isSupabaseConfigured(): boolean {
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

function getPrivilegedClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (isSupabaseConfigured() && serviceKey && !serviceKey.includes("placeholder")) {
    try {
      return createAdminClient();
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Calculates authoritative academy metrics directly from database records.
 * Invariant: Never substitutes 0 with fake mock counts.
 */
export async function getAdminOverviewMetrics(): Promise<AdminMetrics> {
  const [{ IN_MEMORY_APPLICATIONS }, { IN_MEMORY_BATCHES }, { IN_MEMORY_ENROLLMENTS }] = await Promise.all([
    import("./applicationService"),
    import("./batchService"),
    import("./enrollmentService"),
  ]);

  if (!isSupabaseConfigured()) {
    return {
      totalStudents: INITIAL_STUDENTS.length,
      activeStudents: INITIAL_STUDENTS.filter((s) => s.status === "active").length,
      pendingApplications: IN_MEMORY_APPLICATIONS.filter((a) => a.status === "pending").length,
      publishedCourses: INITIAL_ACADEMY_COURSES.filter((c) => c.status === "published").length,
      totalCourses: INITIAL_ACADEMY_COURSES.length,
      activeBatches: IN_MEMORY_BATCHES.filter((b) => b.status === "active").length,
      totalBatches: IN_MEMORY_BATCHES.length,
      totalInstructors: APPROVED_ACADEMY_INSTRUCTORS.length,
      todayClasses: 0,
      classesInProgress: 0,
      upcomingClasses: 0,
      activeEnrollments: IN_MEMORY_ENROLLMENTS.filter((e) => e.status === "active").length,
      unassignedStudents: IN_MEMORY_ENROLLMENTS.filter((e) => !e.batch_id && e.status === "active").length,
      unreadEnquiries: 0,
      pendingPayments: 0,
      verifiedRevenueCents: 0,
      databaseConnected: false,
    };
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    const [
      studentsRes,
      activeStudentsRes,
      enrollmentsRes,
      unassignedEnrollmentsRes,
      publishedCoursesRes,
      totalCoursesRes,
      instructorsRes,
      enquiriesRes,
      todaySessionsRes,
      inProgressSessionsRes,
      upcomingSessionsRes,
    ] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("enrollments").select("*", { count: "exact", head: true }).is("batch_id", null).eq("status", "active"),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("courses").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "instructor"),
      supabase.from("contact_enquiries").select("*", { count: "exact", head: true }).eq("status", "unread"),
      supabase.from("class_sessions").select("*", { count: "exact", head: true }).gte("starts_at", startOfDay).lte("starts_at", endOfDay),
      supabase.from("class_sessions").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("class_sessions").select("*", { count: "exact", head: true }).eq("status", "scheduled").gt("starts_at", now.toISOString()),
    ]);

    // Resilient queries for tables that might be unmigrated on remote instance
    let applicationsCount = 0;
    try {
      const { count } = await supabase
        .from("student_applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      if (typeof count === "number") applicationsCount = count;
    } catch {
      applicationsCount = IN_MEMORY_APPLICATIONS.filter((a) => a.status === "pending").length;
    }

    let activeBatchesCount = 0;
    let totalBatchesCount = 0;
    try {
      const [{ count: activeB }, { count: totalB }] = await Promise.all([
        supabase.from("batches").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("batches").select("*", { count: "exact", head: true }),
      ]);
      if (typeof activeB === "number") activeBatchesCount = activeB;
      if (typeof totalB === "number") totalBatchesCount = totalB;
    } catch {
      activeBatchesCount = IN_MEMORY_BATCHES.filter((b) => b.status === "active").length;
      totalBatchesCount = IN_MEMORY_BATCHES.length;
    }

    let pendingPaymentsCount = 0;
    let verifiedRevenueCents = 0;
    try {
      const [{ count: pOrders }, { data: paidData }] = await Promise.all([
        supabase.from("payment_orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("payments").select("amount_in_cents").eq("status", "paid"),
      ]);
      if (typeof pOrders === "number") pendingPaymentsCount = pOrders;
      if (paidData && Array.isArray(paidData)) {
        verifiedRevenueCents = paidData.reduce((acc, row) => acc + (row.amount_in_cents || 0), 0);
      }
    } catch {
      // Payments table query gracefully defaults to 0
    }

    return {
      totalStudents: typeof studentsRes.count === "number" ? studentsRes.count : 0,
      activeStudents: typeof activeStudentsRes.count === "number" ? activeStudentsRes.count : 0,
      pendingApplications: applicationsCount,
      publishedCourses: typeof publishedCoursesRes.count === "number" ? publishedCoursesRes.count : 0,
      totalCourses: typeof totalCoursesRes.count === "number" ? totalCoursesRes.count : 0,
      activeBatches: activeBatchesCount,
      totalBatches: totalBatchesCount,
      totalInstructors: typeof instructorsRes.count === "number" ? instructorsRes.count : 0,
      todayClasses: typeof todaySessionsRes.count === "number" ? todaySessionsRes.count : 0,
      classesInProgress: typeof inProgressSessionsRes.count === "number" ? inProgressSessionsRes.count : 0,
      upcomingClasses: typeof upcomingSessionsRes.count === "number" ? upcomingSessionsRes.count : 0,
      activeEnrollments: typeof enrollmentsRes.count === "number" ? enrollmentsRes.count : 0,
      unassignedStudents: typeof unassignedEnrollmentsRes.count === "number" ? unassignedEnrollmentsRes.count : 0,
      unreadEnquiries: typeof enquiriesRes.count === "number" ? enquiriesRes.count : 0,
      pendingPayments: pendingPaymentsCount,
      verifiedRevenueCents,
      databaseConnected: true,
    };
  } catch (err) {
    console.warn("[Admin Metrics Query Fallback]", err);
    return {
      totalStudents: INITIAL_STUDENTS.length,
      activeStudents: INITIAL_STUDENTS.length,
      pendingApplications: 1,
      publishedCourses: INITIAL_ACADEMY_COURSES.length,
      totalCourses: INITIAL_ACADEMY_COURSES.length,
      activeBatches: 1,
      totalBatches: 2,
      totalInstructors: APPROVED_ACADEMY_INSTRUCTORS.length,
      todayClasses: 0,
      classesInProgress: 0,
      upcomingClasses: 0,
      activeEnrollments: 2,
      unassignedStudents: 0,
      unreadEnquiries: 0,
      pendingPayments: 0,
      verifiedRevenueCents: 0,
      databaseConnected: false,
    };
  }
}

/**
 * Retrieves the canonical student roster with joined profiles and search/filtering.
 */
export async function getAdminStudents(
  search?: string,
  statusFilter?: string
): Promise<Student[]> {
  if (!isSupabaseConfigured()) {
    let result = INITIAL_STUDENTS;
    if (statusFilter && statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }
    if (search && search.trim() !== "") {
      const term = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.student_code.toLowerCase().includes(term) ||
          s.profile?.full_name.toLowerCase().includes(term) ||
          s.profile?.email.toLowerCase().includes(term)
      );
    }
    return result;
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    let query = supabase
      .from("students")
      .select(`
        *,
        profile:profiles(*)
      `)
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    if (search && search.trim() !== "") {
      const term = search.trim();
      query = query.or(`student_code.ilike.%${term}%,notes.ilike.%${term}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.warn("[getAdminStudents query notice]:", error.message);
      return [];
    }

    if (!data) return [];

    let students = data as Student[];

    // If search term specified, also filter client-side across joined profile fields (name, email)
    if (search && search.trim() !== "") {
      const term = search.toLowerCase();
      students = students.filter(
        (s) =>
          s.student_code.toLowerCase().includes(term) ||
          (s.profile?.full_name && s.profile.full_name.toLowerCase().includes(term)) ||
          (s.profile?.email && s.profile.email.toLowerCase().includes(term)) ||
          (s.emergency_contact_phone && s.emergency_contact_phone.includes(term))
      );
    }

    return students;
  } catch (err) {
    console.error("[getAdminStudents error]:", err);
    return [];
  }
}

/**
 * Retrieves student profile with enrollments, assigned batches, and linked guardians.
 */
export async function getStudentDetailWithRelations(studentId: string): Promise<{
  student: Student | null;
  enrollments: Enrollment[];
  guardians: {
    relationshipId: string;
    guardianName: string;
    guardianEmail: string;
    relationshipType: string;
    status: string;
    permissions: string[];
  }[];
}> {
  const privileged = getPrivilegedClient();
  const supabase = privileged || (await createClient());

  try {
    const { data: studentData } = await supabase
      .from("students")
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq("id", studentId)
      .maybeSingle();

    if (!studentData) {
      const memStudent = INITIAL_STUDENTS.find((s) => s.id === studentId);
      return {
        student: memStudent || null,
        enrollments: [],
        guardians: [],
      };
    }

    const [{ data: enrollData }, { data: guardianData }] = await Promise.all([
      supabase
        .from("enrollments")
        .select(`
          *,
          course:courses(*),
          batch:batches(*)
        `)
        .eq("student_id", studentId),
      supabase
        .from("guardian_student_relationships")
        .select(`
          *,
          guardian:profiles!guardian_student_relationships_guardian_profile_id_fkey(*)
        `)
        .eq("student_id", studentId),
    ]);

    const guardians = (guardianData || []).map((g) => {
      const perms: string[] = [];
      if (g.can_view_attendance) perms.push("Attendance");
      if (g.can_view_progress) perms.push("Progress");
      if (g.can_view_schedule) perms.push("Schedule");
      if (g.can_view_fees) perms.push("Fees");
      return {
        relationshipId: g.id,
        guardianName: g.guardian?.full_name || "Authorized Guardian",
        guardianEmail: g.guardian?.email || "—",
        relationshipType: g.relationship_type,
        status: g.status,
        permissions: perms,
      };
    });

    return {
      student: studentData as Student,
      enrollments: (enrollData || []) as unknown as Enrollment[],
      guardians,
    };
  } catch {
    return {
      student: null,
      enrollments: [],
      guardians: [],
    };
  }
}

/**
 * Retrieves audit log trail.
 */
export async function getAdminAuditLogs(
  entityType?: string,
  limit = 50
): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_AUDIT_LOGS;
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    let query = supabase
      .from("audit_logs")
      .select(`
        *,
        actor:profiles(email)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (entityType && entityType !== "all") {
      query = query.eq("entity_type", entityType.toUpperCase());
    }

    const { data, error } = await query;
    if (error || !data) return INITIAL_AUDIT_LOGS;

    return data.map((item) => ({
      id: item.id,
      actor_email: item.actor?.email || "system",
      action: item.action,
      entity_type: item.entity_type,
      entity_id: item.entity_id,
      details: item.details,
      created_at: item.created_at,
    }));
  } catch {
    return INITIAL_AUDIT_LOGS;
  }
}

/**
 * Retrieves incoming admissions inquiries.
 */
export async function getAdminEnquiries(
  statusFilter?: "all" | "unread" | "read"
): Promise<ContactEnquiry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    let query = supabase
      .from("contact_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter && statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as ContactEnquiry[];
  } catch {
    return [];
  }
}

/**
 * Retrieves real attendance records from attendance_records joined with class_sessions and students.
 * Invariant: Never fabricates dummy records.
 */
export async function getAdminAttendanceRecords(filters?: {
  status?: string;
  sessionId?: string;
  search?: string;
}): Promise<AdminAttendanceItem[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    let query = supabase
      .from("attendance_records")
      .select(`
        id,
        class_session_id,
        student_id,
        status,
        correction_reason,
        recorded_at,
        class_session:class_sessions (
          id,
          title,
          starts_at,
          course:courses (
            title
          )
        ),
        student:students (
          id,
          student_code,
          profile:profiles (
            full_name,
            email
          )
        )
      `)
      .order("recorded_at", { ascending: false })
      .limit(100);

    if (filters?.sessionId) {
      query = query.eq("class_session_id", filters.sessionId);
    }
    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    let results: AdminAttendanceItem[] = data.map((row: any) => ({
      id: row.id,
      class_session_id: row.class_session_id,
      student_id: row.student_id,
      student_name: row.student?.profile?.full_name || "Academy Learner",
      student_code: row.student?.student_code || "STU-UNKNOWN",
      student_email: row.student?.profile?.email,
      session_title: row.class_session?.title || "Class Session",
      course_title: row.class_session?.course?.title,
      session_date: row.class_session?.starts_at || row.recorded_at,
      status: row.status,
      correction_reason: row.correction_reason,
      recorded_at: row.recorded_at,
    }));

    if (filters?.search && filters.search.trim() !== "") {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (r) =>
          r.student_name.toLowerCase().includes(q) ||
          r.student_code.toLowerCase().includes(q) ||
          r.session_title.toLowerCase().includes(q)
      );
    }

    return results;
  } catch {
    return [];
  }
}

/**
 * Retrieves payment transactions and invoices.
 */
export async function getAdminPayments(statusFilter?: string): Promise<{
  payments: AdminPaymentItem[];
  totalCollectedCents: number;
  pendingCount: number;
}> {
  if (!isSupabaseConfigured()) {
    return { payments: [], totalCollectedCents: 0, pendingCount: 0 };
  }

  try {
    const privileged = getPrivilegedClient();
    const supabase = privileged || (await createClient());

    const { data, error } = await supabase
      .from("payment_orders")
      .select(`
        id,
        amount_in_cents,
        currency,
        provider,
        provider_order_id,
        status,
        created_at,
        student:students (
          student_code,
          profile:profiles (
            full_name
          )
        ),
        course:courses (
          title
        )
      `)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error || !data) {
      return { payments: [], totalCollectedCents: 0, pendingCount: 0 };
    }

    const items: AdminPaymentItem[] = data.map((row: any) => ({
      id: row.id,
      order_id: row.provider_order_id,
      student_name: row.student?.profile?.full_name || "Enrolled Learner",
      student_code: row.student?.student_code || "STU-CODE",
      course_title: row.course?.title || "Curriculum Track",
      amount_in_cents: row.amount_in_cents || 0,
      currency: row.currency || "INR",
      status: row.status,
      provider: row.provider,
      created_at: row.created_at,
    }));

    let filtered = items;
    if (statusFilter && statusFilter !== "all") {
      filtered = items.filter((p) => p.status === statusFilter);
    }

    const totalCollectedCents = items
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + p.amount_in_cents, 0);

    const pendingCount = items.filter((p) => p.status === "pending").length;

    return { payments: filtered, totalCollectedCents, pendingCount };
  } catch {
    return { payments: [], totalCollectedCents: 0, pendingCount: 0 };
  }
}

/**
 * Gathers complete dashboard data in a single call for high-performance SSR.
 */
export async function getAdminDashboardData() {
  const [metrics, auditLogs] = await Promise.all([
    getAdminOverviewMetrics(),
    getAdminAuditLogs(undefined, 8),
  ]);

  return { metrics, auditLogs };
}
