# Syntaxora Public Website Audit & Architecture Specification

**Document Date:** October 2026  
**Project:** Syntaxora — AI Learning Academy  
**Audit Scope:** Public-facing marketing website, public forms, navigation, authentication portals, and public data integrations  
**Status:** Implementation Complete & Fully Verified  
**Operating Principles:** Preserve existing backend & portals, no fake data, strict admission-first student access, WCAG AA accessibility, light-first editorial design system

---

## 1. Executive Summary

Syntaxora is an online, cohort-based artificial intelligence learning academy serving four distinct age demographics:
1. **Young Learners (Ages 7–11):** Young AI Explorers (Visual logic, pattern classifiers, playful algorithms)
2. **Teens & High School (Ages 12–17):** Teens Python & Applied AI (Clean syntax, OpenCV computer vision, machine learning models)
3. **College & University Scholars:** Deep Learning & PyTorch (Calculus, backpropagation, CNNs, Transformers)
4. **Working Professionals:** Generative AI Systems & Enterprise RAG (pgvector, semantic retrieval, autonomous agents)

This audit inspects the full public website architecture, establishes verified statuses based on code inspection and test execution, documents broken/incomplete elements, and records the completion of all improvements that elevate the public website into an art-directed, trustworthy, premium academic brand.

---

## 2. Detected Technology Stack

| Layer | Technology | Version | Notes / Conventions |
|---|---|---|---|
| **Framework** | Next.js (App Router) | `16.4.2` | Turbopack enabled (`@tailwindcss/turbopack`), React Server Components |
| **UI Library** | React | `19.3.0` | React Server Actions (`"use server"`), `useActionState`, Suspense |
| **Language** | TypeScript | `5.x` | Strict type checking via `tsc --noEmit` |
| **Styling** | Tailwind CSS v4 | `4.x` | `@import "tailwindcss";` with CSS `@theme` design tokens in `globals.css` |
| **Icons** | Lucide React | `^1.61.0` | Accessible SVGs with `aria-hidden="true"` |
| **Validation** | Zod | `^4.6.7` | Client & server schema validation |
| **Database & Auth** | Supabase SSR | `^0.12.7` / `^2.118.0` | Cookie-based session storage, RLS policies, public anonymous reads |
| **Test Suite** | Vitest | `^5.0.5` | 17 test files, 155 unit & integration tests |
| **CSS Utilities** | `clsx`, `tailwind-merge` | Latest | `cn()` helper in `@/lib/utils` |

---

## 3. Discovered Public Routes & Route Audit

| Page / Feature | Actual Route | Current Status | Evidence | Problem Identified | Action Taken | Dependencies | Verification |
|---|---|---|---|---|---|---|---|
| **Homepage** | `/` | **Working** | `src/app/(marketing)/page.tsx` | Overuse of generic neon gradients (`.text-gradient-ai`, `.card-ai-glow`); Inconsistent pathway explore buttons | Replaced neon magenta/orange with Deep Ink and Primary Blue palette; aligned all 4 explore buttons with identical `outline` styling and smooth right-arrow transitions | `courseService.ts`, `instructorService.ts` | Visual inspection, Responsive layout check, Typecheck & Vitest |
| **Course Catalog** | `/courses` | **Working** | `src/app/(marketing)/courses/page.tsx`, `CourseFilters.tsx` | Visual styling had remnants of generic gradient text; filter pills needed clean editorial active states | Refined typography, badges, and card surface styling; preserved real search and query filtering | `courseService.ts`, URL search params | Query params test (`?audience=teens&level=beginner`), reset button verification |
| **Course Details** | `/courses/[slug]` | **Working** | `src/app/(marketing)/courses/[slug]/page.tsx` | Sticky tuition card used high-saturation button; hero badge had garish colors | Replaced with verified curriculum badge; updated tuition card CTA to clean primary button | `courseService.ts`, Next.js dynamic routing | Tested with `/courses/applied-ai-for-teens`, tested invalid slug returns 404 |
| **Learning Pathways** | `/programs` | **Working** | `src/app/(marketing)/programs/page.tsx` | Good foundational layout; needed unified button hierarchy matching brand palette | Refined card borders, milestone checklist styling, and responsive column wrap; updated teen deliverable | None (static config) | Navigation test to `/programs`, verified cohort exploration CTAs |
| **About Academy** | `/about` | **Working** | `src/app/(marketing)/about/page.tsx` | Foundational content was solid; needed alignment with refined color tokens | Polished cards, spacing, and typographic contrasts | None | Direct route load and link verification |
| **Faculty & Mentors** | `/instructors` | **Working** | `src/app/(marketing)/instructors/page.tsx` | Subtitle referenced "roboticists"; avatars lacked editorial frame styling | Removed leftover "roboticists" text; refined faculty card layouts and badge tags | `instructorService.ts` | Verified `/instructors` renders Elena Vance, Marcus Chen, and Ananya Sharma |
| **How It Works** | `/how-it-works` | **Working** | `src/app/(marketing)/how-it-works/page.tsx`, `HowItWorksTabs.tsx` | Tabs for students and parents worked; needed polished buttons and editorial active indicators | Refined tab indicators, step badges, and mobile flow; removed neon gradient buttons | None | Tested tab switching between Student Path and Parent Oversight |
| **Admissions Application** | `/apply` | **Working** | `src/app/(marketing)/apply/page.tsx`, `StudentApplicationForm.tsx` | Header copy contained leftover "high-school roboticists" | Removed leftover text; polished form fields, error banners, and copy reference button | `applicationService.ts`, `studentApplicationSchema` | Tested valid submission (returns reference code), tested validation errors |
| **Contact Support** | `/contact` | **Working** | `src/app/(marketing)/contact/page.tsx`, `ContactForm.tsx` | Form functioned correctly; card layout aligned with refined palette | Elevated input focus styles, spacing, and advisory information card | `contact.ts` server action, Supabase `contact_enquiries` | Submitted contact form, verified error handling on network failure |
| **FAQ** | `/faq` | **Working** | `src/app/(marketing)/faq/page.tsx` | Used native `<details>`/`<summary>`; visual accordion indicator needed smoother transitions | Polished accordion border states, spacing, and hover feedback | None | Keyboard test (Enter/Space opens details), inspected expanded states |
| **Privacy Policy** | `/privacy` | **Working** | `src/app/(marketing)/privacy/page.tsx` | Comprehensive minor privacy document; needed clean typography | Formatted policy sections with clean typography and readability hierarchy | None | Verified `/privacy` loads cleanly |
| **Terms of Service** | `/terms` | **Working** | `src/app/(marketing)/terms/page.tsx` | Authentic classroom conduct agreement; styling needed editorial refinement | Formatted terms sections with clean typography | None | Verified `/terms` loads cleanly |
| **Portal Sign In** | `/login` | **Working** | `src/app/(auth)/login/page.tsx`, `LoginForm.tsx` | Authentication layout worked; ensured distinct guidance for parents vs prospective students | Polished card container and link hierarchy; strictly preserved auth backend | `authService.ts`, Supabase Auth | Tested email/password fields, role redirection, error message display |
| **Forgot Password** | `/forgot-password` | **Working** | `src/app/(auth)/forgot-password/page.tsx` | Works with Supabase password recovery; visual styling matches editorial palette | Polished form surface and status alert | Supabase `resetPasswordForEmail` | Verified form input validation |
| **Reset Password** | `/reset-password` | **Working** | `src/app/(auth)/reset-password/page.tsx` | Handles token exchange and new password setting; styling polished | Polished form surface and validation message | Supabase `updateUser` | Verified password requirement validation |
| **Email Verification** | `/verify` | **Working** | `src/app/(auth)/verify/page.tsx` | Informational confirmation card | Polished visual layout and return button | None | Verified page render |
| **Custom 404** | `not-found.tsx` | **Working** | `src/app/not-found.tsx` | Used legacy colors (`#F3F6FA`, `#142541`) divergent from marketing palette (`#FAF8F3`, `#17243A`) | Redesigned with brand wordmark, palette tokens (`#FAF8F3`, `#17243A`, `#355F99`), and navigation links | None | Triggered invalid URL (`/random-page`), verified render |
| **Custom Error** | `error.tsx` | **Working** | `src/app/error.tsx` | Used legacy colors (`#F3F6FA`, `#142541`) | Redesigned with brand wordmark, palette tokens, and graceful reset button | None | Verified error boundary structure |

---

## 4. Existing Shared Components and Dependencies

1. **Header & Navigation** (`src/components/navigation/MarketingHeader.tsx`):
   - Desktop nav with active route indicators.
   - Mobile menu drawer with Escape key handling and backdrop click dismiss.
   - CTA buttons: "Portal Sign In" (`/login`) and "Apply for Admission" (`/apply`).
   - Distinct guidance for Parent Registration (`/sign-up?role=parent`) while keeping student access strictly admission-first.

2. **Footer** (`src/components/navigation/MarketingFooter.tsx`):
   - 4-column responsive layout: Brand & Zero-Trust Notice, Learning Paths, Portals & Admissions, Contact & Legal.
   - Fully updated with all valid routes and no broken links.

3. **Layout Wrapper** (`src/app/(marketing)/layout.tsx`):
   - Added accessible Skip-to-Content link targeting `<main id="main-content">` for WCAG 2.1 compliance.

4. **Buttons & Form Controls** (`src/components/ui/button.tsx`, `src/components/ui/input.tsx`):
   - `Button`: Supports `primary`, `secondary`, `teal`, `outline`, `ghost`, `warm`, `editorial`, `danger`.
   - `Input`: Accessible input wrapper with label, error message, and helper text.
   - Replaced high-saturation gradient styles with Deep Ink, Primary Blue, and Teal tokens.

5. **Motion System** (`src/components/ui/reveal.tsx`, `src/app/globals.css`):
   - `Reveal`: Lightweight IntersectionObserver wrapper that honors `prefers-reduced-motion: reduce`.
   - Micro-animations: `fadeIn`, `fadeInUp`, `fadeInDown`, `pulseDot`.

---

## 5. Existing Backend, Database & Service Integrations

1. **Course Service** (`src/server/services/courseService.ts`):
   - Reads from Supabase `courses`, `course_modules`, and `lessons` when credentials are valid.
   - Gracefully falls back to canonical database seeds (`INITIAL_ACADEMY_COURSES`) when Supabase is in local/unconfigured state.
   - Published course filter strictly enforces `status = 'published'` for public views.

2. **Instructor Service** (`src/server/services/instructorService.ts`):
   - Reads approved faculty from Supabase `profiles` with role `instructor`.
   - Falls back to `APPROVED_ACADEMY_INSTRUCTORS` (Dr. Elena Vance, Marcus Chen, Ananya Sharma).

3. **Application Service** (`src/server/services/applicationService.ts`):
   - Server Action `submitApplicationAction` validates against `studentApplicationSchema`.
   - Checks for duplicate applications (same student email + course within active cohort).
   - Generates persistent application reference code (`APP-XXXXXXXX`).
   - Persists to Supabase `student_applications` table with fallback to in-memory store for local testing.
   - **Crucial Rule Maintained:** Submitting an application does NOT create an authenticated session or portal account.

4. **Contact Service** (`src/server/actions/contact.ts`):
   - Validates input with honeypot field (`botField`) protection against spam.
   - Inserts record into Supabase `contact_enquiries` with status `unread`.

5. **Authentication Service** (`src/server/actions/auth.ts`, `src/server/services/authService.ts`):
   - Supabase Auth SSR for cookie-based session management.
   - Role-based authorization redirects: Admin -> `/admin`, Instructor -> `/instructor`, Student -> `/student`, Parent -> `/parent`.
   - `signUpSchema` explicitly rejects self-signup for students (`role === 'parent'` required).

---

## 6. Accessibility & Responsive Design Verification

- **Color Contrast:** The primary palette (Deep Ink `#17243A`, Primary Blue `#355F99`, Teal `#167F78` on Warm Background `#FAF8F3` and White `#FFFFFF`) exceeds WCAG AA contrast ratio of 4.5:1 for normal text and 3:1 for large text.
- **Keyboard Navigation:** Native `<summary>` elements in FAQ, accessible `<nav aria-label="...">`, visible focus rings (`:focus-visible`), and skip-to-content link.
- **Screen Reader Support:** Decorative icons have `aria-hidden="true"`; error messages are linked to form fields.
- **Reduced Motion:** `prefers-reduced-motion` media query in `globals.css` forces zero transition duration and cancels animations.
- **Mobile Reflow:** Responsive grids reflow cleanly from 1 column on 360px mobile to 2/3/4 columns on 1280px+ desktop.

---

## 7. Security Audit for Public Routes

- **No Student Record Exposure:** Public routes only access published courses and approved faculty.
- **No Secret Leaks:** Supabase service-role keys, payment secrets, and SMTP credentials remain strictly in server-side files (`server.ts`, `admin.ts`, `.env.local`).
- **No Student Self-Registration:** Admission-first gate is strictly enforced.
- **Honeypot Protection:** Contact form has silent botField detection.

---

## 8. Verification Results

- **Typecheck:** `npm run typecheck` (`tsc --noEmit`) completed with **0 errors**.
- **Unit & Integration Tests:** `npm test` (`vitest run`) completed with **17 test files passed, 155 tests passed (100% passing)**.
