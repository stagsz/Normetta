import { config } from '../config';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const SITEVERIFY_TIMEOUT_MS = 10_000;

/** Action name set on the widget; siteverify echoes it and we require a match. */
export const TURNSTILE_SIGNUP_ACTION = 'signup';

interface SiteVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
  action?: string;
}

interface VerifyOptions {
  /** Defaults to TURNSTILE_SECRET_KEY. Injected in tests. */
  secret?: string;
  /** Defaults to TURNSTILE_ALLOWED_HOSTNAMES. Injected in tests. */
  allowedHostnames?: string[];
  /** Expected widget action. Defaults to the signup action. */
  expectedAction?: string;
  /** Defaults to global fetch. Injected in tests. */
  fetchImpl?: typeof fetch;
}

export interface TurnstileVerifyResult {
  /** True when no secret is configured and the check was not performed. */
  skipped: boolean;
}

let warnedDisabled = false;

export function isTurnstileEnabled(): boolean {
  return config.turnstile.secretKey.length > 0;
}

function reject(codes: string[], remoteIp: string | undefined): never {
  logger.warn('Turnstile verification rejected', { codes, remoteIp });
  throw new AppError('Human verification failed. Please try again.', 403, 'TURNSTILE_FAILED', { codes });
}

/**
 * Server-side Cloudflare Turnstile verification for the trial-signup flow.
 *
 * Tokens are single-use and expire after five minutes, so callers verify
 * immediately before creating the account. A missing or rejected token, a
 * token minted for another action, or a token from an unexpected hostname is
 * a 403. A Cloudflare outage is a 503, so a bot cannot get through by
 * knocking the verifier over. When no secret is configured the check is
 * skipped so local development and tests need no Cloudflare account.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string | undefined,
  options: VerifyOptions = {}
): Promise<TurnstileVerifyResult> {
  const secret = options.secret ?? config.turnstile.secretKey;
  const allowedHostnames = options.allowedHostnames ?? config.turnstile.allowedHostnames;
  const expectedAction = options.expectedAction ?? TURNSTILE_SIGNUP_ACTION;
  const fetchImpl = options.fetchImpl ?? fetch;

  if (!secret) {
    if (!warnedDisabled) {
      warnedDisabled = true;
      logger.warn('TURNSTILE_SECRET_KEY not set: signup bot verification is disabled');
    }
    return { skipped: true };
  }

  if (!token) {
    throw new AppError('Human verification required', 403, 'TURNSTILE_FAILED', {
      codes: ['missing-input-response'],
    });
  }

  let result: SiteVerifyResponse;
  try {
    const res = await fetchImpl(SITEVERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token, remoteip: remoteIp }),
      // Bound the wait so a blackholed connection surfaces as a 503 rather
      // than holding the serverless invocation until the platform timeout.
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    if (!res.ok) {
      // A Cloudflare 5xx is an outage on their side, not a failed challenge.
      throw new Error(`siteverify responded ${res.status}`);
    }
    result = (await res.json()) as SiteVerifyResponse;
  } catch (err) {
    logger.error('Turnstile siteverify request failed', { error: (err as Error).message });
    throw new AppError('Human verification is temporarily unavailable', 503, 'TURNSTILE_UNAVAILABLE');
  }

  if (!result.success) {
    reject(result['error-codes'] ?? [], remoteIp);
  }

  if (result.action !== expectedAction) {
    reject(['action-mismatch'], remoteIp);
  }

  const hostname = (result.hostname ?? '').toLowerCase();
  if (allowedHostnames.length > 0 && !allowedHostnames.includes(hostname)) {
    reject(['hostname-mismatch'], remoteIp);
  }

  return { skipped: false };
}
