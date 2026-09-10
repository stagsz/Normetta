// This file runs once before all tests
// It sets up the test environment before any other module loads

module.exports = async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';
  // Never let a developer's backend/.env Turnstile secret turn the onboarding
  // integration tests into 403s; the service is unit-tested with injected fetch.
  process.env.TURNSTILE_SECRET_KEY = '';
};
