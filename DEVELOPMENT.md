# Development

## Install

- Node 18+
- npm workspaces: `npm install`
- Backend env: `backend/.env`
- Frontend env: `frontend/.env.local`
- Cloudflare Turnstile is optional locally. Leave `TURNSTILE_SECRET_KEY` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset to skip the signup challenge, or use
  Cloudflare's test keys (site `1x00000000000000000000AA`, secret
  `1x0000000000000000000000000000000AA`) to exercise the always-pass path.

## Run

- `npm run dev:backend`
- `npm run dev:frontend`

## Test

- `npm run test --workspace=backend`

## Database

- `npm run db:migrate --workspace=backend`
- Prisma Studio: `npx prisma studio --schema=backend/prisma/schema.prisma`
