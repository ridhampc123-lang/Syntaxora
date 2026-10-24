# Syntaxora — Implementation Plan

This implementation plan is the live tracking document for developing the **Syntaxora AI Learning Academy** platform according to `Syntaxora_Complete_Project_Specification.md`.

---

## Progress Overview

| Phase | Description | Status | Pass Criteria Met |
|---|---|---|---|
| **Phase 0** | Repository & Design Setup, Baseline Checks & Architecture Docs | Completed | Baseline build, lint, typecheck & test passed |
| **Phase 1** | Public Marketing Website & Course Discovery | Completed | All 16 public routes, SSG/dynamic catalog, SEO & clean checks passed |
| **Phase 2** | Database Migrations, Auth, Roles & RLS Foundation | Completed | Schema migration, auth flows, role resolution & RLS policies |
| **Phase 3** | Admin Foundations & Master Data Management | In Progress | Pending admin dashboard, student/course/enrollment CRUD & audit logs |
| **Phase 4** | Guardian Matching & Security Permission Boundary | Pending | Token hashing, zero-guess matching, RLS isolation |
| **Phase 5** | Instructor & Class Operations (Sessions, Attendance, Grading) | Pending | Scoped access, attendance integrity, submissions |
| **Phase 6** | Student & Parent Role-Based Portals | Pending | Server-derived child selector, progress calculation |
| **Phase 7** | External Integrations (Email, Payments, Live Classes, Files) | Pending | Honest provider status, webhooks, private storage |
| **Phase 8** | Hardening, Accessibility, Security Audit & Launch Gates | Pending | WCAG AA, rate limiting, zero critical vulnerabilities |

---

## Phase Checklist & Detailed Tasks

### Phase 0: Repository and Design Setup
- [x] Inspect repository state and initialize Next.js 16 (App Router), TypeScript, Tailwind CSS, ESLint, Vitest.
- [x] Verify baseline clean build (`npm run build`) and lint (`npm run lint`).
- [x] Install core dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `lucide-react`, `zod`, `clsx`, `tailwind-merge`, `vitest`.
- [x] Configure `vitest.config.mts`, `package.json` scripts (`typecheck`, `test`, `build`, `lint`).
- [x] Create core architectural and documentation deliverables:
  - [x] `ARCHITECTURE.md`
  - [x] `DATABASE.md`
  - [x] `SECURITY.md`
  - [x] `TEST_PLAN.md`
  - [x] `.env.example`
  - [x] `README.md`
- [x] Implement design tokens in `src/app/globals.css` using the official palette:
  - Deep navy (`#142541`), Primary blue (`#3869AD`), Teal (`#168B83`), Cloud background (`#F3F6FA`), White (`#FFFFFF`), Body text (`#263449`), Muted text (`#5F6F84`), Border (`#DCE4EE`).
- [x] Implement shared UI utility primitives (`src/lib/utils.ts`, buttons, cards, badges, inputs, alerts).
- [x] Run baseline verification: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

### Phase 1: Public Website
- [x] Marketing layout with responsive navigation, header wordmark, mobile drawer, and footer.
- [x] Home page (`src/app/(marketing)/page.tsx`):
  - Hero with dual CTA ("Explore Courses", "How It Works").
  - Learning paths / audience cards (Young Learners, Teens, College Students, Adults).
  - "What You Will Build" hands-on project showcase.
  - "How Learning Works" 5-step methodology.
  - Live classes vs. recorded learning explainer.
  - Approved instructors section.
  - FAQ accordion with accessible markup.
  - Final enrollment CTA and honest footer links.
- [x] Courses catalog page (`src/app/(marketing)/courses/page.tsx`):
  - Filters by category, audience group, difficulty level, delivery mode.
  - Search input with URL state sync.
  - Course cards with server data, loading skeletons, and empty state.
- [x] Course detail page (`src/app/(marketing)/courses/[slug]/page.tsx`):
  - Overview, outcomes, prerequisites, syllabus accordion, schedule info, pricing, enrollment CTA.
- [x] Programs page (`src/app/(marketing)/programs/page.tsx`).
- [x] About page (`src/app/(marketing)/about/page.tsx`).
- [x] Instructors page (`src/app/(marketing)/instructors/page.tsx`).
- [x] Contact page (`src/app/(marketing)/contact/page.tsx`) with validated form and server action.
- [x] FAQ page (`src/app/(marketing)/faq/page.tsx`).
- [x] Privacy policy (`src/app/(marketing)/privacy/page.tsx`) & Terms (`src/app/(marketing)/terms/page.tsx`).
- [x] SEO metadata, OpenGraph tags, and semantic HTML structure.

### Phase 2: Database and Authentication
- [x] Supabase SQL migration files in `supabase/migrations/`:
  - Enums (`user_role`, `student_status`, `relationship_status`, `course_level`, `delivery_mode`, `enrollment_status`, `attendance_status`, etc.).
  - `profiles` table with trigger syncing from `auth.users`.
  - `students` canonical table.
  - `guardian_student_relationships` table with constraints.
  - `courses`, `course_modules`, `lessons` tables.
  - `enrollments` table with uniqueness constraints.
  - `class_sessions` & `attendance_records` tables.
  - `assignments`, `submissions`, `assessments`, `assessment_results` tables.
  - `learning_progress` table.
  - `instructor_assignments` table.
  - `payments`, `payment_orders`, `invoices` tables.
  - `guardian_invitations` table.
  - `notifications` table.
  - `contact_enquiries` table.
  - `audit_logs` table.
- [x] Row Level Security (RLS) policies on every table with default-deny.
- [x] Supabase client utilities:
  - `src/lib/supabase/client.ts` (browser client).
  - `src/lib/supabase/server.ts` (server component / action client using cookies).
  - `src/lib/supabase/public.ts` (public non-cookie client).
  - `src/lib/supabase/admin.ts` (privileged service-role client for isolated server tasks).
- [x] Middleware for session management and route protection (`src/middleware.ts`).
- [x] Authentication flows:
  - Sign-in (`src/app/(auth)/login/page.tsx`).
  - Sign-up (`src/app/(auth)/sign-up/page.tsx`) — student or parent only; role injection blocked.
  - Forgot password (`src/app/(auth)/forgot-password/page.tsx`).
  - Reset password (`src/app/(auth)/reset-password/page.tsx`).
  - Verification & callback (`src/app/(auth)/verify/page.tsx`).
- [x] Server-side role resolution and portal routing based on authoritative database role.

### Phase 3: Admin Foundations
- [x] Admin portal layout with navigation and role authorization gate.
- [x] Admin overview dashboard with genuine database counts and recent activity.
- [x] Student management:
  - List with pagination, filters, and search.
  - Create student record with server-generated unique student code.
  - Edit permitted student details.
  - Archive/status updates.
- [x] Instructor management:
  - List instructors and workload assignments.
  - Invite instructor workflow.
- [x] Course & curriculum management:
  - Create and edit courses.
  - Publish / unpublish toggle.
  - Module and lesson builder.
- [x] Enrollment management:
  - Enroll student in course/batch.
  - Update status and dates.
- [x] Audit log viewer with search, actor, entity, and timestamp.
- [x] Contact enquiries inbox with status management.

### Phase 4: Guardian Matching
- [x] Invitation creation server action (bound to student and specific guardian identity).
- [x] Cryptographic token generation (`crypto.randomBytes`) and SHA-256 storage hash.
- [x] Invitation acceptance workflow (`src/app/guardian/accept-invitation/page.tsx`):
  - Token validation, expiration check, single-use enforcement.
  - Identity verification and transactional activation.
- [x] Relationship management in Admin Portal:
  - Status transition: `pending` -> `active` / `rejected` / `revoked`.
  - Granular permissions (`can_view_attendance`, `can_view_progress`, `can_view_schedule`, `can_view_fees`, `can_receive_notifications`).
  - Audit logging on every permission change or revocation.
- [x] Strict RLS and server policies:
  - Parent queries strictly scoped through `guardian_student_relationships`.
  - Zero cross-family leakage tests.

### Phase 5: Instructor and Class Operations
- [x] Instructor portal layout with assigned course scope verification.
- [x] Class session scheduling and management.
- [x] Attendance recording interface:
  - List eligible enrolled students for the session.
  - Record present/absent/late/excused.
  - Audited corrections with mandatory change reason.
- [x] Assignment & assessment management:
  - Create assignment with deadline and max score.
  - Review student submissions.
  - Grade and provide feedback.
  - Explicit grade publication toggle.
- [x] Learning progress overview for assigned cohorts.

### Phase 6: Student and Parent Portals
- [x] Student Portal (`src/app/student/`):
  - Enrolled courses with syllabus and lessons.
  - Live class join link (active only during valid session window).
  - Assignment submission interface.
  - Released grades and instructor feedback.
  - Personal attendance history and verified learning progress.
- [x] Parent Portal (`src/app/parent/`):
  - Server-authorized child selector (no client-side ID spoofing).
  - Per-child attendance view (subject to `can_view_attendance`).
  - Per-child progress & grades view (subject to `can_view_progress`).
  - Per-child schedule view (subject to `can_view_schedule`).
  - Per-child billing & fees view (subject to `can_view_fees`).
  - In-app notification center (subject to `can_receive_notifications`).

### Phase 7: External Integrations
- [x] Email service adapter (`src/server/integrations/email/`):
  - Provider abstraction with clear not-configured state and local logging fallback.
  - Template dispatch for invitations, enrollments, schedule changes.
- [x] Live-class adapter (`src/server/integrations/meeting/`):
  - Zoom / Google Meet adapter abstraction with genuine link generation or admin configuration.
  - Truthful fallback when credentials are not configured.
- [x] Payment service adapter (`src/server/integrations/payments/`):
  - Order creation, webhook handler with cryptographic signature verification, idempotent processing.
  - Honest "payments not configured" state when keys are absent.
- [x] Storage & File management (`src/server/integrations/storage/`):
  - Private buckets for assignments, documents, invoices.
  - Server-issued short-lived signed URLs.

### Phase 8: Hardening, Accessibility and Launch Gates
- [x] Accessibility review (WCAG 2.2 AA audit, keyboard navigation, focus management, screen-reader text).
- [x] Responsive layout verification (mobile, tablet, desktop).
- [x] HTTP security headers (HSTS, CSP, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy).
- [x] Rate limiting & input protection on sensitive endpoints (auth, contact, invitations).
- [x] Comprehensive test suite execution (63 tests across 10 suites: unit, integration, authorization, adapters).
- [x] Production build verification (`npm run build` with 47 App Router routes passing cleanly).
- [x] Documentation updates and deployment guide.
