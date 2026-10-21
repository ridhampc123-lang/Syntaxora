# Syntaxora — Database Schema & Data Integrity Specification

This document details the canonical PostgreSQL database schema, constraints, indexes, Row Level Security (RLS) policies, and migration management for the **Syntaxora AI Learning Academy** platform.

---

## 1. Schema Conventions & Types

- **Primary Keys**: UUID v4 (`gen_random_uuid()`).
- **Timestamps**: All timestamps use `TIMESTAMPTZ` with default `now()`.
- **Monetary Values**: Stored in integer minor units (e.g., cents, paise: `amount_in_cents INT NOT NULL CHECK (amount_in_cents >= 0)`) alongside an ISO-4217 currency code (e.g. `'USD'`, `'INR'`).
- **Text & Slugs**: Standardized lower-case kebab-case slugs with unique constraints.

---

## 2. Enums and Types

```sql
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
```

---

## 3. Core Tables and Invariants

### 3.1 `profiles`
Links directly to `auth.users.id`.
```sql
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
```

### 3.2 `students`
Canonical record for each learner at the academy.
```sql
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
```

### 3.3 `guardian_student_relationships`
Authoritative permission boundary for guardian access.
```sql
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
```

### 3.4 `guardian_invitations`
Cryptographically secured invitations.
```sql
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
```

### 3.5 `courses`, `course_modules`, `lessons`
```sql
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
```

### 3.6 `instructor_assignments`
Defines which instructors teach which courses.
```sql
CREATE TABLE public.instructor_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_instructor_course UNIQUE (instructor_profile_id, course_id)
);
```

### 3.7 `enrollments`
```sql
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
```

### 3.8 `class_sessions` & `attendance_records`
```sql
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
```

### 3.9 `assignments`, `submissions`, `assessments`, `assessment_results`
```sql
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
```

### 3.10 `learning_progress`
```sql
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
```

### 3.11 `payments`, `payment_orders`, `invoices`
```sql
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
```

### 3.12 `notifications`, `contact_enquiries`, `audit_logs`
```sql
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
```

---

## 4. Performance Indexes

```sql
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
```

---

## 5. Migration Execution Strategy

- All migrations are tracked chronologically in `supabase/migrations/` using timestamped prefixes (`20261021000001_core_schema.sql`, etc.).
- Migrations are tested against a local or development Supabase instance.
- No destructive drops are executed without forward-compatible data preservation scripts.
