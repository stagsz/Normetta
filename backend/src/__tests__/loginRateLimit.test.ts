import fs from 'fs';
import path from 'path';
import express from 'express';
import request from 'supertest';
import { createLoginRateLimiter } from '../proxy/rateLimitProxy';

function buildApp(opts: { windowMs: number; max: number }, status = 401) {
  const app = express();
  app.use(express.json());
  app.post('/login', createLoginRateLimiter(opts), (_req, res) => {
    res.status(status).json({ success: status === 200 });
  });
  return app;
}

const login = (app: express.Express, email: string) =>
  request(app).post('/login').send({ email, password: 'x' });

describe('createLoginRateLimiter', () => {
  it('allows 5 attempts and returns 429 on the 6th', async () => {
    const app = buildApp({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 5; i++) {
      expect((await login(app, 'a@example.com')).status).toBe(401);
    }
    expect((await login(app, 'a@example.com')).status).toBe(429);
  });

  it('returns the TOO_MANY_LOGIN_ATTEMPTS body and draft-7 headers', async () => {
    const app = buildApp({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 5; i++) await login(app, 'a@example.com');
    const res = await login(app, 'a@example.com');
    expect(res.status).toBe(429);
    expect(res.body).toEqual({
      success: false,
      error: { code: 'TOO_MANY_LOGIN_ATTEMPTS', message: expect.any(String) },
    });
    expect(res.body.error.message.length).toBeGreaterThan(0);
    expect(res.headers['ratelimit'] ?? res.headers['ratelimit-policy']).toBeDefined();
  });

  it('keys on IP + email, not IP alone', async () => {
    const app = buildApp({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 5; i++) await login(app, 'a@example.com');
    expect((await login(app, 'b@example.com')).status).not.toBe(429);
  });

  it('trims and lowercases the email', async () => {
    const app = buildApp({ windowMs: 60000, max: 5 });
    for (let i = 0; i < 3; i++) await login(app, 'A@Example.com ');
    for (let i = 0; i < 2; i++) await login(app, 'a@example.com');
    expect((await login(app, 'a@example.com')).status).toBe(429);
  });

  it('counts successful attempts too', async () => {
    const app = buildApp({ windowMs: 60000, max: 5 }, 200);
    for (let i = 0; i < 5; i++) {
      expect((await login(app, 'a@example.com')).status).toBe(200);
    }
    expect((await login(app, 'a@example.com')).status).toBe(429);
  });

  it('allows requests again after the window passes', async () => {
    const app = buildApp({ windowMs: 1000, max: 5 });
    for (let i = 0; i < 5; i++) await login(app, 'a@example.com');
    expect((await login(app, 'a@example.com')).status).toBe(429);
    await new Promise((r) => setTimeout(r, 1100));
    expect((await login(app, 'a@example.com')).status).toBe(401);
  });
});

describe('login rate limit config', () => {
  it('defaults to 900000 ms and 5 attempts when env vars are unset', () => {
    const saved = { w: process.env.LOGIN_RATE_LIMIT_WINDOW_MS, m: process.env.LOGIN_RATE_LIMIT_MAX };
    delete process.env.LOGIN_RATE_LIMIT_WINDOW_MS;
    delete process.env.LOGIN_RATE_LIMIT_MAX;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { config } = require('../config');
      expect(config.loginRateLimit).toEqual({ windowMs: 900000, maxAttempts: 5 });
    });
    if (saved.w !== undefined) process.env.LOGIN_RATE_LIMIT_WINDOW_MS = saved.w;
    if (saved.m !== undefined) process.env.LOGIN_RATE_LIMIT_MAX = saved.m;
  });
});

describe('authRoutes wiring', () => {
  it('applies the login limiter to POST /login only', () => {
    const src = fs.readFileSync(path.join(__dirname, '../routes/authRoutes.ts'), 'utf8');
    expect(src.match(/loginLimiters/g)).toHaveLength(2); // declaration + /login
    const loginBlock = src.slice(src.indexOf("'/login'"), src.indexOf("'/forgot-password'"));
    expect(loginBlock).toContain('...loginLimiters');
    expect(loginBlock.indexOf('loginLimiters')).toBeLessThan(loginBlock.indexOf('withValidation'));
  });
});
