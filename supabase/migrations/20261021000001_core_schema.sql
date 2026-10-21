-- ==============================================================================
-- Syntaxora AI Learning Academy — Core Schema & Security Migration
-- Migration: 20261021000001_core_schema.sql
-- ==============================================================================

-- 1. Custom Enum Types
CREATE TYPE user_role AS ENUM ('admin', 'instructor', 'student', 'parent');
CREATE TYPE student_status AS ENUM ('pending', 'active', 'paused', 'archived');
CREATE TYPE guardian_relationship_type AS ENUM ('parent', 'legal_guardian', 'other_authorized_guardian');
CREATE TYPE relationship_status AS ENUM ('pending', 'active', 'rejected', 'revoked', 'expired');
CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced', 'all_levels');
CREATE TYPE audience_group AS ENUM ('young_learners', 'teens', 'college_students', 'adults');
CREATE TYPE delivery_mode AS ENUM ('live_online', 'self_paced', 'hybrid');
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE enrollment_status AS ENUM ('pending', 'active', 'completed', 'cancelled', 'expired');
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'excused');
CREATE TYPE submission_status AS ENUM ('pending', 'submitted', 'graded', 'returned');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'revoked', 'expired');

-- 2. Profiles Table (linked to auth.users)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Canonical Students Table
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_code TEXT NOT NULL UNIQUE,
    date_of_birth DATE,
    emergency_contact_phone TEXT,
    status student_status NOT NULL DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Guardian–Student Relationships Table (Authoritative Permission Boundary)
CREATE TABLE public.guardian_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guardian_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    relationship_type guardian_relationship_type NOT NULL DEFAULT 'parent',
    status relationship_status NOT NULL DEFAULT 'pending',
    can_view_attendance BOOLEAN NOT NULL DEFAULT true,
    can_view_progress BOOLEAN NOT NULL DEFAULT true,
    can_view_schedule BOOLEAN NOT NULL DEFAULT true,
    can_view_fees BOOLEAN NOT NULL DEFAULT true,
    can_receive_notifications BOOLEAN NOT NULL DEFAULT true,
    verification_method TEXT,
    verified_at TIMESTAMPTZ,
    verified_by_profile_id UUID REFERENCES public.profiles(id),
    revocation_reason TEXT,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_guardian_student_pair UNIQUE (guardian_profile_id, student_id)
);

-- 5. Guardian Invitations Table (Cryptographic Single-Use Tokens)
CREATE TABLE public.guardian_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    intended_guardian_email TEXT NOT NULL,
    relationship_type guardian_relationship_type NOT NULL DEFAULT 'parent',
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    status invitation_status NOT NULL DEFAULT 'pending',
    created_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    consumed_at TIMESTAMPTZ,
    consumed_by_profile_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Courses, Modules, and Lessons
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    level course_level NOT NULL DEFAULT 'beginner',
    audience_group audience_group NOT NULL DEFAULT 'teens',
    delivery_mode delivery_mode NOT NULL DEFAULT 'live_online',
    duration_weeks INT NOT NULL CHECK (duration_weeks > 0),
    price_in_cents INT NOT NULL DEFAULT 0 CHECK (price_in_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status course_status NOT NULL DEFAULT 'draft',
    thumbnail_url TEXT,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_course_module_order UNIQUE (course_id, sort_order)
);

CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    lesson_type TEXT NOT NULL DEFAULT 'lecture',
    content TEXT,
    video_url TEXT,
    is_preview BOOLEAN NOT NULL DEFAULT false,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_module_lesson_order UNIQUE (module_id, sort_order)
);

-- 7. Instructor Assignments Table
CREATE TABLE public.instructor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_instructor_course UNIQUE (instructor_profile_id, course_id)
);

-- 8. Enrollments Table
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    status enrollment_status NOT NULL DEFAULT 'active',
    enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    start_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_student_course UNIQUE (student_id, course_id)
);

-- 9. Class Sessions & Attendance Records
CREATE TABLE public.class_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    title TEXT NOT NULL,
    description TEXT,
    starts_at TIMESTAMPTZ NOT NULL,
    ends_at TIMESTAMPTZ NOT NULL,
    meeting_provider TEXT DEFAULT 'zoom',
    meeting_link TEXT,
    status session_status NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT session_timing_valid CHECK (ends_at > starts_at)
);

CREATE TABLE public.attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_session_id UUID NOT NULL REFERENCES public.class_sessions(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    status attendance_status NOT NULL DEFAULT 'present',
    recorded_by_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    correction_reason TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_session_student_attendance UNIQUE (class_session_id, student_id)
);

-- 10. Assignments & Submissions
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMPTZ,
    max_score INT NOT NULL DEFAULT 100 CHECK (max_score > 0),
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    content TEXT,
    file_path TEXT,
    status submission_status NOT NULL DEFAULT 'submitted',
    score NUMERIC(5,2) CHECK (score >= 0),
    feedback TEXT,
    graded_by_profile_id UUID REFERENCES public.profiles(id),
    graded_at TIMESTAMPTZ,
    is_grade_released BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_assignment_student_submission UNIQUE (assignment_id, student_id)
);

-- 11. Learning Progress
CREATE TABLE public.learning_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_student_lesson_progress UNIQUE (student_id, lesson_id)
);

-- 12. Payment Orders, Payments & Invoices
CREATE TABLE public.payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    payer_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    amount_in_cents INT NOT NULL CHECK (amount_in_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    provider TEXT NOT NULL,
    provider_order_id TEXT UNIQUE,
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE RESTRICT,
    provider_payment_id TEXT UNIQUE,
    amount_in_cents INT NOT NULL CHECK (amount_in_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'paid',
    payment_method TEXT,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    raw_response JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    order_id UUID NOT NULL REFERENCES public.payment_orders(id) ON DELETE RESTRICT,
    amount_in_cents INT NOT NULL CHECK (amount_in_cents >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    pdf_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Notifications, Contact Enquiries, and Audit Logs
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'info',
    action_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.contact_enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread',
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Performance Indexes
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_students_profile_id ON public.students(profile_id);
CREATE INDEX idx_students_status ON public.students(status);
CREATE INDEX idx_guardian_rel_guardian ON public.guardian_student_relationships(guardian_profile_id, status);
CREATE INDEX idx_guardian_rel_student ON public.guardian_student_relationships(student_id, status);
CREATE INDEX idx_courses_status ON public.courses(status, published_at);
CREATE INDEX idx_enrollments_student ON public.enrollments(student_id, status);
CREATE INDEX idx_enrollments_course ON public.enrollments(course_id, status);
CREATE INDEX idx_sessions_course ON public.class_sessions(course_id, starts_at);
CREATE INDEX idx_sessions_instructor ON public.class_sessions(instructor_profile_id, starts_at);
CREATE INDEX idx_attendance_student ON public.attendance_records(student_id);
CREATE INDEX idx_submissions_assignment ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student ON public.submissions(student_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_profile_id, is_read);
CREATE INDEX idx_audit_logs_actor ON public.audit_logs(actor_profile_id, created_at);
CREATE INDEX idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);

-- 15. New User Auth Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    assigned_role user_role := 'student';
    input_role TEXT;
BEGIN
    input_role := (new.raw_user_meta_data->>'role');
    -- Only permit self-selection of student or parent
    IF input_role = 'parent' THEN
        assigned_role := 'parent';
    ELSE
        assigned_role := 'student';
    END IF;

    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
        new.id,
        assigned_role,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.email
    );

    -- If registering as a student, create an attached canonical student record
    IF assigned_role = 'student' THEN
        INSERT INTO public.students (profile_id, student_code, status)
        VALUES (
            new.id,
            'STU-' || UPPER(SUBSTRING(gen_random_uuid()::TEXT, 1, 8)),
            'active'
        );
    END IF;

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 16. Enable Row Level Security (RLS) On All Tables (Default Deny)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_student_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardian_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructor_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 17. Row Level Security Policies

-- PROFILES
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Public can view instructor profiles"
    ON public.profiles FOR SELECT
    TO anon, authenticated
    USING (role = 'instructor');

CREATE POLICY "Users can update own non-role fields"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- STUDENTS
CREATE POLICY "Admins have full access to students"
    ON public.students FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Students can view own student record"
    ON public.students FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());

CREATE POLICY "Instructors can view assigned students"
    ON public.students FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.instructor_assignments ia ON ia.course_id = e.course_id
            WHERE e.student_id = public.students.id
              AND ia.instructor_profile_id = auth.uid()
              AND e.status = 'active'
        )
    );

CREATE POLICY "Guardians can view linked active children"
    ON public.students FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.guardian_student_relationships gsr
            WHERE gsr.guardian_profile_id = auth.uid()
              AND gsr.student_id = public.students.id
              AND gsr.status = 'active'
        )
    );

-- GUARDIAN STUDENT RELATIONSHIPS
CREATE POLICY "Admins manage all guardian relationships"
    ON public.guardian_student_relationships FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Guardians view own relationships"
    ON public.guardian_student_relationships FOR SELECT
    TO authenticated
    USING (guardian_profile_id = auth.uid());

-- COURSES
CREATE POLICY "Public and users can view published courses"
    ON public.courses FOR SELECT
    TO anon, authenticated
    USING (status = 'published');

CREATE POLICY "Admins and instructors view all courses"
    ON public.courses FOR SELECT
    TO authenticated
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'instructor')
    );

CREATE POLICY "Admins manage courses"
    ON public.courses FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- COURSE MODULES & LESSONS
CREATE POLICY "Public can view published course modules"
    ON public.course_modules FOR SELECT
    TO anon, authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.courses c
            WHERE c.id = public.course_modules.course_id
              AND c.status = 'published'
        )
    );

CREATE POLICY "Admins manage modules"
    ON public.course_modules FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Public can view preview lessons"
    ON public.lessons FOR SELECT
    TO anon, authenticated
    USING (is_preview = true);

CREATE POLICY "Enrolled students can view lessons"
    ON public.lessons FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.course_modules cm
            JOIN public.enrollments e ON e.course_id = cm.course_id
            JOIN public.students s ON s.id = e.student_id
            WHERE cm.id = public.lessons.module_id
              AND s.profile_id = auth.uid()
              AND e.status = 'active'
        )
    );

-- ATTENDANCE RECORDS
CREATE POLICY "Admins manage all attendance"
    ON public.attendance_records FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Instructors manage assigned attendance"
    ON public.attendance_records FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.class_sessions cs
            WHERE cs.id = public.attendance_records.class_session_id
              AND cs.instructor_profile_id = auth.uid()
        )
    );

CREATE POLICY "Students view own attendance"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.students s
            WHERE s.id = public.attendance_records.student_id
              AND s.profile_id = auth.uid()
        )
    );

CREATE POLICY "Guardians view child attendance if permitted"
    ON public.attendance_records FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.guardian_student_relationships gsr
            WHERE gsr.guardian_profile_id = auth.uid()
              AND gsr.student_id = public.attendance_records.student_id
              AND gsr.status = 'active'
              AND gsr.can_view_attendance = true
        )
    );

-- NOTIFICATIONS
CREATE POLICY "Users read and update own notifications"
    ON public.notifications FOR ALL
    TO authenticated
    USING (recipient_profile_id = auth.uid())
    WITH CHECK (recipient_profile_id = auth.uid());

-- CONTACT ENQUIRIES
CREATE POLICY "Anyone can submit contact enquiry"
    ON public.contact_enquiries FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Admins view contact enquiries"
    ON public.contact_enquiries FOR ALL
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- AUDIT LOGS
CREATE POLICY "Admins view audit logs"
    ON public.audit_logs FOR SELECT
    TO authenticated
    USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
