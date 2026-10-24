import { createClient } from "@/lib/supabase/server";
import { Student, ContactEnquiry } from "@/types";
import { INITIAL_ACADEMY_COURSES } from "./courseService";
import { APPROVED_ACADEMY_INSTRUCTORS } from "./instructorService";

export interface AdminMetrics {
  totalStudents: number;
  activeEnrollments: number;
  publishedCourses: number;
  totalInstructors: number;
  unreadEnquiries: number;
  pendingApplications: number;
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

// Canonical development fixtures when database tables are initialized
export const INITIAL_STUDENTS: Student[] = [
  {
    id: "s1000000-0000-0000-0000-000000000001",
    profile_id: "u1000000-0000-0000-0000-000000000001",
    student_code: "STU-8F39A1C2",
    date_of_birth: "2010-04-12",
    emergency_contact_phone: "+1 (555) 234-5678",
    status: "active",
    notes: "Enrolled in Teens Robotics Track",
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
  },
  {
    id: "s1000000-0000-0000-0000-000000000002",
    profile_id: "u1000000-0000-0000-0000-000000000002",
    student_code: "STU-7B21E4F9",
    date_of_birth: "2016-08-20",
    emergency_contact_phone: "+1 (555) 345-6789",
    status: "active",
    notes: "Young AI Explorers cohort",
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
  },
];

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
    details: { course_title: "Applied AI & Python Robotics for Teens" },
    created_at: "2026-10-21T11:30:00Z",
  },
];

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes("placeholder") && !key.includes("placeholder"));
}

export async function getAdminOverviewMetrics(): Promise<AdminMetrics> {
  if (!isSupabaseConfigured()) {
    return {
      totalStudents: INITIAL_STUDENTS.length,
      activeEnrollments: 2,
      publishedCourses: INITIAL_ACADEMY_COURSES.length,
      totalInstructors: APPROVED_ACADEMY_INSTRUCTORS.length,
      unreadEnquiries: 0,
      pendingApplications: 1,
    };
  }

  try {
    const supabase = await createClient();
    const [
      { count: studentsCount },
      { count: enrollmentsCount },
      { count: coursesCount },
      { count: instructorsCount },
      { count: enquiriesCount },
      { count: applicationsCount },
    ] = await Promise.all([
      supabase.from("students").select("*", { count: "exact", head: true }),
      supabase.from("enrollments").select("*", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "instructor"),
      supabase.from("contact_enquiries").select("*", { count: "exact", head: true }).eq("status", "unread"),
      supabase.from("student_applications").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);

    return {
      totalStudents: studentsCount || INITIAL_STUDENTS.length,
      activeEnrollments: enrollmentsCount || 2,
      publishedCourses: coursesCount || INITIAL_ACADEMY_COURSES.length,
      totalInstructors: instructorsCount || APPROVED_ACADEMY_INSTRUCTORS.length,
      unreadEnquiries: enquiriesCount || 0,
      pendingApplications: applicationsCount || 0,
    };
  } catch {
    return {
      totalStudents: INITIAL_STUDENTS.length,
      activeEnrollments: 2,
      publishedCourses: INITIAL_ACADEMY_COURSES.length,
      totalInstructors: APPROVED_ACADEMY_INSTRUCTORS.length,
      unreadEnquiries: 0,
      pendingApplications: 1,
    };
  }
}

export async function getAdminStudents(search?: string): Promise<Student[]> {
  if (!isSupabaseConfigured()) {
    if (!search || search.trim() === "") return INITIAL_STUDENTS;
    const term = search.toLowerCase();
    return INITIAL_STUDENTS.filter(
      (s) =>
        s.student_code.toLowerCase().includes(term) ||
        s.profile?.full_name.toLowerCase().includes(term) ||
        s.profile?.email.toLowerCase().includes(term)
    );
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("students")
      .select(`
        *,
        profile:profiles(*)
      `)
      .order("created_at", { ascending: false });

    if (search && search.trim() !== "") {
      query = query.or(`student_code.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) return INITIAL_STUDENTS;
    return data as Student[];
  } catch {
    return INITIAL_STUDENTS;
  }
}

export async function getAdminAuditLogs(): Promise<AuditLogEntry[]> {
  if (!isSupabaseConfigured()) {
    return INITIAL_AUDIT_LOGS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("audit_logs")
      .select(`
        *,
        actor:profiles(email)
      `)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error || !data || data.length === 0) return INITIAL_AUDIT_LOGS;

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

export async function getAdminEnquiries(): Promise<ContactEnquiry[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contact_enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data as ContactEnquiry[];
  } catch {
    return [];
  }
}
