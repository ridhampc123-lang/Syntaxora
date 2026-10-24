-- =====================================================================
-- Migration: 20261023000002_batches_lms_and_live_classes.sql
-- Description: Adds Batches, Schedule Templates, Batch-Scoped Enrollments,
--              Enhanced Class Sessions, RLS Policies, and LMS Indexes.
-- =====================================================================

-- 1. Batch Status Enum
DO $$ BEGIN
    CREATE TYPE batch_status AS ENUM (
        'draft',
        'upcoming',
        'active',
        'paused',
        'completed',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Batches Table
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    batch_code TEXT NOT NULL UNIQUE,
    primary_instructor_profile_id UUID NOT NULL REFERENCES public.profiles(id),
    capacity INT NOT NULL DEFAULT 20 CHECK (capacity > 0),
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    status batch_status NOT NULL DEFAULT 'upcoming',
    waitlist_enabled BOOLEAN NOT NULL DEFAULT false,
    waitlist_capacity INT NOT NULL DEFAULT 0 CHECK (waitlist_capacity >= 0),
    created_by_profile_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT batch_dates_valid CHECK (end_at > start_at)
);

-- 3. Batch Schedule Templates (Recurring timetable rules e.g. MWF 9-10 AM)
CREATE TABLE IF NOT EXISTS public.batch_schedule_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE CASCADE,
    weekday INT NOT NULL CHECK (weekday >= 0 AND weekday <= 6), -- 0=Sun, 1=Mon, ..., 6=Sat
    start_time_local TIME NOT NULL,
    end_time_local TIME NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    effective_start_date DATE NOT NULL,
    effective_end_date DATE NOT NULL,
    instructor_profile_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT schedule_time_valid CHECK (end_time_local > start_time_local),
    CONSTRAINT schedule_dates_valid CHECK (effective_end_date >= effective_start_date)
);

-- 4. Augment Enrollments Table (Non-destructively)
ALTER TABLE public.enrollments 
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS admission_source TEXT DEFAULT 'direct_admission',
    ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'verified',
    ADD COLUMN IF NOT EXISTS starts_at TIMESTAMPTZ DEFAULT now(),
    ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by_profile_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS previous_batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS transfer_reason TEXT;

-- 5. Augment Class Sessions Table (Non-destructively)
ALTER TABLE public.class_sessions
    ADD COLUMN IF NOT EXISTS batch_id UUID REFERENCES public.batches(id) ON DELETE CASCADE,
    ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Asia/Kolkata',
    ADD COLUMN IF NOT EXISTS provider_meeting_id TEXT,
    ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS created_by_profile_id UUID REFERENCES public.profiles(id),
    ADD COLUMN IF NOT EXISTS schedule_template_id UUID REFERENCES public.batch_schedule_templates(id) ON DELETE SET NULL;

-- 6. Indexes for Performance & Query Isolation
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON public.batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_instructor ON public.batches(primary_instructor_profile_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.batches(status);
CREATE INDEX IF NOT EXISTS idx_batch_schedules_batch ON public.batch_schedule_templates(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON public.enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_batch ON public.enrollments(student_id, batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_batch ON public.class_sessions(batch_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_starts_at ON public.class_sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_class_sessions_instructor ON public.class_sessions(instructor_profile_id);

-- 7. Row Level Security Policies

-- Enable RLS on newly created tables
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batch_schedule_templates ENABLE ROW LEVEL SECURITY;

-- Batches Policies
-- Admin: Full access
CREATE POLICY "Admins have full access to batches"
    ON public.batches
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Instructors: View batches they teach
CREATE POLICY "Instructors can view assigned batches"
    ON public.batches
    FOR SELECT
    TO authenticated
    USING (
        primary_instructor_profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.instructor_assignments ia
            WHERE ia.course_id = batches.course_id AND ia.instructor_profile_id = auth.uid()
        )
    );

-- Students: View batches where they hold an active enrollment
CREATE POLICY "Students can view their active enrolled batches"
    ON public.batches
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.students s ON s.id = e.student_id
            WHERE e.batch_id = batches.id
              AND s.profile_id = auth.uid()
              AND e.status = 'active'
        )
    );

-- Guardians: View batches of their active verified linked students
CREATE POLICY "Guardians can view batches of their verified students"
    ON public.batches
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.guardian_student_relationships gsr
            JOIN public.enrollments e ON e.student_id = gsr.student_id
            WHERE gsr.guardian_profile_id = auth.uid()
              AND gsr.status = 'active'
              AND e.batch_id = batches.id
              AND e.status = 'active'
        )
    );

-- Schedule Templates Policies
CREATE POLICY "Admins have full access to schedule templates"
    ON public.batch_schedule_templates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

CREATE POLICY "Instructors can view assigned batch schedule templates"
    ON public.batch_schedule_templates
    FOR SELECT
    TO authenticated
    USING (
        instructor_profile_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.batches b
            WHERE b.id = batch_schedule_templates.batch_id
              AND b.primary_instructor_profile_id = auth.uid()
        )
    );

CREATE POLICY "Students can view schedule templates of their batch"
    ON public.batch_schedule_templates
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.enrollments e
            JOIN public.students s ON s.id = e.student_id
            WHERE e.batch_id = batch_schedule_templates.batch_id
              AND s.profile_id = auth.uid()
              AND e.status = 'active'
        )
    );
