# Build 001 - Login rate limit (round 1)

Branch: `factory/001-login-rate-limit`, commit `d749162` (not pushed).

## Summary
`createLoginRateLimiter()` wraps `express-rate-limit` with a key of IP + trimmed, lowercased
email. Defaults to 5 attempts per 15 min from `config.loginRateLimit`. It counts successful
attempts too, sends draft-7 headers, and returns a `TOO_MANY_LOGIN_ATTEMPTS` body. It also
accepts an optional `store` for a shared store later. It is mounted on `POST /login` only,
before `withValidation`, and skipped when `NODE_ENV === 'test'`. `express.json()` runs before
the routers (index.ts line 43), so `req.body.email` is available.

Installed express-rate-limit is 7.5.1, which does not export `ipKeyGenerator`. The key uses
`req.ip` directly, and v7 raised no validation warning.

Frontend: `getAuthErrorInfo` used to map every 429 to a generic "wait a moment" message. It
now shows the server's `error.message` on a 429, so users see the 15-minute message.

## Files changed
- backend/src/proxy/rateLimitProxy.ts (new)
- backend/src/proxy/index.ts (re-export)
- backend/src/config/index.ts (`loginRateLimit`)
- backend/src/routes/authRoutes.ts
- backend/src/__tests__/loginRateLimit.test.ts (new)
- frontend/src/lib/auth-errors.ts
- frontend/src/lib/__tests__/auth-errors.test.ts (new)

## Acceptance criteria -> evidence
| AC | Evidence |
|----|----------|
| 1 | `npx tsc --noEmit` (backend) passes |
| 2 | `npm run build` (backend) passes |
| 3 | test "allows 5 attempts and returns 429 on the 6th" |
| 4 | test "returns the TOO_MANY_LOGIN_ATTEMPTS body and draft-7 headers" |
| 5 | test "keys on IP + email, not IP alone" |
| 6 | test "trims and lowercases the email" |
| 7 | test "counts successful attempts too" |
| 8 | test "allows requests again after the window passes" (1.1 s real wait) |
| 9 | Limiter not mounted under NODE_ENV=test. auth/assessment suites could NOT be run (see below) |
| 10 | test "applies the login limiter to POST /login only" (source check) |
| 11 | test "defaults to 900000 ms and 5 attempts when env vars are unset" |

## Test output
```
PASS src/__tests__/loginRateLimit.test.ts   8 passed
PASS src/__tests__/turnstileService.test.ts
FAIL auth / onboarding / health / assessment: "Can't reach database server at localhost:5432"
Tests: 96 failed, 19 passed, 115 total
frontend: PASS src/lib/__tests__/auth-errors.test.ts  1 passed
```
The 96 failures are environmental: there is no local Postgres, so every DB-backed test fails
in `cleanupTestData`. AC 9 still needs a run against a test DB.

Frontend `tsc --noEmit` reports 7 errors in dashboard/page.tsx, header.tsx, and
section-detail-panel.tsx. main has the same 7 errors, and this change adds none.
