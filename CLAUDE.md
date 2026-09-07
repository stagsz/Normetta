# Normetta

ISO 9001:2015 Quality Management & Audit Platform for SMEs in Europe.

**Live app:** https://www.normetta.com  
**Backend base URL:** https://www.normetta.com/_/backend/api  
**Supabase project:** fqnorsqggyshqfmihivw (Pro plan — pgvector available)  
**GitHub:** https://github.com/stagsz/Normetta

---

## Monorepo Structure

```
Normetta/
├── backend/          # Express + TypeScript API (deployed as Vercel serverless)
│   ├── prisma/       # Prisma schema + migrations
│   ├── src/
│   │   ├── config/       # database.ts (Prisma client), config.ts (env vars)
│   │   ├── controllers/  # Request handlers (thin — delegate to services)
│   │   ├── proxy/        # authProxy.ts, validationProxy.ts (Zod schemas)
│   │   ├── routes/       # Express router definitions
│   │   ├── services/     # Business logic (fat services)
│   │   ├── types/        # enums.ts, shared types
│   │   └── utils/        # errors.ts (custom error classes)
├── frontend/         # Next.js 14 App Router (deployed to Vercel)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/       # /login, /register
│   │   │   ├── (dashboard)/  # /dashboard, /audits, /ncr, etc.
│   │   │   ├── onboarding/   # /onboarding wizard (4 steps)
│   │   │   └── join/         # /join/[token] invite flow
│   │   ├── components/       # React components
│   │   │   ├── landing/      # Marketing landing page (LandingPage.tsx + landing.css, served at /)
│   │   │   └── onboarding/   # Step1–Step4 wizard components
│   │   ├── lib/
│   │   │   ├── api.ts        # All API calls (axios client)
│   │   │   └── store/        # Zustand stores
│   │   └── providers.tsx     # React Query + auth providers
└── shared/           # Shared types between frontend and backend
```

Note: the old standalone `landing/index.html` was ported into the Next.js app
(July 2026) — the landing page is now `frontend/src/components/landing/LandingPage.tsx`,
rendered by `frontend/src/app/page.tsx` with metadata from `lib/landing-page-metadata.ts`.
All landing styles are scoped under the `.lp` class in `landing.css`.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, App Router, TypeScript, Tailwind CSS, React Query, Zustand |
| Backend | Express.js, TypeScript, Prisma ORM |
| Database | PostgreSQL via Supabase (Pro plan) |
| Auth | JWT (accessToken in localStorage), withAuth proxy middleware |
| Validation | Zod schemas in validationProxy.ts |
| Deploy | Vercel (both frontend and backend as serverless functions) |
| ORM | Prisma 6 — schema at backend/prisma/schema.prisma |

---

## Critical Rules

### Migrations — NEVER auto-run on deploy
- `prisma migrate deploy` is NOT in the Vercel build script
- All migrations must be run manually in Supabase SQL Editor
- When adding a new migration: create the SQL file in `backend/prisma/migrations/`, then
  instruct the user to run it manually in Supabase

### Prisma column naming
- Prisma schema uses camelCase field names with `@map("snake_case")` for DB columns
- If a migration creates columns manually, use snake_case in SQL but camelCase in Prisma schema
- Always add `@map()` annotations when column names differ

### Zod validation — enum values must be UPPERCASE
- All enums in validationProxy.ts use UPPERCASE values: `'MANAGER'`, `'AUDITOR'`, `'VIEWER'`
- Frontend must send uppercase enum values — never lowercase
- Check validationProxy.ts before adding new fields to existing endpoints

### Auth pattern
- Use `withAuth(handler)` from `../proxy/authProxy` — NOT a separate middleware file
- JWT payload contains: `{ userId, email, role, organizationId }`
- Access via `(req as any).user` inside handlers after withAuth wraps them

### API routing on Vercel
- Backend is served under `/_/backend/api/...` in production
- Frontend api.ts base URL: `/api` in dev, `/_/backend/api` in prod (set via env)
- Never hardcode backend URLs

---

## Common Commands

```bash
# Dev (run both together)
npm run dev

# TypeScript check (run before every commit)
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit

# Build check
cd backend && npm run build
cd frontend && npm run build

# Deploy — just git push to main, Vercel picks it up automatically
git push

# Prisma generate (after schema changes)
cd backend && npx prisma generate

# View DB schema
cd backend && npx prisma studio
```

---

## Database Enums (backend/src/types/enums.ts)

```
UserRole:        SYSTEM_ADMIN | QUALITY_MANAGER | INTERNAL_AUDITOR | DEPARTMENT_HEAD | VIEWER
AssessmentStatus: DRAFT | IN_PROGRESS | UNDER_REVIEW | COMPLETED | ARCHIVED
AuditType:       INTERNAL | EXTERNAL | SURVEILLANCE | CERTIFICATION
TeamMemberRole:  LEAD_AUDITOR | AUDITOR | OBSERVER
Severity:        MINOR | MAJOR | CRITICAL
NCRStatus:       OPEN | IN_PROGRESS | RESOLVED | CLOSED
ActionStatus:    PENDING | IN_PROGRESS | COMPLETED | VERIFIED
```

---

## Key Patterns

### Adding a new endpoint
1. Add Zod schema to `backend/src/proxy/validationProxy.ts`
2. Add service method to relevant service in `backend/src/services/`
3. Add controller method to `backend/src/controllers/`
4. Add route in `backend/src/routes/`, register with `withAuth` + `withValidation`
5. Add API call to `frontend/src/lib/api.ts`
6. Run `npx tsc --noEmit` in both backend and frontend before committing

### Adding a DB model
1. Add model to `backend/prisma/schema.prisma`
2. Run `npx prisma generate` to update client
3. Write migration SQL manually → save to `backend/prisma/migrations/YYYYMMDDHHMMSS_name/migration.sql`
4. Tell user to run migration in Supabase SQL Editor
5. Never run `prisma migrate dev` against production DB

### Frontend API calls
All API calls go through `frontend/src/lib/api.ts`. Pattern:
```ts
export const thingApi = {
  list: () => api.get('/things'),
  create: (data: CreateThingDto) => api.post('/things', data),
  update: (id: string, data: UpdateThingDto) => api.put(`/things/${id}`, data),
  delete: (id: string) => api.delete(`/things/${id}`),
};
```

---

## Known Pitfalls

- **Vercel builds fail** if `prisma migrate deploy` is in build script — it's been removed, don't add it back
- **camelCase vs snake_case**: Supabase SQL uses snake_case, Prisma uses camelCase — always add `@map()`
- **Empty user fields in onboarding**: If user is already logged in and navigates to /onboarding, `personal` store fields (firstName, lastName, email, password) are empty — use `/onboarding/setup-org` endpoint instead of `/onboarding/setup`
- **Enum case sensitivity**: Zod rejects lowercase enums — always uppercase
- **withAuth location**: It's in `proxy/authProxy.ts`, not `middleware/auth.ts`
- **Frontend env vars**: Must be prefixed with `NEXT_PUBLIC_` to be accessible client-side
- **Docker is NOT used in production** — local dev only, and even then direct npm run dev is preferred

---

## Environment Variables

### Backend (Vercel env)
```
DATABASE_URL          # Supabase connection pooling URL
DIRECT_URL            # Supabase direct connection URL (for migrations)
JWT_SECRET            # JWT signing secret
NODE_ENV              # production
```

### Frontend (Vercel env)
```
NEXT_PUBLIC_API_URL   # Backend API base URL
```

---

## Test Accounts
- System admin: hermes@greisz.se / Sidvolt2
- App URL: https://normetta-zeta.vercel.app

---

## Company OS
Strategy, marketing plans, and operational documents live in:
`C:\Users\staff\anthropicFun\Boarder_room\GreiszConsulting\`
(separate from this codebase — that's the "board room" layer)

Normetta branding/boardroom docs:
`C:\Users\staff\anthropicFun\Boarder_room\Normetta\`
