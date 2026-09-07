'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

/**
 * Cloudflare Turnstile widget (explicit render).
 *
 * Renders nothing when NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, so local
 * development works without a Cloudflare account. The backend mirrors this:
 * it only enforces the token when TURNSTILE_SECRET_KEY is configured.
 *
 * Tokens are single-use and expire after five minutes. Mount this next to the
 * button that performs the protected request, and bump `resetKey` after a
 * failed submit so the widget issues a fresh token.
 */

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '';
export const turnstileEnabled = TURNSTILE_SITE_KEY.length > 0;

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'expired-callback'?: () => void;
  'error-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact' | 'flexible';
}

interface TurnstileApi {
  render: (el: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileProps {
  /** Called with a fresh token, or null when the token expires or errors. */
  onToken: (token: string | null) => void;
  /** Change this value to reset the widget and clear the current token. */
  resetKey?: number;
  className?: string;
}

export default function Turnstile({ onToken, resetKey = 0, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onTokenRef = useRef(onToken);
  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  const renderWidget = () => {
    const el = containerRef.current;
    const api = window.turnstile;
    if (!el || !api || widgetIdRef.current !== null) return;
    widgetIdRef.current = api.render(el, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: 'auto',
      size: 'flexible',
      callback: (token) => onTokenRef.current(token),
      'expired-callback': () => onTokenRef.current(null),
      'error-callback': () => onTokenRef.current(null),
    });
  };

  // The script may already be present (returning to this step, or another
  // widget on the page loaded it), in which case next/script's onLoad will
  // not fire again. Render immediately if the API is available.
  useEffect(() => {
    if (!turnstileEnabled) return;
    renderWidget();
    return () => {
      const id = widgetIdRef.current;
      if (id !== null && window.turnstile) {
        try {
          window.turnstile.remove(id);
        } catch {
          // Widget already gone; nothing to clean up.
        }
      }
      widgetIdRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (resetKey === 0) return;
    const id = widgetIdRef.current;
    if (id !== null && window.turnstile) {
      window.turnstile.reset(id);
      onTokenRef.current(null);
    }
  }, [resetKey]);

  if (!turnstileEnabled) return null;

  return (
    <>
      <Script src={SCRIPT_SRC} strategy="afterInteractive" onLoad={renderWidget} />
      <div ref={containerRef} className={className} data-testid="turnstile" />
    </>
  );
}
