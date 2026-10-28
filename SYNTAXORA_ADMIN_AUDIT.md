# SYNTAXORA ADMIN PANEL AUDIT & SYSTEM ARCHITECTURE EVALUATION

**Project:** Syntaxora — Online AI Education Academy  
**Document Version:** 1.0.0  
**Audit Date:** 2026-10-28  
**Scope:** Complete administrative interface, server actions, database queries, integrations, security boundaries, and UI/UX workflows.

---

## 1. Executive Summary & Audit Baseline

Syntaxora provides rigorous live cohort-based and asynchronous AI education across multiple age groups (young learners, teens, college students, and adults). The platform architecture utilizes:
- **Framework:** Next.js 16.4.2 (App Router) & React 19.3.0
- **Database & Auth:** Supabase PostgreSQL with Row Level Security (RLS) & `@supabase/ssr`
- **Validation:** Zod schemas for all client and server mutations
- **Styling & Components:** Tailwind CSS v4, Lucide React icons, accessible UI primitives
- **Testing:** Vitest 5.0.5 with 16 test suites (136 unit tests passing)

The existing Admin Panel contains foundational routes and domain logic, but suffers from severe operational gaps, hardcoded/mock fallback traps that violate core integrity rules (e.g., displaying fake numbers `0 || 2` or mock student lists when tables are empty), missing pages (Payments/Billing), mock attendance generation, incomplete search/filter UI in student rosters, lack of mobile navigation, and unapplied database migrations on the live database.

---

## 2. Feature-by-Feature Detailed Audit Matrix

### Feature 1: Admin Authentication & Access Guard
- **Route & Files:**
  - `src/app/admin/layout.tsx` (Line 43: `requireRole(["admin"])`)
  - `src/server/services/authService.ts` (`getCurrentUser()`, `requireRole()`)
  - `src/server/actions/auth.ts` (`signInAction()`, `signOutAction()`)
- **Current Status:** Partially Working
- **Evidence:**
  - `requireRole(["admin"])` runs server-side on initial SSR layout load.
  - Redirects unauthorized users to their respective role-based portal (`/student`, `/parent`, `/instructor`, or `/login`).
  - Unit tests in `tests/unit/auth_roles.test.ts` pass (6/6).
- **Data Source & Backend:** Supabase Auth (`supabase.auth.getUser()`) + `profiles` table.
- **Exact Problem:**
  1. `getCurrentUser()` relies on `syntaxora_demo_auth` cookie first. If this cookie is set without a real Supabase session, subsequent calls to `createClient()` (which relies on Supabase auth cookies) fail RLS checks against `auth.uid() = id`.
  2. In `20261021000001_core_schema.sql`, RLS policies on `profiles` use a subquery: `(SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'`. In Supabase, evaluating a subquery against `profiles` inside a policy on `profiles` can cause RLS recursion errors or failure when called with standard anon keys.
- **Required Fix:**
  - In administrative server actions and admin services, once `requireRole(["admin"])` validates that the caller is an authenticated administrator, use `createAdminClient()` (service-role key on trusted server) to execute privileged operations and prevent session/RLS recursion deadlocks.
- **Verification Procedure:** Test login as admin with real credentials, verify redirect to `/admin`, and ensure non-admin users attempting to load `/admin` are immediately redirected.
- **Dependencies & Risks:** Low risk. Essential for reliable admin operations.

---

### Feature 2: Admin Layout & Navigation Shell
- **Route & Files:**
  - `src/app/admin/layout.tsx`
  - `src/components/navigation/*`
- **Current Status:** Partially Working
- **Evidence:**
  - Fixed dark sidebar (`bg-[#142541]`) renders with 12 navigation links and sign-out button.
  - Renders properly on desktop screens (>= 768px).
- **Data Source & Backend:** Static route configuration + current user profile.
- **Exact Problem:**
  1. Responsive failure: The sidebar has `hidden md:flex`, and the header has no mobile hamburger toggle button or drawer. On mobile devices (< 768px), navigation is completely impossible.
  2. Missing navigation elements: No breadcrumb trail, no global search bar, no notifications drawer, no page title breadcrumb.
  3. No link to Payments & Invoices management.
- **Required Fix:**
  - Implement a mobile navigation drawer with hamburger button in header.
  - Add breadcrumbs showing current admin location.
  - Add `/admin/payments` link into sidebar navigation.
  - Add quick action search / notifications trigger in header.
- **Verification Procedure:** Test layout on viewports 375px (mobile), 768px (tablet), and 1440px (desktop).
- **Dependencies & Risks:** Low risk. Purely additive UI/UX improvement.

---

### Feature 3: Admin Overview Dashboard & Aggregate Metrics
- **Route & Files:**
  - `src/app/admin/page.tsx`
  - `src/server/services/adminService.ts` (`getAdminOverviewMetrics()`, `getAdminAuditLogs()`)
- **Current Status:** Broken
- **Evidence:**
  - In `adminService.ts`:
    ```typescript
    totalStudents: studentsCount || INITIAL_STUDENTS.length,
    activeEnrollments: enrollmentsCount || 2,
    publishedCourses: coursesCount || INITIAL_ACADEMY_COURSES.length,
    totalInstructors: instructorsCount || APPROVED_ACADEMY_INSTRUCTORS.length,
    ```
    When the database count is `0`, JavaScript evaluates `0 || 2` to `2`! This violates Non-Negotiable Rule 8: "Do not display fake statistics, fake enrollments, fake revenue, or fake notifications."
  - Only 6 cards are rendered. Missing metrics requested in Phase 3:
    - Active batches
    - Today's scheduled classes
    - Classes currently in progress
    - Upcoming classes
    - Unassigned eligible students
    - Pending payment verification / Outstanding fees
  - Missing dashboard sections: Today's schedule, Upcoming sessions, Batch capacity warnings, Unassigned students.
- **Data Source & Backend:** Supabase tables (`students`, `enrollments`, `courses`, `profiles`, `contact_enquiries`, `class_sessions`, `batches`, `student_applications`, `audit_logs`).
- **Exact Problem:** Falsely returns mock numbers when database counts are 0, and lacks required Phase 3 operational widgets.
- **Required Fix:**
  - Ensure metric calculations return authoritative numbers: `typeof count === "number" ? count : 0`.
  - Add metric calculations for active batches, today's classes, live now, upcoming classes, unassigned students, and pending payment verifications.
  - Implement interactive dashboard sections: Today's Class Schedule, Upcoming Sessions, Batch Capacity Warnings, and Students Awaiting Batch Assignment.
- **Verification Procedure:** Verify that when a table has 0 records, the dashboard accurately displays `0`, not `2` or `3`. Verify clicking widgets routes to the corresponding filtered admin page.
- **Dependencies & Risks:** Critical. Core dashboard accuracy.

---

### Feature 4: Student Admissions Applications Review & Decision Workflow
- **Route & Files:**
  - `src/app/admin/applications/page.tsx`
  - `src/components/dashboards/AdminApplicationsTable.tsx`
  - `src/components/forms/ApplicationReviewModal.tsx`
  - `src/server/services/applicationService.ts`
  - `src/server/services/provisioningService.ts`
  - `src/server/actions/admin.ts` (`reviewApplicationAction()`, `resendStudentSetupEmailAction()`)
- **Current Status:** Partially Working
- **Evidence:**
  - Table renders with status pills (All, Pending, Under Review, Needs Info, Approved, Rejected) and text search.
  - Duplicate detection is pre-calculated via `detectApplicationDuplicates()`.
  - Unit tests in `admin_applications.test.ts` pass (5/5).
- **Data Source & Backend:** `student_applications` table, `batches` table, `provisioningService`.
- **Exact Problem:**
  1. Migration `20261023000001_student_applications_and_linking.sql` was not executed on the remote database, causing `PGRST205` error when querying Supabase directly.
  2. When approving an application, if email dispatch fails (e.g. Resend unconfigured or sandbox recipient restriction), the UI must clearly display the credential details (Student Code, Temporary Password) with safe one-click copy and honest notification of email delivery status.
  3. No explicit "Reject with Reason" shortcut or "Request Additional Information" dialog outside the large modal.
- **Required Fix:**
  - Ensure service handles database fallback and reports migration status truthfully.
  - Enhance credential display with clear visual confirmation and copy-to-clipboard functionality.
  - Provide full application details view (education background, guardian contacts, statement of interest, review history).
- **Verification Procedure:** Submit application via `/apply`, verify it appears in `/admin/applications`, review and approve with cohort allocation, verify student code and temporary password generation, test duplicate prevention.
- **Dependencies & Risks:** High importance. Admissions pipeline.

---

### Feature 5: Student Directory & Roster Management
- **Route & Files:**
  - `src/app/admin/students/page.tsx`
  - `src/components/forms/CreateStudentForm.tsx`
  - `src/server/services/adminService.ts` (`getAdminStudents()`)
  - `src/server/actions/admin.ts` (`createStudentAction()`)
- **Current Status:** Broken / Incomplete
- **Evidence:**
  - `src/app/admin/students/page.tsx` accepts `searchParams.q` but has NO search input bar rendered on the page!
  - `adminService.ts` lines 170: `if (error || !data || data.length === 0) return INITIAL_STUDENTS;` -> If search returns 0 results or query is empty, it returns fake records (`Liam O'Connor`, `Maya Patel`) instead of an honest empty state or the real 5 students in the database!
  - Roster table displays only Student Code, Name, Email, Status, Emergency Contact, and Registered Date.
  - Missing student actions: No detail drawer/modal, no status toggle (Active/Paused/Archived), no direct "Assign to Batch" button, no credential reset action.
- **Data Source & Backend:** `students` table, `profiles` table, `enrollments` table.
- **Exact Problem:** Lacks search UI, displays fake students on empty queries, and lacks student detail & assignment management actions.
- **Required Fix:**
  - Add search input form and status filter controls to `/admin/students`.
  - Fix `getAdminStudents()` to return real database records using authoritative server client, and never return mock records when connected to the database.
  - Build interactive Student Detail modal / drawer showing:
    - Profile information & Emergency Contact
    - Stable Unique Student Code
    - Linked Guardian(s) with authorization status
    - Enrolled Courses & Cohort Batches
    - Direct action to Assign/Transfer Batch (Phase 7)
    - Action to toggle account status (Active, Paused, Archived)
    - Action to reset password / resend setup invitation
- **Verification Procedure:** Query real students from database, verify search filters work on real data, open student detail drawer, verify batch assignment and status update.
- **Dependencies & Risks:** Critical. Canonical student record management.

---

### Feature 6: Course Curriculum & Syllabus Management
- **Route & Files:**
  - `src/app/admin/courses/page.tsx`
  - `src/app/admin/courses/[id]/page.tsx`
  - `src/components/forms/CreateCourseForm.tsx`
  - `src/components/forms/CoursePublishButton.tsx`
  - `src/components/dashboards/admin/AdminCourseModulesManager.tsx`
  - `src/server/services/courseService.ts`
  - `src/server/actions/admin.ts` (`createCourseAction()`, `updateCourseDetailsAction()`, `toggleCoursePublishAction()`, `addCourseModuleAction()`, etc.)
- **Current Status:** Working
- **Evidence:**
  - `getAllCourses()`, `createCourse()`, `toggleCoursePublishStatus()` function properly with database and in-memory resilience.
  - Course creation enforces slug formatting, pricing in INR, audience group, delivery mode.
  - Topic/Module & Lesson management allows adding modules, sorting topics, and adding syllabus lessons.
  - Unit tests in `tests/unit/courses.test.ts` pass (8/8).
- **Data Source & Backend:** `courses`, `course_modules`, `lessons` tables.
- **Exact Problem:**
  - Missing Course Search and Filter (by Audience Track, Status: Draft/Published/Archived) on the `/admin/courses` index page.
  - Course edit details modal is missing on the detail page (only module manager exists).
- **Required Fix:**
  - Add search and filter controls to `/admin/courses`.
  - Add Edit Course Details dialog (title, summary, description, price, level, audience).
  - Add Archive Course action with confirmation.
- **Verification Procedure:** Create course, verify draft status, publish course, verify appearance on public catalog, edit course details, add module and lessons.
- **Dependencies & Risks:** Low risk. Solid existing base.

---

### Feature 7: Cohort Batch Management & Timetables
- **Route & Files:**
  - `src/app/admin/batches/page.tsx`
  - `src/app/admin/batches/[id]/page.tsx`
  - `src/components/forms/CreateBatchModal.tsx`
  - `src/components/forms/BatchStatusSelector.tsx`
  - `src/components/forms/GenerateSessionsButton.tsx`
  - `src/server/services/batchService.ts`
  - `src/server/actions/batch.ts` (`createBatchAction()`, `updateBatchStatusAction()`, `generateBatchSessionsAction()`)
- **Current Status:** Partially Working
- **Evidence:**
  - Batch creation enforces positive capacity, dates check (`end_at > start_at`), timezone default `Asia/Kolkata`.
  - Filter tabs by status (all, active, upcoming, paused, completed, cancelled) work properly.
  - Batch detail page renders enrolled roster, recurring schedule templates, upcoming sessions.
  - Unit tests in `lms_batches_and_live_classes_23_scenarios.test.ts` pass.
- **Data Source & Backend:** `batches`, `batch_schedule_templates`, `enrollments`, `class_sessions`.
- **Exact Problem:**
  - Remote database lacks `batches` table until migration `20261023000002` is applied.
  - Batch list page lacks quick search by batch code or batch name.
  - Schedule conflict warnings should be visually highlighted in the batch list.
- **Required Fix:**
  - Ensure service handles database fallback and graceful error reporting.
  - Add search input on batches list.
  - Display capacity percentage indicator and capacity warning badge on batches approaching 100% capacity.
- **Verification Procedure:** Create batch, generate sessions, assign student, check capacity limits and conflict detection.
- **Dependencies & Risks:** Medium risk. Central to scheduling.

---

### Feature 8: Enrollment & Late Student Assignment Workflow (Phase 7)
- **Route & Files:**
  - `src/app/admin/enrollments/page.tsx`
  - `src/components/forms/AssignStudentModal.tsx`
  - `src/components/forms/TransferBatchModal.tsx`
  - `src/server/services/enrollmentService.ts`
  - `src/server/actions/batch.ts` (`assignStudentAction()`, `transferStudentBatchAction()`)
- **Current Status:** Working
- **Evidence:**
  - Displays "Students Awaiting Batch Assignment" alert box when students are enrolled without a batch.
  - `assignStudentToBatch()` verifies:
    1. Student exists
    2. Course exists
    3. Student is not already actively enrolled in the same course/batch
    4. Batch has remaining capacity (`enrolled_count < capacity`)
    5. Creates authoritative enrollment record and logs audit event
  - `transferStudentBatch()` handles cohort transfer, preserves historical batch ID in `previous_batch_id`, and requires a transfer reason.
- **Data Source & Backend:** `enrollments`, `batches`, `students`, `courses`.
- **Exact Problem:**
  - Enrollments table lacks search and filter by course or batch.
  - Missing CSV export of active enrollment roster.
- **Required Fix:**
  - Add search and filter by Course and Batch on `/admin/enrollments`.
  - Ensure capacity checks and atomic seat validation work reliably across environments.
- **Verification Procedure:** Enroll student in batch, verify seat count increments, test adding 6th student to a full 5-student batch (must reject with capacity error), transfer student to alternate batch.
- **Dependencies & Risks:** High importance. Non-negotiable academy rule.

---

### Feature 9: Faculty & Instructor Management
- **Route & Files:**
  - `src/app/admin/instructors/page.tsx`
  - `src/components/dashboards/admin/AdminInstructorsManager.tsx`
  - `src/server/services/instructorService.ts`
  - `src/server/actions/admin.ts` (`createInstructorAction()`, `updateInstructorAction()`, `deleteInstructorAction()`)
  - `src/app/api/upload/cloudinary/route.ts`
- **Current Status:** Working
- **Evidence:**
  - `AdminInstructorsManager` provides full Add/Edit/Delete modal workflows, specialty tags, biography, and Cloudinary upload with local fallback.
  - Search filter by instructor name, email, title, and specialties functions in client.
  - Unit tests in `tests/unit/instructor.test.ts` pass (7/7).
- **Data Source & Backend:** `profiles` (role='instructor'), Cloudinary API / local uploads.
- **Exact Problem:**
  - Instructor details currently do not display assigned active courses, batches, or session workload.
- **Required Fix:**
  - Enhance instructor view to display assigned courses and active cohort batches.
  - Add conflict indicator if instructor has overlapping class times.
- **Verification Procedure:** Register new instructor with photo upload, verify profile appears in instructor list and public directory, assign instructor to course and batch.
- **Dependencies & Risks:** Low risk. Stable component.

---

### Feature 10: Live Class Scheduling & Meeting Provider Integration
- **Route & Files:**
  - `src/app/admin/live-classes/page.tsx`
  - `src/components/forms/StartLiveClassButton.tsx`
  - `src/components/forms/RescheduleSessionModal.tsx`
  - `src/server/services/scheduleService.ts`
  - `src/server/services/liveClassService.ts`
  - `src/server/integrations/meeting/meetingAdapter.ts`
  - `src/server/actions/batch.ts` (`startLiveClassAction()`, `completeLiveClassAction()`, `rescheduleSessionAction()`)
- **Current Status:** Working
- **Evidence:**
  - Renders 4 operational alert cards (Live Now, Starting Soon <=15m, Overdue Start >0m, Today's Lectures).
  - Shows warning banner when Zoom/Google Meet API keys are not in environment, explaining fallback to internal WebRTC rooms per Section 11 of specification.
  - `StartLiveClassButton` launches session and transitions status to `in_progress`.
  - `RescheduleSessionModal` updates session timing and logs audit event.
  - Unit tests in `tests/unit/lms_batches_and_live_classes_23_scenarios.test.ts` pass.
- **Data Source & Backend:** `class_sessions`, `batches`, `courses`, `profiles`.
- **Exact Problem:**
  - Session filter tabs (all, scheduled, in_progress, completed, cancelled) work, but table lacks search by session title or course title.
- **Required Fix:**
  - Add search bar and batch/course filter to `/admin/live-classes`.
  - Ensure student join authorization checks (`authorizeStudentJoin()`) are clearly verified.
- **Verification Procedure:** Generate sessions, click Start Class, verify meeting room URL generated (truthful WebRTC fallback), reschedule a session with mandatory reason.
- **Dependencies & Risks:** Medium risk. Live class continuity.

---

### Feature 11: Parent & Guardian Relationship Authorization Boundary
- **Route & Files:**
  - `src/app/admin/guardians/page.tsx`
  - `src/components/forms/CreateDirectRelationshipModal.tsx`
  - `src/components/forms/CreateGuardianInvitationModal.tsx`
  - `src/components/dashboards/PendingGuardianRequestsTable.tsx`
  - `src/components/forms/RevokeRelationshipModal.tsx`
  - `src/server/services/guardianService.ts`
  - `src/server/actions/guardian.ts`
- **Current Status:** Working
- **Evidence:**
  - Complete verification flow:
    1. Parent requests link via student code
    2. Relationship is placed in `pending` status
    3. Admin verifies and approves/rejects with explicit permission flags
    4. Direct link and single-use invitation token redemption work
    5. Revocation immediately terminates access
  - Unit tests in `tests/unit/guardian.test.ts` pass (11/11).
- **Data Source & Backend:** `guardian_student_relationships`, `guardian_invitations`, `students`, `profiles`.
- **Exact Problem:**
  - When querying Supabase without active records, `getAdminRelationships()` previously returned mock in-memory fixtures.
  - Table lacks search by guardian name or email.
- **Required Fix:**
  - Ensure zero real relationships render honest empty state.
  - Add search filter on guardian list.
- **Verification Procedure:** Submit link request via student code, review in `/admin/guardians`, approve with custom permissions, verify child access, revoke and verify access removal.
- **Dependencies & Risks:** High importance. Child data privacy & COPPA compliance.

---

### Feature 12: Attendance Records & Mandatory Audit Correction Workflows
- **Route & Files:**
  - `src/app/admin/attendance/page.tsx`
  - `src/components/forms/AttendanceCorrectionModal.tsx`
  - `src/server/actions/admin.ts` (`correctAttendanceAction()`)
- **Current Status:** Broken / Fake Records
- **Evidence:**
  - Lines 15-23 of `src/app/admin/attendance/page.tsx` generate fake sample attendance records:
    ```typescript
    const sampleAttendance = students.map((student, idx) => ({
      id: `att-${student.id.substring(0, 8)}`,
      session_title: idx === 0 ? "Computer Vision Edge Lab: OpenCV Streams" : "Pattern Recognition Logic",
      session_date: "2026-10-21T10:00:00Z",
      status: idx === 0 ? "present" : "late",
      correction_reason: idx === 1 ? "Transit delay verified by guardian" : null,
    }));
    ```
  - And line 76 hardcodes `attendanceId="a1000000-0000-0000-0000-000000000001"`.
  - Violates Rule 7: "Do not introduce mock, dummy, or hardcoded production records."
  - Violates Rule 8: "Do not display fake statistics, fake enrollments, fake revenue, or fake notifications."
- **Data Source & Backend:** `attendance_records` table, `class_sessions` table, `students` table.
- **Exact Problem:** Renders hardcoded mock session attendance instead of querying authoritative records from PostgreSQL `attendance_records` table.
- **Required Fix:**
  - Create `getAdminAttendanceRecords()` service in `adminService.ts` querying `attendance_records` joined with `class_sessions`, `students`, and `profiles`.
  - Replace mock mapping with real database records.
  - Provide filter by Class Session, Date, and Attendance Status (present, absent, late, excused).
  - Connect `AttendanceCorrectionModal` to the actual record ID and verify audit logging.
- **Verification Procedure:** Query attendance records from database, execute correction with reason, verify audit trail in `audit_logs` table.
- **Dependencies & Risks:** Critical. Core academic compliance.

---

### Feature 13: Payments & Financial Records Management (Phase 12)
- **Route & Files:**
  - Target route: `src/app/admin/payments/page.tsx`
  - `src/server/integrations/payments/paymentAdapter.ts`
  - `DATABASE.md` (Sections 3.11: `payments`, `payment_orders`, `invoices`)
- **Current Status:** Missing
- **Evidence:**
  - The route `src/app/admin/payments` DOES NOT EXIST in the codebase.
  - Admin layout has no link to payments or billing records.
  - Payment models (`payments`, `payment_orders`, `invoices`) exist in the database schema and `paymentAdapter.ts` handles Stripe/Razorpay logic and webhook verification.
- **Data Source & Backend:** `payments`, `payment_orders`, `invoices` tables.
- **Exact Problem:** Administrators cannot view payment history, inspect invoices, verify offline/manual payments, or check payment gateway status.
- **Required Fix:**
  - Create `src/app/admin/payments/page.tsx`.
  - Add "Payments & Invoices" link to admin sidebar navigation.
  - Implement financial overview cards (Total Verified Inflow, Pending Orders, Invoices Generated, Gateway Status).
  - If Stripe/Razorpay keys are not configured, display clear, honest banner: "Payment gateway credentials (STRIPE_SECRET_KEY / RAZORPAY_KEY_SECRET) are unconfigured. Displaying manual academy reconciliation records."
  - Implement table of payment transactions, payment orders, and invoices with status badges, date filters, and manual payment verification action.
- **Verification Procedure:** Access `/admin/payments`, verify gateway status banner, verify real database transaction records, test filtering by status.
- **Dependencies & Risks:** High importance. Complete academy management.

---

### Feature 14: Admissions Enquiries Inbox
- **Route & Files:**
  - `src/app/admin/enquiries/page.tsx`
  - `src/server/services/adminService.ts` (`getAdminEnquiries()`)
  - `src/server/actions/contact.ts` (`submitContactEnquiry()`)
- **Current Status:** Working
- **Evidence:**
  - Queries `contact_enquiries` table ordered by `created_at DESC`.
  - Shows date, name, email mailto link, phone, subject, message preview, and status badge (unread/read).
  - Unit tests in `tests/unit/validation.test.ts` pass (8/8).
- **Data Source & Backend:** `contact_enquiries` table.
- **Exact Problem:**
  - Lacks search and status filter (Unread vs All).
  - Lacks action to mark enquiry as read/archived.
- **Required Fix:**
  - Add search bar and status filter to `/admin/enquiries`.
  - Add server action to toggle enquiry status (unread -> read/resolved).
- **Verification Procedure:** Submit contact enquiry on public `/contact` page, verify it appears in admin enquiries inbox, mark as read.
- **Dependencies & Risks:** Low risk. Communications queue.

---

### Feature 15: Immutable Audit Logs & Compliance Trail
- **Route & Files:**
  - `src/app/admin/audit-logs/page.tsx`
  - `src/server/services/adminService.ts` (`getAdminAuditLogs()`)
  - `src/server/actions/admin.ts` (`logAuditEvent()`)
- **Current Status:** Working
- **Evidence:**
  - Queries `audit_logs` table joined with actor profile email.
  - Displays Timestamp, Actor Email, Action, Entity Type, Entity ID, and JSON Details.
  - Administrative mutations (student creation, course changes, attendance corrections, admissions reviews) automatically log to `audit_logs`.
- **Data Source & Backend:** `audit_logs` table.
- **Exact Problem:**
  - Lacks filter by Entity Type (`STUDENT`, `COURSE`, `ATTENDANCE`, `STUDENT_APPLICATION`, etc.) and date range.
- **Required Fix:**
  - Add entity type filter pills and search by actor email or entity ID.
- **Verification Procedure:** Perform an admin action (e.g. course edit), navigate to `/admin/audit-logs`, verify event logged with actor email and JSON payload.
- **Dependencies & Risks:** Low risk. Compliance trail.

---

## 3. High-Risk Dependencies & Inconsistencies Discovered

1. **Unapplied Remote Database Migrations:**
   - The Supabase database contains tables from `20261021000001_core_schema.sql` (`profiles`, `students`, `courses`, `enrollments`, `class_sessions`, `attendance_records`, `guardian_student_relationships`, `contact_enquiries`, `audit_logs`, `payments`, `payment_orders`, `invoices`).
   - However, `20261023000001` (`student_applications`) and `20261023000002` (`batches`, `batch_schedule_templates`) are not present in the remote PostgREST schema cache (code `PGRST205`).
   - **Remediation:** Application code must maintain robust dual-resilience: it must attempt database queries via `createAdminClient()`, catch `PGRST205` / connection errors gracefully without crashing the UI, and accurately report database status to the administrator.

2. **Zero-Count Fallback Traps (Rule 7 & 8 Violations):**
   - In multiple services, code previously evaluated `count || FALLBACK_ARRAY.length`.
   - When a table has 0 records, `0 || 2` evaluated to `2`, displaying fake counts.
   - **Remediation:** All metrics and listings must strictly distinguish between `0` (valid zero count) and `null`/unconfigured.

3. **Hardcoded Mock Attendance in `admin/attendance/page.tsx`:**
   - Page previously generated dummy attendance records on the fly.
   - **Remediation:** Implement real database queries against `attendance_records` and display honest empty states when no sessions have been finalized.

4. **Missing Payments Management Route:**
   - Phase 12 of the specification requires administrative financial visibility.
   - **Remediation:** Create `src/app/admin/payments/page.tsx` with gateway configuration transparency and real transaction records.

5. **Mobile Navigation Inaccessibility:**
   - Sidebar is completely hidden on mobile viewports with no toggle.
   - **Remediation:** Implement responsive mobile drawer and hamburger toggle in header.

---

## 4. Prioritized Repair & Implementation Plan

| Step | Scope | Actions |
|---|---|---|
| **Step 1** | **Audit Report & Preservation** | Complete `SYNTAXORA_ADMIN_AUDIT.md`. Establish strict preservation of public site and student/parent/instructor portals. |
| **Step 2** | **Admin Navigation & Shell UI** | Add responsive mobile drawer, breadcrumbs, search shortcut, and `/admin/payments` link. |
| **Step 3** | **Dashboard Metrics & Real Queries** | Eliminate `0 \|\| 2` fallback traps in `adminService.ts`. Add all Phase 3 metrics and interactive dashboard widgets. |
| **Step 4** | **Student Roster Overhaul** | Add search/filter controls, student detail modal with linked guardians, batch assignment action, and status controls. |
| **Step 5** | **Real Attendance System** | Remove fake attendance mock. Connect `/admin/attendance` to real `attendance_records` database table with audited corrections. |
| **Step 6** | **Payments Management Implementation** | Create `/admin/payments/page.tsx` with financial overview, gateway status notice, transaction table, and invoice inspector. |
| **Step 7** | **Admissions & Enquiries Polishing** | Add search, filters, full applicant review drawer, and enquiry resolution action. |
| **Step 8** | **Course, Batch & Enrollment Usability** | Add search, filters, capacity warnings, and late student assignment workflow polish. |
| **Step 9** | **Verification & Test Suite Run** | Run typecheck, unit tests, verify zero regressions across student, parent, and instructor portals. |

---

*This concludes Phase 1 of the Syntaxora Admin Panel Master Implementation Plan. Implementation begins immediately.*

