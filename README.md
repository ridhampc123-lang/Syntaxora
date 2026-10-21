# Syntaxora — AI Learning Academy Platform

Syntaxora is an online AI learning platform for children, teenagers, college students, and adults. It combines a public marketing academy website with connected, role-protected portals for **Administrators**, **Instructors**, **Students**, and **Parents/Guardians**, backed by Supabase PostgreSQL, Supabase Auth, and Row Level Security (RLS).

---

## 1. Prerequisites

- **Node.js**: v20+ (tested on Node v22)
- **Package Manager**: npm v10+
- **Database**: Supabase PostgreSQL database project (local or hosted)

---

## 2. Installation & Local Setup

```bash
# Clone the repository and enter directory
cd Syntaxora

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...
```

---

## 3. Database Migrations

Database migrations are located in `supabase/migrations/`.

To apply migrations using the Supabase CLI:
```bash
# Start local Supabase container (optional for local docker dev)
npx supabase start

# Apply pending migrations
npx supabase db push
```

Alternatively, copy the SQL files from `supabase/migrations/` in chronological order into the Supabase SQL Editor of your hosted project.

---

## 4. First-Time Admin Account Provisioning

For security, the platform does not allow self-registration as an administrator.

To bootstrap the initial administrator:
1. Register a new user through the application sign-up page (`/sign-up`).
2. Run the administrative promotion query in your Supabase SQL Editor:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-admin-email@example.com';
   ```
3. Sign out and sign back in; the server will direct you to `/admin`.

---

## 5. Development & Testing Commands

```bash
# Start Next.js development server
npm run dev

# Run TypeScript type check
npm run typecheck

# Run ESLint check
npm run lint

# Run Vitest test suite
npm run test

# Run production build
npm run build
```

---

## 6. Architecture & Core Documentation

Detailed specifications and architectural decisions are documented in:
- [IMPLEMENTATION_PLAN.md](file:///d:/Syntaxora/IMPLEMENTATION_PLAN.md): Phase-by-phase implementation checklist.
- [ARCHITECTURE.md](file:///d:/Syntaxora/ARCHITECTURE.md): System topology, security boundaries, and data flow.
- [DATABASE.md](file:///d:/Syntaxora/DATABASE.md): Canonical database schema, foreign keys, constraints, and RLS policies.
- [SECURITY.md](file:///d:/Syntaxora/SECURITY.md): Threat model, role matrix, token hashing, and minor privacy rules.
- [TEST_PLAN.md](file:///d:/Syntaxora/TEST_PLAN.md): Unit, integration, negative security, and E2E test specifications.
- [.env.example](file:///d:/Syntaxora/.env.example): Environment variable documentation.
