-- ==============================================================================
-- Syntaxora AI Learning Academy — Student Applications & Security Enhancement
-- Migration: 20261023000001_student_applications_and_linking.sql
-- ==============================================================================

-- 1. Application Status Enum
DO $$ BEGIN
    CREATE TYPE application_status AS ENUM (
        'pending',
        'under_review',
        'approved',
        'rejected',
        'needs_information'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Student Applications Table
CREATE TABLE IF NOT EXISTS public.student_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_reference TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    age INT,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_title TEXT,
    education_level TEXT,
    guardian_name TEXT,
    guardian_email TEXT,
    guardian_phone TEXT,
    statement_of_interest TEXT,
    status application_status NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    decision_reason TEXT,
    reviewed_by_profile_id UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    provisioned_student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
    provisioned_at TIMESTAMPTZ,
    ip_address INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for fast administrative queries and duplicate detection
CREATE INDEX IF NOT EXISTS idx_student_apps_status ON public.student_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_apps_email ON public.student_applications(email);
CREATE INDEX IF NOT EXISTS idx_student_apps_reference ON public.student_applications(application_reference);
CREATE INDEX IF NOT EXISTS idx_student_apps_course ON public.student_applications(course_id);

-- 4. Update handle_new_user Trigger
-- STRICT SECURITY INVARIANT: Public self-registration only ever provisions parent accounts.
-- Student accounts require formal application and admin approval.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    assigned_role public.user_role := 'parent';
    input_role TEXT;
BEGIN
    IF new.raw_user_meta_data IS NOT NULL THEN
        input_role := (new.raw_user_meta_data->>'role');
    END IF;

    -- Only allow self-signup as 'parent'. Student accounts are provisioned via admin approval.
    IF input_role = 'parent' THEN
        assigned_role := 'parent'::public.user_role;
    ELSE
        -- If an unauthorized or student role is requested via public signup,
        -- default safely to 'parent' without creating any student record.
        assigned_role := 'parent'::public.user_role;
    END IF;

    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
        new.id,
        assigned_role,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Parent'),
        new.email
    )
    ON CONFLICT (id) DO UPDATE
    SET
        full_name = EXCLUDED.full_name,
        updated_at = now();

    -- Invariant: NEVER auto-create a student record on public auth signup.
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
        RETURN new;
END;
$$;

-- 5. Row Level Security for student_applications
ALTER TABLE public.student_applications ENABLE ROW LEVEL SECURITY;

-- Anonymous and authenticated visitors can submit applications
CREATE POLICY "Public can submit applications"
    ON public.student_applications FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Only authorized administrators may view student applications
CREATE POLICY "Admins can view all applications"
    ON public.student_applications FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Only authorized administrators may update applications (reviews, decisions)
CREATE POLICY "Admins can update applications"
    ON public.student_applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
