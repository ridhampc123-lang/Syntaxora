# Syntaxora — Comprehensive Test Plan

This document defines the test strategy, test suites, mandatory negative security tests, critical end-to-end journeys, and release verification gates for the **Syntaxora AI Learning Academy** platform.

---

## 1. Test Architecture & Frameworks

- **Unit & Integration Runner**: [Vitest](https://vitest.dev) with Node test environment.
- **Assertion Library**: Vitest `expect` with TypeScript type coverage.
- **HTTP / Server Action Testing**: Direct invocation of typed server services and validation schemas.
- **Database / RLS Verification**: SQL migration testing and authenticated Supabase client mocks/fixtures.

---

## 2. Test Suites

### 2.1 Unit Tests (`tests/unit/`)
1. **Validation Schemas (`tests/unit/validation.test.ts`)**:
   - Contact form input validation (sanitization, email formatting, message length).
   - Sign-up input validation (rejection of injected `admin` and `instructor` roles).
   - Course creation validation (slug format, positive durations, non-negative prices).
   - Assignment & submission schema validation.
2. **Permission Policy Functions (`tests/unit/permissions.test.ts`)**:
   - Evaluation of `can_view_attendance`, `can_view_progress`, `can_view_schedule`, `can_view_fees`.
   - Role hierarchy resolution (`admin` > `instructor` / `student` / `parent`).
3. **Invitation Token Security (`tests/unit/invitation_token.test.ts`)**:
   - Cryptographic token generation entropy.
   - SHA-256 token hashing and timing-safe comparison.
   - Expiration timestamp calculation.
4. **Learning Progress Calculation (`tests/unit/progress.test.ts`)**:
   - Progress percentage computation from completed lessons vs. total module lessons.
   - Handling empty courses and courses with no lessons (0% without division-by-zero).
5. **Payment Webhook Verification (`tests/unit/payment_webhook.test.ts`)**:
   - HMAC-SHA256 signature calculation and validation.
   - Rejection of tampered payloads and mismatched order references.
   - Idempotency key tracking.

### 2.2 Integration Tests (`tests/integration/`)
1. **Role Access Boundaries (`tests/integration/role_boundaries.test.ts`)**:
   - Unauthenticated requests to `/admin`, `/instructor`, `/student`, `/parent` are blocked.
   - Student session accessing `/admin` routes receives `403 Forbidden`.
   - Instructor session accessing `/parent` routes receives `403 Forbidden`.
2. **Guardian Relationship Activation & Revocation (`tests/integration/guardian_flow.test.ts`)**:
   - Invitation creation bound to student ID.
   - Invitation consumption by intended email.
   - Immediate denial of child data upon relationship revocation.
3. **Instructor Scoped Access (`tests/integration/instructor_scope.test.ts`)**:
   - Instructor can record attendance only for sessions they are assigned to teach.
   - Instructor cannot modify attendance or grades for another instructor's course.
4. **Attendance Recording & Corrections (`tests/integration/attendance.test.ts`)**:
   - Unique `(class_session_id, student_id)` prevents duplicate records.
   - Attendance corrections require a non-empty audit reason.
5. **Assignment Submission & Grade Release (`tests/integration/assignments.test.ts`)**:
   - Student can submit only for their own enrolled courses.
   - Unreleased grades are invisible to students and parents; released grades become visible.

---

## 3. Mandatory Negative Security Tests

The following negative tests are release-blocking gates:

| ID | Test Scenario | Expected Outcome |
|---|---|---|
| **NEG-01** | Unauthenticated user queries protected route or server action | Denied (`401 Unauthorized`) |
| **NEG-02** | User attempts to pass `role: 'admin'` in public sign-up form | Role overridden or request rejected with 400 |
| **NEG-03** | Guardian changes `student_id` in URL/request to an unrelated child | Denied (`403 Forbidden`), no data leaked |
| **NEG-04** | Guardian with `can_view_attendance = true` but `can_view_fees = false` queries fees | Attendance returned, fees denied (`403 Forbidden`) |
| **NEG-05** | Attempt to reuse an already-consumed invitation token | Rejected (`400 Bad Request / Token already used`) |
| **NEG-06** | Attempt to use an expired invitation token | Rejected (`400 Bad Request / Token expired`) |
| **NEG-07** | Concurrent attempts to consume one invitation token | Exactly one succeeds; second fails with conflict |
| **NEG-08** | Instructor attempts to access students of an unassigned course | Denied (`403 Forbidden`) |
| **NEG-09** | Student attempts to submit homework on behalf of another student | Denied (`403 Forbidden`) |
| **NEG-10** | Student or parent attempts to directly mutate grades or payment states | Denied (`403 Forbidden`) |
| **NEG-11** | Request to download private file with manipulated path | Denied (`403 Forbidden`) |

---

## 4. Critical End-to-End Journeys

1. **Visitor to Course Discovery**: Visitor searches and filters courses, views details, syllabus, and instructor profile without authentication.
2. **Student Onboarding**: Student registers, verifies email, signs in, and views their personal dashboard.
3. **Admin Course & Curriculum Management**: Admin creates a course, adds modules and lessons, and publishes it.
4. **Admin Student Enrollment**: Admin registers a canonical student, creates an enrollment, and schedules a live session.
5. **Instructor Workload & Attendance**: Assigned instructor views scheduled class, opens roster of enrolled students, records attendance, and submits an audited correction with reason.
6. **Student Learning & Progress**: Student joins authorized live session during window, completes lesson, and checks progress meter.
7. **Guardian Invitation & Child Linking**: Admin sends single-use token invite to parent; parent accepts; relationship is activated.
8. **Guardian Data Scoping**: Parent signs in, selects child, views attendance and progress, while payment tab respects specific fee permissions.
9. **Parent Cross-Tenant Denial**: Parent attempts to access an unrelated student record and is denied with an audit log entry.
10. **Guardian Revocation**: Admin revokes guardian access; subsequent parent queries for that child immediately return access denied.
11. **Assignment Submission & Grading**: Student uploads submission; instructor reviews, inputs score and feedback; instructor toggles "Release Grade"; student and parent can now see the grade.
12. **Payment Lifecycle**: Parent initiates checkout for course enrollment; order created; payment webhook verifies HMAC signature; enrollment status switches from pending to active.

---

## 5. Release Gate Commands

Before any phase is marked complete or code is approved for deployment, the following commands must execute cleanly:

```bash
# 1. Type check
npm run typecheck

# 2. Linter check
npm run lint

# 3. Unit and integration tests
npm run test

# 4. Production build
npm run build
```
