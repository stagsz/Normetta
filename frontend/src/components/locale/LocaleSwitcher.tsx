'use client';

import { getLocale, getSupportedLocales, Locale } from '@/lib/locale';
import { useLocaleMessages } from '@/lib/i18n/landing-messages';
import { useRouter } from 'next/navigation';

export default function LocaleSwitcher() {
  const locale = getLocale();
  const t = useLocaleMessages();
  const router = useRouter();

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as Locale;
    try {
      localStorage.setItem('af-locale', next);
    } catch {
      // ignore
    }
    router.push(window.location.pathname + window.location.search);
  };

  return (
    <select
      value={locale}
      onChange={onChange}
      aria-label="Change language"
      className="locale-switcher"
    >
      {getSupportedLocales().map((loc) => (
        <option key={loc} value={loc}>
          {loc === 'sv' ? 'SV' : 'EN'}
        </option>
      ))}
    </select>
  );
}
