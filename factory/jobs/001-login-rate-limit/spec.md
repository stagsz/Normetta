# 001 - Rate-limit POST /auth/login

## Goal
Slow down credential stuffing and brute force on `POST /api/auth/login`. Allow at most 5
attempts per 15 minutes for each (client IP + normalized email) pair. Attempt 6 and later
get HTTP 429 until the window resets.

### Decision: in-memory `express-rate-limit`, no DB store
- `express-rate-limit@^7.1.5` is already in `backend/package.json` and is already used
  globally in `backend/src/index.ts` (lines 24-40, skipped when `NODE_ENV === 'test'`).
  `trust proxy` is already set to 1 (index.ts line 16), so `req.ip` is the real client IP
  behind Vercel.
- Accepted trade-off: on Vercel serverless the default MemoryStore is per instance.
  Counters reset on cold start and are not shared across concurrent instances. The real
  limit is therefore "5 per instance per 15 min", which is weaker than a global 5. This
  still blocks naive single-source brute force, and the change needs no new dependency,
  migration, or infra. A shared store (Postgres table or Upstash Redis) is deferred
  (see Out of scope). The limiter is built so a `store` option can be added later
  without touching callers.

## Out of scope
- Shared or persistent store (Prisma model, migration, Redis/Upstash).
- Rate-limiting `/forgot-password`, `/reset-password`, `/refresh`, or onboarding.
- Account lockout, CAPTCHA/Turnstile on login, email alerts.
- Changing the existing global limiter in `index.ts`.
- Frontend changes beyond showing the server's 429 message (see UX notes).

## Files likely touched
- `backend/src/proxy/rateLimitProxy.ts` (new): exports `createLoginRateLimiter(opts?)`.
- `backend/src/proxy/index.ts`: re-export it, if this barrel is used for proxies.
- `backend/src/config/index.ts`: add `loginRateLimit: { windowMs, maxAttempts }` from
  `LOGIN_RATE_LIMIT_WINDOW_MS` (default 900000) and `LOGIN_RATE_LIMIT_MAX` (default 5).
- `backend/src/routes/authRoutes.ts`: put the limiter before `withValidation` on `/login`.
- `backend/src/__tests__/loginRateLimit.test.ts` (new).
- `frontend/src/app/(auth)/login/...` (only if it currently hides server error messages).

## Implementation notes
- `createLoginRateLimiter({ windowMs, max })` wraps `rateLimit({...})` with:
  - `windowMs` / `limit` from args, falling back to `config.loginRateLimit`.
  - `keyGenerator: req => \`${ipKeyGenerator?(req.ip) ?? req.ip}|${String(req.body?.email ?? '').trim().toLowerCase()}\``.
    Use v7's IPv6-safe helper if the installed version exports it. Otherwise use `req.ip`
    and set `validate: { keyGeneratorIpFallback: false }` only if v7 warns.
  - `standardHeaders: 'draft-7'`, `legacyHeaders: false`.
  - Count all attempts, both failed and successful (`skipSuccessfulRequests: false`),
    to match "5 attempts".
  - Respond with `{ success: false, error: { code: 'TOO_MANY_LOGIN_ATTEMPTS', message: 'Too many login attempts. Please try again in 15 minutes.' } }`.
    Match the shape of the global limiter's message in `index.ts`.
- Body parsing (`express.json`) runs before routers, so `req.body.email` is available
  when the limiter runs. Confirm this in `index.ts`.
- In `authRoutes.ts`, mount the limiter only when `process.env.NODE_ENV !== 'test'`, the
  same rule `index.ts` uses. This matters because `auth.test.ts` and
  `assessment.test.ts` call `/api/auth/login` many times with the same email and would
  start getting 429. The new test checks the factory directly on a small Express app.

## Acceptance criteria
1. `cd backend && npx tsc --noEmit` passes.
2. `cd backend && npm run build` passes.
3. Jest (`loginRateLimit.test.ts`): on a minimal Express app with `express.json()` and
   `createLoginRateLimiter({ windowMs: 60000, max: 5 })` in front of a stub handler that
   returns 401, 5 POSTs with the same email from the same IP return 401, and the 6th
   returns 429.
4. Jest: the 429 body equals `{ success: false, error: { code: 'TOO_MANY_LOGIN_ATTEMPTS', message: <non-empty string> } }`.
   The response has a `RateLimit` or `RateLimit-Policy` header (draft-7).
5. Jest: after 5 attempts for `a@example.com`, a request for `b@example.com` from the
   same IP is not 429. The key is IP + email, not IP alone.
6. Jest: `A@Example.com ` and `a@example.com` share one counter (email is trimmed and
   lowercased).
7. Jest: successful responses (stub returns 200) also count. The 6th request is 429
   even when earlier ones succeeded.
8. Jest: with `max: 5, windowMs: 1000`, once the window has passed (use fake timers or a
   short real wait), the next request is allowed again.
9. The existing `auth.test.ts` and `assessment.test.ts` still pass unchanged, because the
   limiter is not mounted when `NODE_ENV === 'test'`.
10. `authRoutes.ts` applies the limiter to `POST /login` only. A test or grep confirms no
    other auth route uses it.
11. Defaults come from `config.loginRateLimit`: 900000 ms and 5 attempts when the env
    vars are unset (Jest test on the config module, or a type check plus default literals).

## UX notes
- The login page should show the server's `error.message` on a 429 response. Users
  should not see a generic "Invalid credentials" message for this case. If the login
  form already shows `error.message` from the API, no frontend change is needed.
- Do not reveal whether the email exists. The 429 message is the same for every email.
