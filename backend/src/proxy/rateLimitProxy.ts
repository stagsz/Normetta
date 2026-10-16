import type { Request } from 'express';
import rateLimit, { type Options } from 'express-rate-limit';
import { config } from '../config';

export interface LoginRateLimiterOptions {
  windowMs?: number;
  max?: number;
  // Optional shared store (e.g. Redis/Postgres). Defaults to the per-instance MemoryStore.
  store?: Options['store'];
}

// Key is client IP + normalized email, so one IP cannot lock out other accounts
// and one email is not blocked for every IP.
export function loginRateLimitKey(req: Request): string {
  const email = String(req.body?.email ?? '').trim().toLowerCase();
  return `${req.ip}|${email}`;
}

/**
 * Limits POST /auth/login attempts per (IP + email). Counts successful and
 * failed attempts alike. Must run after express.json() so req.body.email is set.
 */
export function createLoginRateLimiter(opts: LoginRateLimiterOptions = {}) {
  return rateLimit({
    windowMs: opts.windowMs ?? config.loginRateLimit.windowMs,
    limit: opts.max ?? config.loginRateLimit.maxAttempts,
    keyGenerator: loginRateLimitKey,
    skipSuccessfulRequests: false,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    ...(opts.store ? { store: opts.store } : {}),
    message: {
      success: false,
      error: {
        code: 'TOO_MANY_LOGIN_ATTEMPTS',
        message: 'Too many login attempts. Please try again in 15 minutes.',
      },
    },
  });
}
