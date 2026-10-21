# Syntaxora — Complete Project Build Specification
**Purpose:** This is the single source of truth for an AI education academy website and its connected Admin, Instructor, Student, and Parent portals. Give this entire file to Antigravity as the project specification.

> **Important engineering rule:** No prompt can guarantee a completely issue-free project in one generation. Build in phases, run checks after each phase, fix failures before proceeding, and never claim a feature works unless it has been implemented and tested. Do not replace unfinished functionality with mock data, fake dashboards, dead buttons, or placeholder API responses.

---

## 1. Product Overview

Build **Syntaxora**, a professional online AI learning academy for children, teenagers, college students, and adults. The platform supports instructor-led live classes, recorded lessons, learning resources, assignments, assessments, attendance, progress tracking, parent visibility, student enrollment, and administration.

The product consists of:
1. Public marketing website
2. Authentication and account onboarding
3. Admin portal
4. Instructor portal
5. Student portal
6. Parent/guardian portal
7. Shared backend, database, storage, authorization, notifications, and audit trail

**Primary outcome:** A polished, accessible, secure, maintainable, responsive, production-oriented platform where all portals use the same real backend and correctly scoped data.

### Product principles
- Correctness and privacy before animation or decoration.
- One canonical record for each real person, student, course, class, enrollment, and payment.
- Server-side authorization and database-level access controls.
- No parent can ever see another family's student data.
- No fabricated business details, fake metrics, fake reviews, or hardcoded demo records in production.
- No secrets in client code.
- No “success” messages until the server confirms the operation.
- Clear errors, loading states, empty states, retries where safe, and accessible forms.
- Build only the features described here unless a dependency or security requirement demands an additional component.

---

## 2. Required Workflow for Antigravity

Do not attempt to generate the entire application in a single unverified pass.

### Mandatory process
1. Inspect the existing repository before changing anything. Identify the framework, installed packages, existing code, environment files, and current build state.
2. If the repository is empty, initialize the specified stack. If it already contains work, preserve useful work and adapt rather than destructively replacing it.
3. Create `IMPLEMENTATION_PLAN.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `TEST_PLAN.md`, and `.env.example`.
4. Implement one phase at a time in the order below.
5. After each phase, run type checking, linting, relevant tests, and production build. Fix errors before moving to the next phase.
6. Use actual database migrations and server-side operations; do not simulate persistence with browser storage or arrays.
7. Keep a task checklist in `IMPLEMENTATION_PLAN.md`. Mark a task complete only after its acceptance criteria pass.
8. At the end, provide a report listing implemented features, commands run, test results, environment variables still required, integrations still needing credentials, and any remaining limitations. Do not claim a third-party integration is live without credentials and a successful test.

### Stop-and-fix rule
If a build, type check, migration, or test fails, investigate and fix the underlying issue. Do not hide errors, disable checks, use `any` as a blanket workaround, remove tests, or mark a failing phase complete.

---

## 3. Technology Stack

Use a coherent stack and avoid duplicate tools for the same responsibility.

### Frontend
- Next.js App Router
- React
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui components where useful
- Lucide icons
- Motion/Framer Motion only for restrained, purposeful animation
- React Hook Form and Zod for validated forms where suitable

Use the versions compatible with the repository and each other. Do not blindly upgrade every package to a breaking major version.

### Backend and data
- Supabase PostgreSQL as the canonical database
- Supabase Auth for authentication
- Supabase Storage for private learning files and authorized documents
- Supabase Row Level Security (RLS) for database access control
- Server-side Next.js route handlers/server actions for privileged operations
- Zod validation at server boundaries
- Email provider behind a small service abstraction, configured by environment variables
- Payment provider integration only after choosing a provider and configuring credentials
- Live-class provider integration through a documented adapter; do not invent meeting links

Do not add Prisma, a second database, a separate Express backend, Firebase, or another auth system unless an explicit architecture decision is documented with a concrete reason. Do not mix multiple competing migration systems. Use Supabase SQL migrations as the source of truth.

### Deployment
- Vercel for the Next.js application
- Supabase hosted project for database, authentication, and storage
- Configure production environment variables separately from development variables
- Document any provider-specific deployment requirements

### Code quality
- Strict TypeScript
- ESLint
- Consistent formatting
- Unit and integration tests
- End-to-end tests for critical journeys
- Error boundaries and structured server logging without secrets or sensitive student data

---

## 4. Project Structure

Adapt this structure to the installed Next.js version and conventions, but preserve the separation of concerns.

```text
syntaxora/
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── src/
│   ├── app/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── courses/[slug]/page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   ├── instructors/page.tsx
│   │   │   ├── contact/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   ├── privacy/page.tsx
│   │   │   └── terms/page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── sign-up/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   ├── reset-password/page.tsx
│   │   │   └── verify/page.tsx
│   │   ├── admin/
│   │   ├── instructor/
│   │   ├── student/
│   │   ├── parent/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── marketing/
│   │   ├── navigation/
│   │   ├── forms/
│   │   ├── dashboards/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── students/
│   │   ├── guardians/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   ├── classes/
│   │   ├── attendance/
│   │   ├── assignments/
│   │   ├── assessments/
│   │   ├── progress/
│   │   ├── payments/
│   │   ├── notifications/
│   │   ├── files/
│   │   └── audit/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── auth/
│   │   ├── permissions/
│   │   ├── validation/
│   │   ├── errors/
│   │   ├── logging/
│   │   └── utils/
│   ├── server/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── policies/
│   │   └── integrations/
│   └── types/
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example
├── IMPLEMENTATION_PLAN.md
├── ARCHITECTURE.md
├── DATABASE.md
├── SECURITY.md
├── TEST_PLAN.md
├── middleware.ts
├── package.json
└── README.md
```

Keep components small and purposeful. Do not place all application logic in one page or create a giant file for all database operations.

---

## 5. Visual Design System

### Brand positioning
Syntaxora should feel like a credible, contemporary learning company: curious, warm, intelligent, accessible, and premium. Avoid a generic AI-generated landing-page appearance.

### Palette
Use a light-first theme with readable contrast:
- Deep navy: `#142541` — primary text and strong surfaces
- Primary blue: `#3869AD` — primary actions and links
- Teal: `#168B83` — progress and secondary accents
- Cloud background: `#F3F6FA`
- White: `#FFFFFF`
- Body text: `#263449`
- Muted text: `#5F6F84`
- Border: `#DCE4EE`
- Success, warning, and error colors must remain distinguishable without relying on color alone.

Use CSS variables/design tokens so colors and spacing can be changed centrally. Do not use every accent color on every screen. Meet WCAG AA contrast for ordinary text.

### Typography and layout
- Use a legible modern sans-serif font with sensible fallbacks.
- Establish a clear hierarchy for page title, section title, body, labels, and helper text.
- Use a consistent spacing scale, grid, container width, radius, shadows, and button sizes.
- Prefer clear layouts and purposeful whitespace over oversized empty hero sections.
- Avoid excessive gradients, glassmorphism, glowing effects, huge rounded cards, random icon styles, and decorative animations that reduce usability.

### Photography and illustrations
- Use relevant, licensed/appropriately sourced education, AI, robotics, coding, and classroom imagery.
- Do not use images that imply real Syntaxora students, instructors, awards, or facilities unless those are genuine and authorized.
- Use optimized responsive images, meaningful alt text, and stable aspect ratios.
- Never generate fake testimonial headshots or present fictional people as actual instructors.
- If assets are unavailable, use tasteful designed placeholders that are clearly placeholders and easy to replace, not misleading stock claims.

### Animation
- Animate navigation, section entry, cards, progress, and modal transitions only where it improves feedback.
- Respect `prefers-reduced-motion`.
- Avoid animation on every element, scroll-jacking, and effects that hurt mobile performance.
- Make hover, focus, active, disabled, loading, and error states explicit.

### Responsive requirements
- Mobile-first, tablet, laptop, and large desktop.
- No horizontal overflow at common viewport widths.
- Accessible mobile navigation and usable dashboard tables on small screens.
- Inputs and interactive targets must be comfortable for touch.

---

## 6. Public Website Requirements

Build real pages, not a single landing page with dead navigation.

### 6.1 Home page
Sections:
1. Header with Syntaxora wordmark, Courses, Learning Paths, How It Works, About, FAQ, and a clear CTA.
2. Hero describing practical AI learning for different age groups, with primary CTA such as “Explore Courses” and secondary CTA such as “How It Works”.
3. Real program/course highlights from the database once available.
4. Learning path / audience cards: young learners, teens, college students, and adults.
5. “What you will build” project-focused section.
6. How learning works: enroll, attend, practice, build, review.
7. Live classes and recorded learning explanation.
8. Instructor section based only on real approved instructor records.
9. Student outcomes or testimonials only when authentic and consented; hide section if no real content exists.
10. Frequently asked questions.
11. Final enrollment/contact CTA.
12. Footer with real links, legal pages, and contact information configured by the owner.

Do not invent student counts, success percentages, client logos, certifications, ratings, testimonials, addresses, phone numbers, or guarantees.

### 6.2 Courses and programs
- Course listing with search, category, age/audience group, level, mode, and availability filters.
- Course detail page with overview, learning outcomes, prerequisites, syllabus/modules, delivery mode, schedule information where applicable, instructor, pricing if configured, and enrollment CTA.
- Only published/approved courses should be publicly visible.
- Empty and loading states must be designed.
- Use database-backed content; never hardcode a catalogue as production data.

### 6.3 Other pages
- About: real mission and academy information, editable by an authorized admin.
- Instructors: approved instructor profiles only.
- Contact: validated form, server-side rate limiting, spam protection, safe email delivery, and database record of enquiries. Do not expose provider credentials.
- FAQ: editable content if practical.
- Privacy policy and terms: clearly labeled owner-review-required drafts until legal review; do not claim legal compliance without review.

### 6.4 Public forms
- Validate client and server side.
- Prevent spam and abuse.
- Show a useful confirmation only after successful server processing.
- Do not expose internal IDs, private student information, or stack traces.

---

## 7. Authentication, Roles, and Onboarding

### Roles
Implement a server-controlled role system:
- `admin`
- `instructor`
- `student`
- `parent`

A user's role must not be assignable by a public sign-up form. Public sign-up must never allow a visitor to become an admin or instructor simply by changing request data.

### Authentication requirements
- Supabase Auth for sign-up, sign-in, sign-out, email verification, password reset, and session handling.
- Secure cookies/session management according to the current supported Supabase/Next.js integration.
- Validate sessions on the server for protected pages and operations.
- Rate-limit sensitive endpoints.
- Avoid leaking whether a private account exists in password recovery responses.
- Redirect users to the correct portal only after checking their server-stored role.
- A role in browser state or local storage is not authoritative.
- Define a safe account recovery and admin account bootstrap procedure in the README.

### Role assignment
- First admin must be provisioned using a documented, private, server-side process; never create a publicly accessible “make me admin” route.
- Admin invites instructors through a controlled workflow.
- Student accounts can be created by an approved sign-up/enrollment process or by admin invitation.
- Parent accounts can sign up independently, but have no access to student records until a guardian-student relationship is verified and activated.
- Do not silently merge two users because their email, name, or phone looks similar.

---

## 8. Data Model and Database Integrity

Design and document a normalized PostgreSQL schema with UUID primary keys, foreign keys, timestamps, constraints, and indexes. Exact column types may be refined during migrations, but the following concepts and invariants are mandatory.

### Core tables

#### `profiles`
- `id` UUID referencing the Supabase Auth user ID
- `display_name`
- `avatar_path` (optional, private or safely public according to policy)
- `phone` (optional, access restricted)
- `created_at`, `updated_at`

Role information must be stored and controlled securely. If role is in a separate table, enforce one authoritative source and document it.

#### `students`
- `id`
- `profile_id` nullable until an account is attached, unique when present
- `student_code` unique, generated server-side
- `date_of_birth` only if needed; tightly restrict access
- `status` (e.g. pending, active, paused, archived)
- `created_at`, `updated_at`

A student is a canonical academy record, not a duplicate record created each time a parent submits a form. Decide and document how student profiles are linked to login accounts and how duplicate student records are resolved by an authorized admin.

#### `guardian_student_relationships`
- `id`
- `guardian_profile_id`
- `student_id`
- `relationship_type` (parent, legal_guardian, other_authorized_guardian)
- `status` (`pending`, `active`, `rejected`, `revoked`, `expired`)
- `can_view_attendance`
- `can_view_progress`
- `can_view_schedule`
- `can_view_fees`
- `can_receive_notifications`
- `verification_method`
- `verified_at`
- `verified_by_profile_id`
- `created_at`, `updated_at`, `revoked_at`

Constraints:
- Unique pair `(guardian_profile_id, student_id)`; reactivate the existing pair instead of creating duplicate active links.
- A relationship must not become active without the approved verification process.
- Only authorized admins or a documented, secure verification workflow may activate or revoke a relationship.
- Keep an audit record of permission changes and revocation.
- Allow one student to have multiple authorized guardians and one guardian to have multiple linked students.
- A guardian relationship is a permission boundary, not just a display preference.

#### `courses`
- `id`, `slug` unique, `title`, `summary`, `description`, `level`, `audience_group`, `delivery_mode`, `status`, `published_at`, `created_at`, `updated_at`

#### `course_modules` and `lessons`
- Course modules have a course foreign key and stable order.
- Lessons have a module foreign key, type, title, description, resource reference, visibility status, and order.
- Do not put private file URLs in publicly readable course rows.

#### `enrollments`
- `id`, `student_id`, `course_id`, optional batch/cohort reference, `status`, `start_at`, `end_at`, `created_at`
- Define constraints that prevent invalid duplicate active enrollment where required.
- Enrollment status and dates must be checked before granting course content access.

#### `class_sessions`
- `id`, course/batch reference, instructor profile ID, title, `starts_at`, `ends_at`, meeting provider, provider meeting ID/reference, status, created/updated timestamps.
- Validate end time is after start time.
- Meeting URLs must be protected according to course enrollment and session permissions.

#### `attendance_records`
- `id`, `class_session_id`, `student_id`, attendance status, recorded_by, recorded_at, optional correction reason.
- Unique `(class_session_id, student_id)`.
- Validate that the student is enrolled in the relevant course/batch before attendance is recorded.
- Corrections must be audited, not silently overwritten.

#### `assignments`, `submissions`, `assessments`, `assessment_results`
- Each record must be connected through foreign keys to the correct course, student, enrollment, assignment, or assessment.
- Validate that a submission belongs to the student who submits it and that the student is enrolled/authorized.
- Grades and instructor feedback must not be editable by students or parents.
- Record who made a grade change and when.

#### `learning_progress`
- Track lesson completion or equivalent progress with a unique key that prevents duplicate completion rows for the same student/lesson.
- Progress must be derived from authorized, validated events and not from a client-supplied arbitrary percentage.
- Document whether progress is calculated live or materialized, and how it is recalculated.

#### `instructor_assignments` or batch/course instructor relation
- Defines which instructor is assigned to which course/batch/session.
- Instructor data access must be scoped to assigned teaching responsibilities.

#### `payments`, `payment_orders`, `invoices`
- Store server-verified payment status, provider reference, amount in smallest currency unit, currency, student/enrollment association, timestamps, and invoice reference where applicable.
- Do not store card numbers, CVV, or payment credentials.
- Do not treat the browser's “payment successful” redirect as proof of payment.
- Verify payment status through a trusted server-side provider API and/or signature-verified webhook.
- Make webhook processing idempotent; unique provider event/payment IDs prevent duplicate financial updates.
- Financial records must be auditable and corrections must be traceable.

#### `guardian_invitations`
- Invitation ID, target student ID, intended guardian identity or verified destination, token hash, expiry, status, created_by, consumed_at, and audit timestamps.
- Store only a hash of the random invitation token, not the raw token.
- Tokens must be high entropy, single use, time limited, bound to the intended guardian/student, and invalidated after use or revocation.
- Never log invitation tokens.

#### `notifications`
- Recipient user ID, type, safe metadata, delivery channel, read status, timestamps.
- Enforce recipient access. Do not put sensitive student details into push/email payloads unnecessarily.

#### `contact_enquiries`
- Contact form submissions with limited fields, processing status, timestamps, and restricted admin access.

#### `audit_logs`
- Actor ID, action, entity type/ID, timestamp, outcome, and safe metadata.
- Never log passwords, access tokens, invitation tokens, payment secrets, or unnecessary sensitive student data.
- Audit critical operations such as role changes, guardian link activation/revocation, attendance corrections, grade changes, enrollment changes, and payment status transitions.

### Database integrity requirements
- Use foreign keys and `NOT NULL`, `UNIQUE`, `CHECK`, and exclusion constraints where appropriate.
- Use database transactions for multi-step changes that must succeed or fail together.
- Prefer database-enforced invariants over frontend-only checks.
- Add indexes to foreign-key columns and common filters, including relationship guardian/student/status, enrollment student/course/status, session start time, attendance student/session, and notification recipient/read status.
- Use pagination and deterministic sorting for lists.
- Avoid N+1 queries and unbounded list endpoints.
- Store times in `timestamptz` and display them in the user's configured timezone.
- Store money in integer minor units and an explicit ISO currency code.
- Provide forward migrations and document rollback/recovery considerations.
- Do not use `seed.sql` to insert fabricated production records. If test fixtures are required, keep them in a test-only setup that cannot accidentally run against production.

---

## 9. Critical Guardian–Student Matching and Authorization

This is a mandatory high-priority security feature. It must be implemented and tested before releasing the Parent Portal.

### Absolute rule
Never match a parent to a student automatically based only on name, surname, email, phone number, address, date of birth, or a similar-looking record. These fields may help an admin search, but are not proof of authorization.

### Relationship model
Use the `guardian_student_relationships` table as the only authoritative source for which students a guardian may access. The portal must never query all students and filter them in the browser.

### Secure linking flow
1. An authorized admin creates or finds the canonical student record and confirms there is no accidental duplicate.
2. Admin identifies the intended guardian using a verified process.
3. The server creates an invitation bound to exactly one student and the intended guardian identity/destination.
4. Generate a cryptographically secure, high-entropy, single-use token. Store only its hash and set an expiry.
5. Send the invitation through a configured, trusted channel. If email/SMS delivery is not configured, show an explicit admin status; do not claim it was sent.
6. The guardian signs in or creates an account and verifies the account identity through the approved workflow.
7. Server validates token hash, expiry, unused status, target student, intended guardian, and account identity.
8. In one database transaction, consume the invitation and activate the relationship after all required checks succeed. Prevent concurrent duplicate consumption.
9. Write an audit event and notify the authorized parties without exposing unnecessary data.
10. The guardian dashboard lists only students connected by active relationships and only the categories permitted by that relationship.
11. Revocation immediately denies subsequent database/API/file/realtime access. Existing cached data must not remain available to another signed-in user.

### Verification and exception handling
- Define what evidence is required before activating a guardian link, especially for minors. Do not assume email access alone proves legal guardianship.
- For an in-person or admin-reviewed process, record verifier, timestamp, method, and outcome.
- A rejected, expired, consumed, or revoked invitation cannot be reused.
- An admin can revoke a relationship with a reason and audit event.
- Re-activation must follow the approved verification policy and update the existing pair instead of creating duplicate active rows.
- A student can have multiple guardians only after each relationship is separately authorized.
- A guardian with multiple children must be able to switch between them without mixing their data.
- Do not show student data in the page before the server confirms the relationship and permission.
- Changing the student ID in a URL, request body, query string, browser state, or API call must never bypass authorization.

### Request-level authorization
For every request to view or modify student-specific information:
1. Validate the authenticated session on the server.
2. Derive the actor's identity from the verified session, never from a client-supplied `guardian_id`, `student_id`, role, or profile ID.
3. Resolve the requested student from the canonical database record.
4. Confirm the relevant guardian relationship is `active`.
5. Check the specific permission (attendance, progress, schedule, fees, etc.).
6. Confirm the underlying record belongs to that student and is available to that role.
7. Apply database RLS and/or server policy checks; sensitive mutations require both as appropriate.
8. Return the minimum necessary fields.
9. Log sensitive access or mutations according to the audit policy without logging secrets.

### Row Level Security
- Enable RLS on all tables exposed to authenticated client access.
- Create explicit policies for each role and table. Default should be deny.
- Do not rely only on middleware, hidden UI, or a page-level role check.
- Parents may read a student's allowed data only when an active guardian relationship exists and the corresponding permission is true.
- Students may read only their own authorized records.
- Instructors may read/write only data permitted for their assigned courses/batches and duties.
- Admin privileges must be explicit and limited to verified admin accounts.
- Never expose the Supabase service-role key to browser code or public environment variables.
- Review storage policies as carefully as table policies.
- Test policies with real authenticated test users and direct API requests, not only through the UI.

### Files, realtime, and caching
- Private recordings, assignments, invoices, and documents must use private storage buckets and server-authorized access or short-lived signed URLs issued after authorization.
- Do not expose permanent public URLs for private student files.
- Realtime subscriptions are not an authorization mechanism; RLS and channel policy must still apply.
- Unsubscribe or replace subscriptions when the user logs out or changes the selected student.
- Do not cache private portal responses publicly. Use per-user authorization-aware caching or `no-store` for sensitive responses.
- Never reuse a cached parent dashboard response across accounts.
- When a relationship is revoked, deny future reads and downloads. Use short-lived signed URLs and define how access is limited for previously issued URLs.

### Parent data acceptance rule
Every parent-visible attendance row, grade, assignment, progress entry, schedule, message, file, invoice, and payment must trace to:
- one canonical student ID,
- one valid underlying record,
- an active guardian relationship,
- the relevant permission,
- and a server/database authorization check.

If any check fails, deny access. Never “best guess” which student a record belongs to.

---

## 10. Role-Based Portal Requirements

### 10.1 Admin portal
Admin navigation should be separate from public navigation. Do not put Admin Panel links in the public website header.

Features:
- Overview with real aggregate metrics only.
- Manage students: create, edit permitted fields, archive, search, filter, pagination, student-code generation, duplicate review.
- Manage guardians and guardian-student relationship requests: view status, verify, approve/reject, set permissions, revoke, audit history.
- Manage instructors: invite, activate/deactivate, assign courses/batches, view assigned workload.
- Manage courses: create, edit, publish/unpublish, manage modules and lessons.
- Manage enrollments: create/update status, dates, and course/batch assignment.
- Manage class sessions: schedule, assign instructor, configure provider reference, cancel/reschedule, notify affected users.
- Attendance overview and audited correction workflow.
- Assignments and assessment management, grade release controls, and audit trail.
- Payments and invoices based on verified provider status; never manually fabricate “paid” states.
- Manage contact enquiries and configurable public content.
- Notification templates/settings where implemented.
- Audit log search with access controls.
- Role/permission management with safe confirmation for high-impact changes.

All admin actions must persist to the backend, validate server-side, show pending/success/failure states, and re-fetch the canonical record after mutation.

### 10.2 Instructor portal
- View only assigned courses, batches, and sessions.
- View eligible enrolled students for assigned teaching scope.
- Manage class/session details within assigned permissions.
- Record attendance with duplicate prevention and correction audit trail.
- Create/manage assigned-course lessons, assignments, resources, and assessments if granted.
- Review submissions and enter grades/feedback.
- View learning progress for assigned students only.
- Send class-related announcements through an authorized notification workflow.
- See a calendar/schedule with timezone-aware times.
- Upload files to private storage with type/size validation.
- No access to payment instruments or unrelated family details.
- No ability to grant themselves courses, change their role, or access unassigned cohorts.

### 10.3 Student portal
- Dashboard with current courses, upcoming sessions, due assignments, and verified progress.
- Course/lesson access only for active enrollment and content availability.
- Live-class join action only when authorized and within the session's access rules.
- Recorded lessons with access checks and progress tracking.
- Assignments: view, upload/submit, see submission status and allowed feedback.
- Assessments: access only during configured availability; server validates submission.
- Grades/feedback only after the configured release status.
- Calendar, notifications, learning resources, and profile settings.
- Student may edit only explicitly allowed profile fields.
- Student cannot change grades, attendance, fees, enrollment status, or role.

### 10.4 Parent/guardian portal
- Dashboard lists only linked students with active, authorized relationships.
- Child selector must be based on server-authorized children, not arbitrary IDs.
- Per-child view for permitted attendance, schedule, progress, assignments, released results, fees/invoices, and notifications.
- Respect per-relationship permission flags.
- Never show another child's records even briefly while switching children.
- Clear relationship status and safe request-help process if a child is missing.
- Parents cannot edit academic results, attendance, enrollment, or payment verification state.
- Parent financial visibility must be scoped to the correct student/fee responsibility and documented policy.
- Every portal query must be server-authorized and RLS-protected.

---

## 11. Learning Experience and Course Logic

### Courses and enrollment
- Only published courses can be discovered publicly.
- Enrollment must validate course status, capacity if applicable, prerequisites if configured, and account/student identity.
- Keep enrollment status transitions explicit and auditable.
- A student's course access must derive from active enrollment and lesson visibility.
- Avoid duplicate enrollments using database constraints and transactional logic.

### Live classes
- Store timestamps with timezone-aware semantics.
- Ensure `ends_at > starts_at`.
- Only enrolled students, assigned instructors, and authorized admins can see relevant session details.
- Use a provider adapter for Zoom, Google Meet, or another selected provider. Do not generate fake meeting links.
- If provider API credentials are missing, show a clear “integration not configured” state to admins and do not show a misleading join button to users.
- Rescheduling/cancellation should notify the correct enrolled students and authorized guardians according to preferences and permissions.

### Recorded lessons
- Store private media references, not exposed provider credentials or permanent private URLs.
- Check enrollment, publication state, and role before issuing access.
- Track progress idempotently so repeated events do not inflate completion.

### Attendance
- Unique student/session pair.
- Validate student enrollment in the corresponding course/batch.
- Only authorized instructors/admins can record or correct attendance.
- Store actor and timestamp; corrections require a reason.
- Parent visibility depends on active relationship and `can_view_attendance`.

### Assignments and assessments
- Validate due dates, availability windows, file types, file sizes, and student authorization.
- Ensure a student can submit only for their own eligible assignment.
- Prevent unauthorized repeated submissions or define the resubmission policy.
- Grades are written only by authorized instructors/admins.
- Grade publication is a separate explicit state.
- All grade changes and assessment-result releases are auditable.

### Progress
- Define a documented calculation model. Do not invent percentages.
- Use real lesson completion, assignments, and assessment records.
- If a summary is cached/materialized, define invalidation/recalculation rules.
- Explain progress to students/guardians in understandable terms.

---

## 12. Payments and Billing

Payment integration is optional until the owner chooses a provider and supplies credentials, but the data model must not create false financial states.

- Keep pricing configurable by authorized admins.
- Clearly define currency and amount units.
- Create payment orders on the server.
- Verify payment status through trusted provider APIs/webhooks with signature verification.
- Make webhook handling idempotent.
- Validate amount, currency, order reference, and expected enrollment/customer association.
- Never trust query parameters or frontend success callbacks.
- Keep invoice downloads private and permission-scoped.
- Distinguish `pending`, `paid`, `failed`, `refunded`, and `cancelled` states as appropriate.
- Keep immutable provider references and audit financial corrections.
- Do not store card details.
- If no payment provider is configured, show a clearly labeled not-configured state rather than a fake checkout.

---

## 13. Notifications and Communication

Build a notification service abstraction:
- In-app notifications stored in the database.
- Email delivery through a configured provider.
- Optional SMS/WhatsApp/push integrations only when selected and configured.
- Delivery attempts, errors, and retry rules should be recorded without logging secrets.
- Notification preferences and consent must be respected.
- Avoid sending sensitive student data in email subject lines or insecure payloads.
- Do not claim an email was sent unless the provider confirms acceptance.
- Notify the correct recipients for enrollment, schedule changes, attendance updates, assignment deadlines, grade releases, payment updates, and guardian-link status changes.
- Parent notifications must honor the relationship's notification permission and the parent's preferences.

---

## 14. File Storage and Upload Security

- Use private storage buckets by default for student, instructor, assessment, invoice, and guardian-related documents.
- Validate file type, extension, size, and ownership on the server.
- Do not trust browser-supplied MIME type alone.
- Generate non-guessable storage paths; prevent users from overwriting another user's files.
- Store metadata and ownership in the database.
- Check authorization on upload, listing, download, and deletion.
- Use short-lived signed URLs where appropriate.
- Do not store secrets or sensitive personal details in filenames.
- Define retention and deletion behavior.
- Do not expose private files through public static assets.

---

## 15. API and Server Logic Standards

- Use clear, typed service/repository boundaries.
- Validate all input on the server with Zod or equivalent.
- Authenticate and authorize every protected operation.
- Do not trust role, owner ID, price, amount, relationship status, grade, attendance, or payment status supplied by the client.
- Use transactions for multi-step operations.
- Use idempotency keys or unique constraints for retryable financial and invitation operations.
- Return consistent error shapes and appropriate HTTP status codes.
- Do not return database stack traces or internal secrets to clients.
- Rate-limit sign-in, password reset, invitations, contact forms, and other abuse-prone endpoints.
- Add pagination and maximum page sizes.
- Keep secrets server-only; public environment variables must contain only genuinely public configuration.
- Avoid logging tokens, passwords, full sensitive request bodies, private file URLs, or unnecessary children's personal data.

---

## 16. Privacy, Safety, and Compliance Readiness

The platform may handle information about minors. Treat child and family information as sensitive.

- Collect only data necessary to operate the learning service.
- Make date of birth optional unless there is a documented need.
- Restrict student identity, contact details, progress, grades, attendance, and billing records.
- Define retention, correction, deletion, and account closure workflows.
- Record guardian consent where required by the academy's policy and applicable law.
- Review applicable Indian data protection requirements and any other jurisdiction relevant to users before launch. Do not claim compliance based only on this code specification.
- Legal documents and consent language require owner/legal review.
- Avoid public profiles for minors by default.
- No public exposure of student work, photos, names, or testimonials without appropriate permission.
- Add an incident response and backup/recovery note to the operations documentation.

---

## 17. Accessibility and Performance

### Accessibility
- Use semantic HTML and correct heading order.
- Full keyboard navigation and visible focus indicators.
- Label every input; associate error messages with fields.
- Accessible dialogs, menus, dropdowns, tables, and status announcements.
- Meaningful alt text; decorative images use empty alt text.
- Do not communicate status using color alone.
- Respect reduced motion.
- Target WCAG 2.2 AA where feasible and test important flows with keyboard and automated accessibility tools.

### Performance
- Optimize images and fonts.
- Lazy-load below-the-fold media.
- Avoid unnecessary client components.
- Use server components where suitable and keep client-side state limited.
- Paginate large lists and select only required database columns.
- Add indexes based on actual query patterns.
- Use safe caching for public pages; avoid cross-user caching of private data.
- Measure before introducing complex caching, queues, or microservices.
- Include basic performance checks on mobile.

---

## 18. Testing Requirements

Testing is mandatory, not optional.

### Unit tests
- Validation schemas
- Role/permission policy functions
- Course enrollment eligibility
- Progress calculation
- Attendance uniqueness and eligibility
- Invitation token validation
- Payment webhook signature and idempotency logic

### Integration tests
- Authenticated role boundaries
- Database constraints and RLS policies
- Guardian relationship activation/revocation
- Enrollment-to-course access
- Instructor assignment scope
- Attendance recording and correction
- Assignment submission ownership
- Grade release permissions
- Private storage access
- Payment webhook processing

### End-to-end critical journeys
1. Visitor browses public courses.
2. Student creates/verifies an account and signs in.
3. Admin creates a course and publishes it.
4. Admin creates a student and enrollment.
5. Admin invites an instructor and assigns a course/batch.
6. Instructor records attendance for an eligible student.
7. Student views their own attendance and progress.
8. Guardian signs in and sees only an explicitly linked child.
9. Guardian attempts to access an unrelated student's record and is denied.
10. Admin revokes a guardian relationship and subsequent requests are denied.
11. Student submits an assignment and cannot edit grades.
12. Unauthorized user attempts to access a private file and is denied.
13. Payment success is accepted only after trusted verification.
14. A user changes an ID in the URL/request and cannot cross access boundaries.
15. Switching accounts or children does not show stale cached data.

### Mandatory negative tests
- Unauthenticated access to protected routes is denied.
- Student cannot become admin by changing request data.
- Parent cannot access an unrelated student by changing URL or API parameters.
- Parent with attendance permission but no fee permission cannot view fees.
- Revoked/expired/used invitation cannot be reused.
- Two simultaneous attempts to consume one invitation cannot activate two unintended links.
- Instructor cannot access unassigned students.
- Student cannot submit for another student.
- Parent/student cannot alter grades or verified payment state.
- Private storage URLs and database APIs do not bypass authorization.
- Cross-account caching cannot leak private information.

### Release gate
Do not call the application production-ready unless:
- Type check passes.
- Lint passes.
- Production build passes.
- All database migrations apply to a clean test project.
- Critical tests pass.
- RLS is reviewed and tested with distinct users for each role.
- No known high-severity authorization issue remains.
- Required provider configuration is documented.
- Manual smoke tests pass on mobile and desktop.

---

## 19. Environment Variables

Create `.env.example` with names and safe placeholders only. Never commit real secrets.

Expected configuration may include:
```dotenv
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
EMAIL_PROVIDER_API_KEY=
EMAIL_FROM_ADDRESS=
PAYMENT_PROVIDER_SECRET_KEY=
PAYMENT_WEBHOOK_SECRET=
LIVE_CLASS_PROVIDER_CLIENT_ID=
LIVE_CLASS_PROVIDER_CLIENT_SECRET=
```

Rules:
- Only `NEXT_PUBLIC_` values are exposed to the browser. Use them only for public configuration.
- `SUPABASE_SERVICE_ROLE_KEY`, email secrets, payment secrets, webhook secrets, and live-class provider secrets must be server-only.
- Use the exact current variable names required by the chosen SDK version and document any differences.
- Do not require optional integration variables for local development unless the feature is actively enabled.
- Fail safely and show an admin-visible configuration warning when an optional integration is missing.
- Never print secret values in logs or diagnostics.

---

## 20. Implementation Phases and Acceptance Criteria

### Phase 0 — Repository and design setup
- Inspect repository and existing state.
- Write architecture, implementation plan, schema plan, security plan, test plan.
- Set up design tokens, shared layout, typography, responsive primitives.
- Configure lint/type check/test scripts.
**Pass when:** project installs and baseline checks/build work.

### Phase 1 — Public website
- Home, courses listing/detail, about, instructors, contact, FAQ, privacy, terms.
- Real database-backed published course/instructor content.
- Responsive navigation, forms, SEO metadata, loading/empty/error states.
**Pass when:** all public links work and no fake claims or dead CTAs exist.

### Phase 2 — Database and authentication
- Migrations, core schema, Supabase clients, auth flows, profile creation.
- Secure role resolution and protected route handling.
- RLS policies and role tests.
**Pass when:** unauthenticated access is denied and role escalation tests fail safely.

### Phase 3 — Admin foundations
- Student, guardian, instructor, course, enrollment management.
- Audit logs and permission-controlled mutations.
- Server-side validation and database constraints.
**Pass when:** changes persist, lists use real records, and unauthorized mutations are rejected.

### Phase 4 — Guardian matching
- Invitation creation, token hashing, expiry, intended-recipient binding, verification, activation, revocation.
- RLS and server authorization for every guardian-visible data type.
- Cross-family isolation and concurrency tests.
**Pass when:** all guardian–student negative tests pass. Do not release the Parent Portal before this gate passes.

### Phase 5 — Instructor and class operations
- Assignments, sessions, instructor scope, attendance, lessons, submissions, assessment results.
**Pass when:** assigned-scope access and record ownership tests pass.

### Phase 6 — Student and Parent portals
- Role-specific dashboards, schedules, lessons, progress, attendance, assignments, grades, notifications, invoices if enabled.
- Server-derived student selector and per-permission visibility.
**Pass when:** every panel displays only authorized backend data and the child-switching tests pass.

### Phase 7 — Integrations
- Email delivery, live-class provider, payment provider, private files, optional realtime.
- Add only integrations for which the owner has selected a provider and supplied credentials.
**Pass when:** provider callbacks/webhooks are verified and failure states are handled honestly.

### Phase 8 — Hardening and launch
- Accessibility review, responsive testing, security review, rate limits, logs, backups, migrations, deployment docs, production env configuration.
- Run all tests and smoke-test deployed flows.
**Pass when:** release gate in Section 18 is met and the owner receives a clear deployment checklist.

---

## 21. Required Documentation

Create and maintain:
- `README.md`: setup, install, local development, migrations, tests, build, deployment.
- `IMPLEMENTATION_PLAN.md`: task list with status and acceptance criteria.
- `ARCHITECTURE.md`: app boundaries, auth, data flow, integration boundaries.
- `DATABASE.md`: schema, relationships, constraints, indexes, migration procedure.
- `SECURITY.md`: role matrix, RLS policies, authorization rules, secrets, threat model, incident basics.
- `TEST_PLAN.md`: unit/integration/E2E coverage and how to run it.
- `.env.example`: documented variable names without real credentials.

Document first-admin provisioning, test-user setup, and safe development fixtures. Never place production credentials in documentation.

---

## 22. Definition of Done

A feature is done only when all applicable points are true:
- UI is responsive and accessible.
- Forms and controls perform their advertised action.
- Data comes from the real backend.
- Input is validated on the server.
- Authorization is checked on the server and by database policy where applicable.
- Loading, empty, success, and error states exist.
- Duplicate submissions and race conditions are considered.
- Sensitive actions are audited.
- Unit/integration/E2E tests are added or updated.
- Type check, lint, and build pass.
- Documentation reflects actual behavior.
- No mock data or fake API is used to disguise unfinished work.

Do not use “production-ready” as a visual label. It is a release decision supported by passing tests, reviewed authorization, correct configuration, and operational readiness.

---

## 23. Final Instructions to Antigravity

Build this as a cohesive product, not a collection of disconnected dashboard mockups.

1. Read this entire document before coding.
2. Inspect the repository and report the detected stack and baseline problems.
3. Create the required documentation and a phased implementation checklist.
4. Start with Phase 0 only, complete it, run checks, and then continue phase by phase.
5. Use actual Supabase migrations and enforce RLS. Never put the service-role key in browser code.
6. Implement guardian–student matching as an explicit, verified, auditable relationship. Never guess relationships based on matching personal details.
7. Do not fabricate real-looking course data, users, payments, testimonials, class links, or metrics. Use clearly labeled test fixtures only in isolated test environments.
8. Do not leave buttons, forms, filters, navigation links, or portal pages as visual-only elements.
9. If an external integration needs credentials, build a safe adapter and a truthful not-configured state; document the exact owner action needed.
10. After every phase, show changed files, commands run, test/build results, known issues, and next phase. Fix failures before continuing.
11. Before declaring completion, run the full release gate and report evidence. If something cannot be completed, state it explicitly and do not pretend it works.
12. Preserve existing useful work and avoid destructive commands without explaining the risk and obtaining approval.
13. Prefer secure, maintainable, well-typed code over shortcuts. Avoid giant files, blanket `any`, disabled linting, swallowed exceptions, and duplicated business logic.
14. Do not expose secrets or private student/guardian information in logs, screenshots, generated documentation, or public routes.
15. Do not deploy or run destructive production migrations without explicit approval from the owner.

**First response expected from Antigravity:** summarize the repository's current state, identify missing prerequisites, propose the exact first phase, and list commands/checks it will run. Then proceed with the implementation workflow above.
