# SYNTAXORA STUDENT PANEL AUDIT & SYSTEM REPAIR SPECIFICATION

**System**: Syntaxora Online AI Education Academy  
**Target Subsystem**: Student Learning Management Portal (`/student`)  
**Audit Date**: October 2026  
**Auditor**: Senior Full-Stack LMS & Security Architect  
**Status**: Audit Complete — Implementation & Repair Plan Initialized  

---

## 1. Executive Summary & Audit Scope

Syntaxora is an online AI education academy offering live instructor-led classes and structured recorded courses for children, teenagers, college students, and adults. The platform operates on a strict **admission-first model**: public users cannot self-register as active students; student accounts are provisioned exclusively via approved admissions applications and administrative onboarding.

This audit evaluates the entire Student Portal against production readiness, data isolation, multi-role LMS boundaries (Admin, Instructor, Student, Parent/Guardian), and security requirements.

### Key Audit Findings:
1. **Critical Progress Tracking & Submission Validation Bug**:  
   `markLessonCompleteSchema` and `submitAssignmentSchema` strictly enforce RFC 4122 `z.string().uuid()`. However, the repository's seeded curriculum and assignments use prefixed IDs (`l1000000-0000-0000-0000-000000000001`, `asn-1000000-0000-0000-0000-000000000001`). As a result, marking lessons complete and submitting assignments consistently fail schema validation with `"Invalid lesson ID"` and `"Invalid assignment ID"`.
2. **Fabricated Fallback Metrics (Violation of Zero-Mock Principle)**:  
   Multiple pages display hardcoded percentages and counts when real student data is absent or 0:
   - `/student`: hardcodes `averageGrade = 94%`, `completedLessons.length || 2`, `totalCourseLessons || 8`, and hardcoded `APPROVED_ACADEMY_INSTRUCTORS[0]`.
   - `/student/courses`: hardcodes `completedInThisCourse || 2`, `totalLessons || 8`, and `mod.lessons?.length || 2`.
   - `/student/grades`: hardcodes `averageGrade = 95%` with "Letter Standing: A+ (Outstanding)" when zero evaluations have been released.
   - `studentService.getStudentCourses()` returns `[INITIAL_ACADEMY_COURSES[0]]` when a student has zero active enrollments.
3. **Missing Sub-Routes for Core LMS Capabilities**:  
   - Course detail and lesson player route (`/student/courses/[id]`) is absent.
   - Student profile and guardian linking overview (`/student/profile`) is absent.
   - Student notifications center (`/student/notifications`) is absent.
   - Student billing, tuition fee invoices, and receipts (`/student/billing`) is absent.
   - Student downloadable course resources and datasets (`/student/resources`) is absent.
   - Student support and ticket/inquiry desk (`/student/support`) is absent.
4. **Data Isolation & IDOR Protection**:  
   Live class join (`authorizeStudentJoin`) correctly enforces server-side student-batch enrollment verification. However, courses and lesson views require strict route-level guards ensuring a student cannot access course content or private assets without an active enrollment.

---

## 2. Feature-by-Feature Audit Matrix

| Feature / Route | Status | Relevant Files | Actual Data Source | Identified Problem | Required Repair / Implementation | Dependencies | Verification Steps |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student Shell & Navigation**<br>`/student/layout.tsx` | Partially Working | `src/app/student/layout.tsx`<br>`src/components/navigation/StudentSidebarNav.tsx` | Supabase `profiles`, `students`, `enrollments`, `class_sessions` | Sidebar missing navigation links for Profile, Invoices/Billing, Resources, and Notifications. No responsive mobile drawer. | Add links with active badge counts; enhance top bar with notification indicator and quick profile access. | `authService`, `studentService` | Verify all links render, active path is highlighted, and badges match real counts. |
| **Student Dashboard**<br>`/student` | Partially Working | `src/app/student/page.tsx` | Supabase `students`, `courses`, `class_sessions`, `submissions`, `attendance_records` | Fallback values fabricate 94% GPA, 2 completed lessons, and hardcoded faculty. No empty state for students awaiting batch/enrollment. | Compute 100% real metrics from database records. If 0 records exist, render truthful empty/not-started states without mock numbers. | `studentService`, `liveClassService` | Test with a student with 0 records -> verify no numbers are fabricated. Test with Liam -> verify exact metrics match records. |
| **Enrolled Tracks Listing**<br>`/student/courses` | Partially Working | `src/app/student/courses/page.tsx` | Supabase `enrollments`, `courses`, `learning_progress` | Falls back to showing course 0 when unenrolled. Fabricates 2 completed lessons. No link to dedicated course detail page. | Show only genuinely enrolled courses; render empty state with link to admissions catalogue if none; link to `/student/courses/[id]`. | `studentService`, `courseService` | Verify unenrolled student sees empty state. Verify enrolled student sees only their courses and accurate progress. |
| **Course Details & Lesson Player**<br>`/student/courses/[id]` | Missing | `src/app/student/courses/[id]/page.tsx` (new) | Supabase `courses`, `course_modules`, `lessons`, `learning_progress`, `enrollments` | Route does not exist. Students cannot focus on a single course, view video/text lessons, or navigate prev/next lessons. | Create `/student/courses/[id]` with enrollment verification, structured module outline, lesson reader/player, resources, and progress tracking. | `courseService`, `studentService`, `authService` | Attempt access without enrollment -> 403 Access Denied. Access with enrollment -> renders curriculum, lessons, and allows completion. |
| **Live Classes & Timetable**<br>`/student/classes` | Working | `src/app/student/classes/page.tsx`<br>`src/components/dashboards/StudentJoinButton.tsx` | Supabase `class_sessions`, `batches`, `enrollments` | Join button links work; but if session has no `meeting_url` and provider is unconfigured, fallback string could be returned. | Ensure `authorizeStudentJoin` returns truthful error if meeting provider/link is not ready; display clear timezones and batch badges. | `liveClassService`, `scheduleService` | Test joining before 15m window -> button disabled/locked. Test within window -> authorizes. Test cancelled session -> rejected. |
| **Personal Attendance Log**<br>`/student/attendance` | Working | `src/app/student/attendance/page.tsx`<br>`src/components/forms/StudentLeaveRequestModal.tsx` | Supabase `attendance_records`, `class_sessions` | Attendance rate displays 100% when 0 records exist. | Compute rate strictly when records > 0, otherwise show "No recorded sessions yet" state. Preserve leave request modal. | `studentService`, `adminService` | Test with 0 attendance records -> shows truthful empty state. Test with present/late records -> displays verified percentage. |
| **Assignments & Lab Deliverables**<br>`/student/assignments` | Partially Working | `src/app/student/assignments/page.tsx`<br>`src/components/forms/SubmitAssignmentModal.tsx`<br>`src/lib/validation/student.ts` | Supabase `assignments`, `submissions`, `courses` | Validation schema `z.string().uuid()` rejects in-memory/custom IDs (`asn-10...`), preventing submissions in dev/staging. | Update validation to accept UUID or canonical alphanumeric IDs. Support text solution and repository/attachment URL. | `studentService`, `validation/student` | Submit assignment -> verify submission updates status to "Submitted (In Review)" and persists timestamp and content. |
| **Released Grades & Feedback**<br>`/student/grades` | Partially Working | `src/app/student/grades/page.tsx`<br>`src/components/dashboards/PrintTranscriptButton.tsx` | Supabase `submissions`, `assignments` | If 0 grades are published, displays fallback 95% average with "A+ Outstanding". | Remove fabricated 95% default; show "No Evaluations Released" when no published grades exist. Only show audited scores. | `studentService` | Check student with no grades -> displays empty transcript state with 0 evaluations. Check student with published grades -> displays verified GPA. |
| **Learning Progress & Lesson Completion** | Broken | `src/components/dashboards/LessonCompleteButton.tsx`<br>`src/lib/validation/student.ts`<br>`src/server/services/studentService.ts` | Supabase `learning_progress` | `markLessonCompleteSchema` rejects non-hex UUIDs like `l1000000...`, so button click fails silently or errors. | Fix schema validation to accept canonical lesson IDs; persist idempotent completions; update revalidation paths. | `studentService` | Click "Mark Done" -> button toggles to "Completed", persists to DB/store, and updates progress bar across dashboard and courses. |
| **Student Profile & Student Code**<br>`/student/profile` | Missing | `src/app/student/profile/page.tsx` (new) | Supabase `students`, `profiles`, `guardian_student_relationships` | No dedicated profile page to inspect student code, batch cohort, linked guardians, and account details. | Create `/student/profile` displaying canonical student code, copy tool, linked guardian status, and enrolled cohorts. | `studentService`, `guardianService` | Navigate to `/student/profile` -> verify student identity, read-only student code, linked guardians, and cohort information. |
| **Notifications & Announcements**<br>`/student/notifications` | Missing | `src/app/student/notifications/page.tsx` (new)<br>`src/server/services/studentService.ts` | Supabase `notifications` | No student notification feed or mark-as-read action. | Implement notification fetching scoped strictly to `recipient_profile_id`, with unread badges, mark-as-read server action, and UI list. | `studentService`, `authService` | Send notification to student -> verify student sees it, unread count increments, clicking marks as read, other students cannot see it. |
| **Tuition Fees & Invoices**<br>`/student/billing` | Missing | `src/app/student/billing/page.tsx` (new) | Supabase `invoices`, `payment_orders`, `payments`, `enrollments` | Students have no way to view their course tuition invoices, payment receipts, or fee payment status. | Implement `/student/billing` displaying student's enrolled course fees, payment statuses, and downloadable invoice views. | `paymentAdapter`, `studentService` | Verify student sees only their own tuition records and verified payment status. |
| **Course Resources & Downloads**<br>`/student/resources` | Missing | `src/app/student/resources/page.tsx` (new) | Supabase `courses`, `enrollments` | No centralized repository for course PDFs, sample code, and lab datasets. | Implement `/student/resources` listing downloadable assets authorized for the student's enrolled courses. | `courseService`, `studentService` | Verify only resources from enrolled courses are displayed with secure download links. |
| **Student Support & Help Desk**<br>`/student/support` | Missing | `src/app/student/support/page.tsx` (new) | Supabase `contact_enquiries`, `profiles` | Students cannot submit academic/technical queries directly from the portal. | Create `/student/support` with FAQ accordion and query submission form linked to the authenticated student profile. | `contact_enquiries`, `adminService` | Submit support query -> verify it links to student email and shows confirmation without leaking other tickets. |

---

## 3. Discovered Critical Bugs & Vulnerabilities

### Bug 1: Zod ID Validation Incompatibility
- **Location**: `src/lib/validation/student.ts`
- **Impact**: Breaking functionality on `markLessonCompleteAction` and `submitAssignmentAction`.
- **Cause**: Both `submitAssignmentSchema` and `markLessonCompleteSchema` use `z.string().uuid()`. The project seed data uses IDs like `l1000000-0000-0000-0000-000000000001` and `asn-1000000-0000-0000-0000-000000000001`. Characters `l`, `s`, `n` are outside hex `[0-9a-f]`, causing Zod parse failures.
- **Remedy**: Update regex validator to accept both standard UUIDs and canonical entity ID tokens formatted as 32-36 char alphanumeric-hyphenated strings, while rejecting arbitrary strings like `"not-a-uuid"`.

### Bug 2: Mock Metric Fallbacks Violating Real-Data Requirement
- **Location**: `src/app/student/page.tsx`, `src/app/student/grades/page.tsx`, `src/app/student/courses/page.tsx`
- **Impact**: A newly enrolled student with no submissions sees an artificial 94% GPA and 2 completed lessons. A student with 0 grades sees a 95% A+ average.
- **Remedy**: Derive every metric dynamically:
  - If `attendance.length === 0`: render `"No sessions recorded yet"`, `attendanceRate = null`.
  - If `grades.length === 0`: render `"No evaluations published"`, `averageGrade = null`.
  - If `completedLessons.length === 0`: render `0%` progress with prompt to begin Module 1.

### Bug 3: Course Fallback Leaking Catalog Data to Unenrolled Students
- **Location**: `src/server/services/studentService.ts` (`getStudentCourses`)
- **Impact**: If a student had no active enrollments, the service returned `[INITIAL_ACADEMY_COURSES[0]]`, displaying a full curriculum they never registered for.
- **Remedy**: Return empty array `[]` when no active enrollments exist. Render an appropriate empty state prompting the student to contact admissions or browse public tracks.

### Bug 4: ESLint React Hooks and Typing Violations
- **Location**:
  - `src/server/actions/auth.ts`: line 108 `any[]` type.
  - `src/components/forms/ParentPaymentModal.tsx`: calling `setState` inside `useEffect` on mount.
  - `src/components/forms/StudentApplicationForm.tsx`: calling `setState` inside `useEffect` synchronously.
- **Remedy**: Correct type signatures and replace redundant `setMounted` effects or synchronize state safely according to React 19 standards.

---

## 4. Architectural Implementation & Repair Plan

### Phase A: Core Service & Validation Repair
1. Fix `src/lib/validation/student.ts` so all valid entity IDs pass validation while rejecting invalid strings.
2. Fix `src/server/services/studentService.ts`:
   - Eliminate all mock fallbacks in `getStudentCourses()`.
   - Add `getStudentNotifications()` and `markNotificationAsRead()`.
   - Add `getStudentBillingRecords()`.
   - Add `getCourseWithEnrollmentCheck()`.
3. Fix lint errors in `src/server/actions/auth.ts` and form components.

### Phase B: Student Dashboard & Enrolled Courses Polishing
1. Refactor `src/app/student/page.tsx`:
   - Derive 100% of stats from authentic records.
   - Clean, professional empty states when records are zero.
   - Dynamic cohort instructor resolution based on assigned batch.
2. Refactor `src/app/student/courses/page.tsx`:
   - Real progress bars.
   - Link each course to dedicated `/student/courses/[id]`.
   - Empty state when no enrollments exist.
3. Build `src/app/student/courses/[id]/page.tsx`:
   - Server-side enrollment verification.
   - Module and lesson navigation with previous/next controls.
   - Video player and markdown/text lesson view.
   - Resource download links.
   - Integrated `LessonCompleteButton`.

### Phase C: Live Classes, Attendance, Assignments & Grades
1. Verify `src/app/student/classes/page.tsx` and `authorizeStudentJoin` server verification.
2. Update `src/app/student/attendance/page.tsx` to handle 0 records cleanly.
3. Update `src/app/student/assignments/page.tsx` and `SubmitAssignmentModal.tsx`:
   - Support file/link submission and revision.
   - Server validation of deadline and allowed formats.
4. Update `src/app/student/grades/page.tsx`:
   - Strictly display published grades only.
   - Remove fake 95% default.

### Phase D: Missing Portal Sections
1. Create `/student/profile`:
   - Student Code display and copy action.
   - Linked Guardian information.
   - Enrolled cohorts and academic advisor details.
2. Create `/student/notifications`:
   - Real-time / server-rendered notification feed.
   - Read/unread toggling.
3. Create `/student/billing`:
   - Fee invoices and verified payment receipts.
4. Create `/student/resources`:
   - Course reference guides, worksheets, and code repositories.
5. Create `/student/support`:
   - Academic and technical support inquiry form and FAQ.

### Phase E: Layout, Navigation & Design Polish
1. Update `StudentSidebarNav.tsx` and `layout.tsx` to include new routes with active highlights and dynamic badges.
2. Ensure warm white/ink/subtle blue design aesthetic matching Syntaxora design guidelines.

### Phase F: Verification & Testing
1. Run Vitest test suite (`npm test`).
2. Run TypeScript compilation (`npm run typecheck`).
3. Run ESLint checks (`npm run lint`).
4. Run production build (`npm run build`).
5. Write targeted integration tests for all repaired and newly implemented student workflows.

