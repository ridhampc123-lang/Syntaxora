import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { StudentApplication, ApplicationStatus } from "@/types";
import { StudentApplicationInput } from "@/lib/validation/application";

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

// In-memory store for development/unit test resilience
export const IN_MEMORY_APPLICATIONS: StudentApplication[] = [
  {
    id: "app-1000000-0000-0000-0000-000000000001",
    application_reference: "APP-8F39A1C2",
    full_name: "Maya Patel",
    email: "maya.patel@example.com",
    phone: "+1 (555) 345-6789",
    date_of_birth: "2011-06-15",
    age: 15,
    course_id: "c1000000-0000-0000-0000-000000000001",
    course_title: "Applied AI for Teens: Computer Vision & Robotics",
    education_level: "High School / Secondary (Ages 15–18)",
    guardian_name: "Dev Patel",
    guardian_email: "dev.patel@example.com",
    guardian_phone: "+1 (555) 345-6780",
    statement_of_interest: "I built a Python maze solver and want to learn real computer vision models.",
    status: "pending",
    admin_notes: null,
    decision_reason: null,
    reviewed_by_profile_id: null,
    reviewed_at: null,
    provisioned_student_id: null,
    provisioned_at: null,
    created_at: "2026-10-20T10:00:00Z",
    updated_at: "2026-10-20T10:00:00Z",
  },
  {
    id: "app-1000000-0000-0000-0000-000000000002",
    application_reference: "APP-4D21E9B7",
    full_name: "Ethan Wright",
    email: "ethan.wright@example.com",
    phone: "+1 (555) 456-7890",
    date_of_birth: "2005-09-20",
    age: 21,
    course_id: "c1000000-0000-0000-0000-000000000002",
    course_title: "Applied Deep Learning & PyTorch for College Engineers",
    education_level: "Undergraduate / University Student",
    guardian_name: null,
    guardian_email: null,
    guardian_phone: null,
    statement_of_interest: "Computer science sophomore preparing for an undergraduate AI research assistantship.",
    status: "under_review",
    admin_notes: "Strong math background; awaiting transcript review.",
    decision_reason: null,
    reviewed_by_profile_id: "u3000000-0000-0000-0000-000000000001",
    reviewed_at: "2026-10-21T14:30:00Z",
    provisioned_student_id: null,
    provisioned_at: null,
    created_at: "2026-10-19T09:15:00Z",
    updated_at: "2026-10-21T14:30:00Z",
  },
];

// In-memory rate limiting map: email -> last submission timestamp
const SUBMISSION_TIMESTAMPS: Map<string, number> = new Map();

/**
 * Generates an 8-character non-sequential alphanumeric application reference code.
 */
export function generateApplicationReference(): string {
  const bytes = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `APP-${bytes}`;
}

/**
 * Submits a new admission application with normalization and rate protection.
 */
export async function submitStudentApplication(
  data: StudentApplicationInput,
  courseTitle?: string,
  ipAddress?: string
): Promise<{ success: boolean; reference?: string; applicationId?: string; message: string; duplicate?: boolean }> {
  const normalizedEmail = data.email.trim().toLowerCase();

  // Spam rate limiting: 1 submission per email per 60 seconds
  const now = Date.now();
  const lastSubmission = SUBMISSION_TIMESTAMPS.get(normalizedEmail);
  if (lastSubmission && now - lastSubmission < 60_000) {
    return {
      success: false,
      message: "Please wait at least one minute before submitting another application.",
    };
  }

  // Calculate age if date of birth provided
  let age: number | undefined;
  if (data.dateOfBirth) {
    const dob = new Date(data.dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs);
    age = Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  const appReference = generateApplicationReference();
  const timestamp = new Date().toISOString();

  if (!isSupabaseConfigured()) {
    // Check for exact pending duplicate in test/memory store
    const existing = IN_MEMORY_APPLICATIONS.find(
      (a) => a.email === normalizedEmail && a.status === "pending"
    );
    if (existing) {
      return {
        success: true,
        reference: existing.application_reference,
        applicationId: existing.id,
        message: "An application with this email is already under review.",
        duplicate: true,
      };
    }

    const newApp: StudentApplication = {
      id: crypto.randomUUID(),
      application_reference: appReference,
      full_name: data.fullName.trim(),
      email: normalizedEmail,
      phone: data.phone?.trim() || null,
      date_of_birth: data.dateOfBirth?.trim() || null,
      age: age || null,
      course_id: data.courseId?.trim() || null,
      course_title: courseTitle || null,
      education_level: data.educationLevel.trim(),
      guardian_name: data.guardianName?.trim() || null,
      guardian_email: data.guardianEmail?.trim().toLowerCase() || null,
      guardian_phone: data.guardianPhone?.trim() || null,
      statement_of_interest: data.statementOfInterest?.trim() || null,
      status: "pending",
      admin_notes: null,
      decision_reason: null,
      reviewed_by_profile_id: null,
      reviewed_at: null,
      provisioned_student_id: null,
      provisioned_at: null,
      created_at: timestamp,
      updated_at: timestamp,
    };

    IN_MEMORY_APPLICATIONS.unshift(newApp);
    SUBMISSION_TIMESTAMPS.set(normalizedEmail, now);

    return {
      success: true,
      reference: appReference,
      applicationId: newApp.id,
      message: "Your application has been received and logged for admissions review.",
    };
  }

  try {
    const supabase = await createClient();

    // Check for existing pending application to prevent accidental duplicate submission
    const { data: existingApp } = await supabase
      .from("student_applications")
      .select("id, application_reference, status")
      .eq("email", normalizedEmail)
      .in("status", ["pending", "under_review"])
      .maybeSingle();

    if (existingApp) {
      return {
        success: true,
        reference: existingApp.application_reference,
        applicationId: existingApp.id,
        message: "An active application with this email address is already under review.",
        duplicate: true,
      };
    }

    const { data: inserted, error } = await supabase
      .from("student_applications")
      .insert({
        application_reference: appReference,
        full_name: data.fullName.trim(),
        email: normalizedEmail,
        phone: data.phone?.trim() || null,
        date_of_birth: data.dateOfBirth?.trim() || null,
        age: age || null,
        course_id: data.courseId?.trim() || null,
        course_title: courseTitle || null,
        education_level: data.educationLevel.trim(),
        guardian_name: data.guardianName?.trim() || null,
        guardian_email: data.guardianEmail?.trim().toLowerCase() || null,
        guardian_phone: data.guardianPhone?.trim() || null,
        statement_of_interest: data.statementOfInterest?.trim() || null,
        status: "pending",
        ip_address: ipAddress || null,
      })
      .select("id, application_reference")
      .single();

    if (error || !inserted) {
      console.error("[Application Submission DB Error]", error);
      return {
        success: false,
        message: "Failed to record your application. Please check the details and try again.",
      };
    }

    SUBMISSION_TIMESTAMPS.set(normalizedEmail, now);

    return {
      success: true,
      reference: inserted.application_reference,
      applicationId: inserted.id,
      message: "Your application has been received and logged for admissions review.",
    };
  } catch (err) {
    console.error("[Application Service Exception]", err);
    return {
      success: false,
      message: "An unexpected error occurred while processing your application. Please try again.",
    };
  }
}

/**
 * Retrieves an application by primary key ID.
 */
export async function getApplicationById(id: string): Promise<StudentApplication | null> {
  if (!isSupabaseConfigured()) {
    return IN_MEMORY_APPLICATIONS.find((a) => a.id === id) || null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student_applications")
      .select("*, course:courses (*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as StudentApplication;
  } catch {
    return null;
  }
}

/**
 * Retrieves an application by public reference code.
 */
export async function getApplicationByReference(reference: string): Promise<StudentApplication | null> {
  if (!isSupabaseConfigured()) {
    return (
      IN_MEMORY_APPLICATIONS.find(
        (a) => a.application_reference.toUpperCase() === reference.trim().toUpperCase()
      ) || null
    );
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("student_applications")
      .select("*, course:courses (*)")
      .eq("application_reference", reference.trim().toUpperCase())
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as StudentApplication;
  } catch {
    return null;
  }
}

export interface ListApplicationsOptions {
  status?: ApplicationStatus | "all";
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Lists applications with status filtering, search, and pagination.
 */
export async function listApplications(
  options: ListApplicationsOptions = {}
): Promise<{ applications: StudentApplication[]; totalCount: number }> {
  const { status = "all", search = "", limit = 50, offset = 0 } = options;

  if (!isSupabaseConfigured()) {
    let filtered = [...IN_MEMORY_APPLICATIONS];

    if (status !== "all") {
      filtered = filtered.filter((a) => a.status === status);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.full_name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.application_reference.toLowerCase().includes(q)
      );
    }

    const totalCount = filtered.length;
    const paginated = filtered.slice(offset, offset + limit);
    return { applications: paginated, totalCount };
  }

  try {
    const supabase = await createClient();
    let query = supabase
      .from("student_applications")
      .select("*, course:courses (*)", { count: "exact" })
      .order("created_at", { ascending: false });

    if (status !== "all") {
      query = query.eq("status", status);
    }

    if (search.trim()) {
      const q = search.trim();
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,application_reference.ilike.%${q}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error || !data) {
      return { applications: [], totalCount: 0 };
    }

    return {
      applications: data as unknown as StudentApplication[],
      totalCount: count || 0,
    };
  } catch {
    return { applications: [], totalCount: 0 };
  }
}

/**
 * Updates application status, decision reason, and admin notes with audit trail.
 */
export async function updateApplicationReview(
  applicationId: string,
  reviewerProfileId: string,
  newStatus: ApplicationStatus,
  decisionReason?: string,
  adminNotes?: string
): Promise<{ success: boolean; message: string }> {
  const now = new Date().toISOString();

  // If approving the application, execute full student account provisioning workflow
  if (newStatus === "approved") {
    const { provisionStudentFromApplication } = await import("./provisioningService");
    const provResult = await provisionStudentFromApplication(
      applicationId,
      reviewerProfileId,
      decisionReason
    );
    if (!provResult.success) {
      return {
        success: false,
        message: `Approval halted: ${provResult.message}`,
      };
    }

    let warningMsg = "";
    if (!provResult.emailStatus.sent) {
      warningMsg = ` (Email Notice: ${provResult.emailStatus.message})`;
    }

    return {
      success: true,
      message: `${provResult.message}${warningMsg}`,
    };
  }

  if (!isSupabaseConfigured()) {
    const app = IN_MEMORY_APPLICATIONS.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: "Application not found." };
    }

    app.status = newStatus;
    app.reviewed_by_profile_id = reviewerProfileId;
    app.reviewed_at = now;
    if (decisionReason !== undefined) app.decision_reason = decisionReason;
    if (adminNotes !== undefined) app.admin_notes = adminNotes;
    app.updated_at = now;

    return { success: true, message: `Application updated to ${newStatus}.` };
  }

  try {
    const supabase = await createClient();
    const updatePayload: Record<string, unknown> = {
      status: newStatus,
      reviewed_by_profile_id: reviewerProfileId,
      reviewed_at: now,
      updated_at: now,
    };

    if (decisionReason !== undefined) updatePayload.decision_reason = decisionReason;
    if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;

    const { error } = await supabase
      .from("student_applications")
      .update(updatePayload)
      .eq("id", applicationId);

    if (error) {
      return { success: false, message: error.message };
    }

    // Record administrative audit log
    await supabase.from("audit_logs").insert({
      actor_profile_id: reviewerProfileId,
      action: "application_reviewed",
      entity_type: "student_applications",
      entity_id: applicationId,
      details: {
        new_status: newStatus,
        decision_reason: decisionReason,
      },
    });

    return { success: true, message: `Application status updated to ${newStatus}.` };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to update application";
    return { success: false, message: msg };
  }
}

export interface DuplicateDetectionResult {
  hasDuplicates: boolean;
  matchingApplications: {
    id: string;
    application_reference: string;
    full_name: string;
    email: string;
    status: ApplicationStatus;
    created_at: string;
  }[];
  matchingStudents: {
    id: string;
    student_code: string;
    full_name: string;
    email: string;
    status: string;
  }[];
}

/**
 * Flags potential duplicate applications or existing student matches without automatically merging.
 */
export async function detectApplicationDuplicates(
  app: StudentApplication
): Promise<DuplicateDetectionResult> {
  const normEmail = app.email.trim().toLowerCase();
  const normName = app.full_name.trim().toLowerCase();

  if (!isSupabaseConfigured()) {
    const matchingApps = IN_MEMORY_APPLICATIONS.filter(
      (a) =>
        a.id !== app.id &&
        (a.email.toLowerCase() === normEmail ||
          a.full_name.toLowerCase() === normName ||
          (app.phone && a.phone && a.phone === app.phone))
    ).map((a) => ({
      id: a.id,
      application_reference: a.application_reference,
      full_name: a.full_name,
      email: a.email,
      status: a.status,
      created_at: a.created_at,
    }));

    return {
      hasDuplicates: matchingApps.length > 0,
      matchingApplications: matchingApps,
      matchingStudents: [],
    };
  }

  try {
    const supabase = await createClient();

    // 1. Search for matching applications by email or name
    const { data: apps } = await supabase
      .from("student_applications")
      .select("id, application_reference, full_name, email, status, created_at")
      .neq("id", app.id)
      .or(`email.eq.${normEmail},full_name.ilike.%${normName}%`);

    // 2. Search for existing canonical students
    const { data: students } = await supabase
      .from("students")
      .select("id, student_code, status, profile:profiles (full_name, email)")
      .limit(10);

    const matchingStudents: { id: string; student_code: string; full_name: string; email: string; status: string }[] = [];
    if (students) {
      for (const item of students as unknown as Array<{ id: string; student_code: string; status: string; profile?: unknown }>) {
        const prof = (Array.isArray(item.profile) ? item.profile[0] : item.profile) as { full_name?: string; email?: string } | undefined;
        const profEmail = prof?.email?.toLowerCase();
        const profName = prof?.full_name?.toLowerCase();
        if (profEmail === normEmail || (profName && profName === normName)) {
          matchingStudents.push({
            id: item.id,
            student_code: item.student_code,
            full_name: prof?.full_name || "Unknown",
            email: prof?.email || "",
            status: item.status,
          });
        }
      }
    }

    const matchingApps = (apps as DuplicateDetectionResult["matchingApplications"]) || [];
    const hasDuplicates = matchingApps.length > 0 || matchingStudents.length > 0;

    return {
      hasDuplicates,
      matchingApplications: matchingApps,
      matchingStudents,
    };
  } catch {
    return {
      hasDuplicates: false,
      matchingApplications: [],
      matchingStudents: [],
    };
  }
}

