ESCALATE

## Why a human should review this before main
1. **Security-sensitive change.** The job adds a rate limiter to `POST /api/auth/login`. Any change to the auth path needs a human sign-off under the factory rules, even if the change is good.
2. **AC 1 and AC 2 could not be reproduced.** build.md says backend `tsc --noEmit` and `npm run build` pass. In the worktree, after `npm install`, both fail:
   ```
   src/routes/blogRoutes.ts(4,20): error TS2307: Cannot find module 'gray-matter'
   src/routes/blogRoutes.ts(54,137): error TS7006: Parameter 'line' implicitly has an 'any' type.
   ```
   This is a pre-existing problem on main, not caused by this branch. `gray-matter` is imported by `blogRoutes.ts` but is not listed in `main:backend/package.json`, and this branch does not touch that file. Even so, the build is red, and the evidence in build.md overstates it. A human needs to fix or accept this (add `gray-matter` as a dependency in a separate change).
3. **AC 9 is not verified.** `auth.test.ts` and `assessment.test.ts` cannot run because there is no local Postgres. The reasoning (the limiter is not mounted when `NODE_ENV=test`) is correct when you read the code, but no test run confirms it.

## What was verified
- Ran `npx jest src/__tests__/loginRateLimit.test.ts` with a dummy DATABASE_URL: 8/8 pass. This covers AC 3, 4, 5, 6, 7, 8, 10 and 11.
- Read the diff:
  - The limiter is applied only to `/login` in `authRoutes.ts`.
  - The key is `req.ip|trimmed-lowercased-email`.
  - It uses draft-7 headers and returns the 429 body shape the spec asks for.
  - Defaults come from `config.loginRateLimit` (900000 ms, 5 attempts).
  - It accepts an optional `store` so a shared store can be added later.
- No dependency changes (`package.json` and the lockfile are unchanged), no migration, no Prisma schema change.
- All Round 1 reviews (code, security, UI, UX) are PASS.

## Notes for the reviewer
- Known trade-off accepted in the spec: MemoryStore is per instance on Vercel, so the real limit is weaker than a global 5.
- The key uses raw `req.ip` and not the IPv6-safe `ipKeyGenerator` helper. Because the email is part of the key, the IPv6 rotation risk is smaller, but it is still worth a look.
