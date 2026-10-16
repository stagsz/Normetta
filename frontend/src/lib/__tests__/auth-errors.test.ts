import { getAuthErrorInfo } from '../auth-errors';

describe('getAuthErrorInfo 429', () => {
  it('shows the server message for rate-limited logins', () => {
    const message = 'Too many login attempts. Please try again in 15 minutes.';
    const info = getAuthErrorInfo({
      response: { status: 429, data: { success: false, error: { code: 'TOO_MANY_LOGIN_ATTEMPTS', message } } },
    });
    expect(info.message).toBe(message);
  });
});
