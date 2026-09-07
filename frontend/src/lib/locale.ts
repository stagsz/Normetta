'use client';

type Locale = 'sv' | 'en';

const SUPPORTED = ['sv', 'en'] as const;

function matchLocale(
  raw: string | undefined | null,
  fallback: Locale = 'sv'
): Locale {
  if (!raw) return fallback;
  const base = raw
    .toLowerCase()
    .split(',')[0]
    .split(';')[0]
    .trim();
  if (!base) return fallback;
  if (base.startsWith('sv')) return 'sv';
  if (base.startsWith('en')) return 'en';
  return fallback;
}

export function getLocale(): Locale {
  try {
    if (typeof window === 'undefined') return 'sv';
    const saved = localStorage.getItem('af-locale');
    if (saved === 'sv' || saved === 'en') return saved;
  } catch {
    // ignore storage access errors
  }
  return matchLocale(typeof navigator !== 'undefined' ? navigator.language : undefined);
}

export function getSupportedLocales(): readonly string[] {
  return [...SUPPORTED];
}

export type { Locale };
