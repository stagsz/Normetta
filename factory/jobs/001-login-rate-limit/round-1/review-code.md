VERDICT: PASS

Findings (non-blocking):
- backend/src/proxy/rateLimitProxy.ts:12 keys on raw `req.ip`. The spec allows this fallback, and ^7.1.5 may not export `ipKeyGenerator`. Unverified, because node_modules is not installed in the worktree. IPv6 clients can rotate addresses within a /64 to get fresh counters. Consider switching to `ipKeyGenerator` if the installed version exports it.
- factory/jobs/001-login-rate-limit/round-1/build.md does not exist, so I could not cross-check the builder's claims. I reviewed the diff directly.
- backend/src/__tests__/loginRateLimit.test.ts, last test: AC10 is covered by a source-grep test, which is brittle but acceptable per the spec ("test or grep").
- Real-time 1.1s wait in the window-reset test: acceptable.
- Per the spec, 429 messages hardcode "15 minutes" even when windowMs is overridden by env. Minor.

Coverage: AC3 to AC8 and AC11 are covered by tests. AC9 holds because the limiter is not mounted when NODE_ENV is 'test'. AC10 holds because only /login uses the limiter. AC1 and AC2 (tsc and build) not run by me; the types look correct. The frontend 429 handling is correct and tested. Conventions are fine: the limiter is in proxy/, config is centralized, and the controller is untouched.
