# Normetta

ISO 9001:2015 Quality Management & Audit Platform.

## Repo layout

- `frontend/` — Next.js app shell
- `backend/` — Express API + Prisma data layer
- `shared/` — shared types/utilities across packages
- `docs/` — product, setup, payment/legal, and operations docs
- `supabase/migrations/` — database migrations

The landing page now lives in `frontend/src/components/landing/` (ported into the Next.js app).