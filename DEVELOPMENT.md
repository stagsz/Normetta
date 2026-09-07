# Development

## Install

- Node 18+
- npm workspaces: `npm install`
- Backend env: `backend/.env`
- Frontend env: `frontend/.env.local`
- Cloudflare Turnstile is optional locally. Leave `TURNSTILE_SECRET_KEY` and
  `NEXT_PUBLIC_TURNSTILE_SITE_KEY` unset to skip the signup challenge. To test
  against the real widget locally, put the secret in `backend/.env`, the site
  key in `frontend/.env.local`, add `localhost` to the widget's hostnames in
  the Cloudflare dashboard, and set `TURNSTILE_ALLOWED_HOSTNAMES=localhost` in
  `backend/.env`. The secret is never committed and never goes in a
  `NEXT_PUBLIC_` variable.

## Run

- `npm run dev:backend`
- `npm run dev:frontend`

## Test

- `npm run test --workspace=backend`

## Database

- `npm run db:migrate --workspace=backend`
- Prisma Studio: `npx prisma studio --schema=backend/prisma/schema.prisma`
