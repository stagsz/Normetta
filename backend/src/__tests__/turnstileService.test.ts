import { verifyTurnstileToken } from '../services/turnstileService';
import { AppError } from '../utils/errors';

type FetchLike = typeof fetch;

function mockFetch(body: unknown, ok = true): jest.MockedFunction<FetchLike> {
  return jest.fn(async () => ({
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  })) as unknown as jest.MockedFunction<FetchLike>;
}

describe('verifyTurnstileToken', () => {
  it('skips verification when no secret is configured', async () => {
    const fetchImpl = mockFetch({ success: false });
    await expect(
      verifyTurnstileToken(undefined, undefined, { secret: '', fetchImpl })
    ).resolves.toEqual({ skipped: true });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('rejects a missing token without calling Cloudflare', async () => {
    const fetchImpl = mockFetch({ success: true });
    await expect(
      verifyTurnstileToken(undefined, '1.2.3.4', { secret: 's3cret', fetchImpl })
    ).rejects.toMatchObject({ statusCode: 403, code: 'TURNSTILE_FAILED' });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('posts secret, token and remote ip to siteverify and resolves on success', async () => {
    const fetchImpl = mockFetch({ success: true, 'error-codes': [] });
    await expect(
      verifyTurnstileToken('tok', '1.2.3.4', { secret: 's3cret', fetchImpl })
    ).resolves.toEqual({ skipped: false });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      secret: 's3cret',
      response: 'tok',
      remoteip: '1.2.3.4',
    });
  });

  it('rejects with 403 and surfaces Cloudflare error codes on failure', async () => {
    const fetchImpl = mockFetch({ success: false, 'error-codes': ['timeout-or-duplicate'] });
    const err = await verifyTurnstileToken('tok', undefined, { secret: 's3cret', fetchImpl }).catch(
      (e) => e as AppError
    );
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).statusCode).toBe(403);
    expect((err as AppError).details).toEqual({ codes: ['timeout-or-duplicate'] });
  });

  it('treats a Cloudflare 5xx as an outage, not a failed challenge', async () => {
    const fetchImpl = mockFetch({ success: false }, false);
    await expect(
      verifyTurnstileToken('tok', undefined, { secret: 's3cret', fetchImpl })
    ).rejects.toMatchObject({ statusCode: 503, code: 'TURNSTILE_UNAVAILABLE' });
  });

  it('bounds the siteverify request with a timeout signal', async () => {
    const fetchImpl = mockFetch({ success: true });
    await verifyTurnstileToken('tok', undefined, { secret: 's3cret', fetchImpl });
    const [, init] = fetchImpl.mock.calls[0];
    expect(init?.signal).toBeInstanceOf(AbortSignal);
  });

  it('fails closed when Cloudflare is unreachable', async () => {
    const fetchImpl = jest.fn(async () => {
      throw new Error('network down');
    }) as unknown as FetchLike;
    await expect(
      verifyTurnstileToken('tok', undefined, { secret: 's3cret', fetchImpl })
    ).rejects.toMatchObject({ statusCode: 503, code: 'TURNSTILE_UNAVAILABLE' });
  });
});
