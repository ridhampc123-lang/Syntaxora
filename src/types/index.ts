export type UserRole = "admin" | "instructor" | "student" | "parent";

export type StudentStatus = "pending" | "active" | "paused" | "archived";

export type GuardianRelationshipType = "parent" | "legal_guardian" | "other_authorized_guardian";

export type RelationshipStatus = "pending" | "active" | "rejected" | "revoked" | "expired";

export type CourseLevel = "beginner" | "intermediate" | "advanced" | "all_levels";

export type AudienceGroup = "young_learners" | "teens" | "college_students" | "adults";

export type DeliveryMode = "live_online" | "self_paced" | "hybrid";

export type CourseStatus = "draft" | "published" | "archived";

export type EnrollmentStatus = "pending" | "active" | "completed" | "cancelled" | "expired";

export type SessionStatus = "scheduled" | "in_progress" | "completed" | "cancelled";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type SubmissionStatus = "pending" | "submitted" | "graded" | "returned";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  profile_id?: string | null;
  student_code: string;
  date_of_birth?: string | null;
  emergency_contact_phone?: string | null;
  status: StudentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile | null;
}

export interface GuardianStudentRelationship {
  id: string;
  guardian_profile_id: string;
  student_id: string;
  relationship_type: GuardianRelationshipType;
  status: RelationshipStatus;
  can_view_attendance: boolean;
  can_view_progress: boolean;
  can_view_schedule: boolean;
  can_view_fees: boolean;
  can_receive_notifications: boolean;
  verification_method?: string | null;
  verified_at?: string | null;
  verified_by_profile_id?: string | null;
  revocation_reason?: string | null;
  revoked_at?: string | null;
  created_at: string;
  updated_at: string;
  student?: Student;
  guardian?: Profile;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  level: CourseLevel;
  audience_group: AudienceGroup;
  delivery_mode: DeliveryMode;
  duration_weeks: number;
  price_in_cents: number;
  currency: string;
  status: CourseStatus;
  thumbnail_url?: string | null;
  published_at?: string | null;
  created_at: string;
  updated_at: string;
  modules?: CourseModule[];
  instructors?: Profile[];
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string | null;
  sort_order: number;
  lessons?: Lesson[];
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string | null;
  lesson_type: "lecture" | "lab" | "project" | "quiz";
  content?: string | null;
  video_url?: string | null;
  is_preview: boolean;
  sort_order: number;
}

export interface ContactEnquiry {
  id?: string;
  full_name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  status?: string;
  created_at?: string;
}

export type InvitationStatus = "pending" | "consumed" | "revoked" | "expired";

export interface GuardianInvitation {
  id: string;
  student_id: string;
  intended_guardian_email: string;
  relationship_type: GuardianRelationshipType;
  token_hash: string;
  expires_at: string;
  status: InvitationStatus;
  created_by_profile_id: string;
  consumed_at?: string | null;
  consumed_by_profile_id?: string | null;
  created_at: string;
  student?: Student;
}
export type BatchStatus = "draft" | "upcoming" | "active" | "paused" | "completed" | "cancelled";

export interface Batch {
  id: string;
  course_id: string;
  name: string;
  batch_code: string;
  primary_instructor_profile_id: string;
  capacity: number;
  start_at: string;
  end_at: string;
  timezone: string;
  status: BatchStatus;
  waitlist_enabled?: boolean;
  waitlist_capacity?: number;
  created_at: string;
  updated_at: string;
  course?: Course;
  primary_instructor?: Profile;
  enrolled_count?: number;
}

export interface BatchScheduleTemplate {
  id: string;
  batch_id: string;
  weekday: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time_local: string; // HH:MM:SS
  end_time_local: string; // HH:MM:SS
  timezone: string;
  effective_start_date: string;
  effective_end_date: string;
  instructor_profile_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  batch_id?: string | null;
  status: EnrollmentStatus;
  admission_source?: string;
  payment_status?: string;
  starts_at?: string;
  ends_at?: string | null;
  created_at: string;
  updated_at?: string;
  previous_batch_id?: string | null;
  transfer_reason?: string | null;
  student?: Student;
  course?: Course;
  batch?: Batch;
}

export interface ClassSession {
  id: string;
  course_id: string;
  batch_id?: string | null;
  instructor_profile_id: string;
  title: string;
  description?: string | null;
  starts_at: string;
  ends_at: string;
  timezone?: string;
  meeting_provider: string;
  meeting_url?: string | null;
  provider_meeting_id?: string | null;
  status: SessionStatus;
  started_at?: string | null;
  ended_at?: string | null;
  created_at: string;
  updated_at: string;
  course?: Course;
  batch?: Batch;
  instructor?: Profile;
}

export interface AttendanceRecord {
  id: string;
  class_session_id: string;
  student_id: string;
  status: AttendanceStatus;
  recorded_by: string;
  recorded_at: string;
  correction_reason?: string | null;
  student?: Student;
  session?: ClassSession;
}

export interface Assignment {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_at: string;
  max_score: number;
  created_by_profile_id: string;
  created_at: string;
  updated_at: string;
  course?: Course;
}

export interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string;
  attachment_url?: string | null;
  status: SubmissionStatus;
  score?: number | null;
  feedback?: string | null;
  is_grade_published: boolean;
  graded_by_profile_id?: string | null;
  graded_at?: string | null;
  submitted_at: string;
  student?: Student;
  assignment?: Assignment;
}

export interface LearningProgress {
  id: string;
  student_id: string;
  lesson_id: string;
  completed_at: string;
}

export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "needs_information";

export interface StudentApplication {
  id: string;
  application_reference: string;
  full_name: string;
  email: string;
  phone?: string | null;
  date_of_birth?: string | null;
  age?: number | null;
  course_id?: string | null;
  course_title?: string | null;
  education_level?: string | null;
  guardian_name?: string | null;
  guardian_email?: string | null;
  guardian_phone?: string | null;
  statement_of_interest?: string | null;
  status: ApplicationStatus;
  admin_notes?: string | null;
  decision_reason?: string | null;
  reviewed_by_profile_id?: string | null;
  reviewed_at?: string | null;
  provisioned_student_id?: string | null;
  provisioned_at?: string | null;
  created_at: string;
  updated_at: string;
  course?: Course | null;
}

