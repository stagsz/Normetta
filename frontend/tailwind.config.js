/** @type {import('tailwindcss').Config} */
// "Precision instrument" dark theme.
// Ramps here mirror auditflow-design-system/tokens/colors.css — the design
// system is the source of truth; prefer var(--*) tokens in new code.
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        // Ink grounds (teal-biased near-blacks)
        ink: {
          0: '#070D0F',
          1: '#0C1619',
          2: '#122024',
          3: '#182A2F',
        },
        // Brand teal — mint kept as alias name for existing classes
        mint: {
          50: '#ECFDF9',
          100: '#CBF7EE',
          200: '#9BEDE0',
          300: '#7EE8DC',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        brass: {
          300: '#E5C285',
          500: '#C8A45C',
          700: '#97783D',
        },
        // Text-role aliases (theme-aware); navy-* kept as legacy alias so
        // existing text-navy-800 etc. resolve to the current theme's text
        navy: {
          600: 'var(--text-muted)',
          700: 'var(--text-body)',
          800: 'var(--text-strong)',
          900: 'var(--text-strong)',
        },
        surface: 'var(--surface-page)',
        card: 'var(--surface-card)',
        // Semantic status — theme-aware: 50/100 tint + line, 500 solid,
        // 600/700 foreground text; 300/400 fixed mid pigments
        success: {
          50: 'var(--status-pass-bg)',
          100: 'var(--status-pass-line)',
          300: '#A8D5AA',
          400: '#7DBA80',
          500: 'var(--status-pass-solid)',
          600: 'var(--status-pass-fg)',
          700: 'var(--status-pass-fg)',
        },
        warning: {
          50: 'var(--status-obs-bg)',
          100: 'var(--status-obs-line)',
          300: '#E5C285',
          400: '#D4A54E',
          500: 'var(--status-obs-solid)',
          600: 'var(--status-obs-fg)',
          700: 'var(--status-obs-fg)',
        },
        danger: {
          50: 'var(--status-fail-bg)',
          100: 'var(--status-fail-line)',
          300: '#EBA9A1',
          400: '#D97B72',
          500: 'var(--status-fail-solid)',
          600: 'var(--status-fail-fg)',
          700: 'var(--status-fail-fg)',
        },
        info: {
          50: 'var(--info-bg)',
          100: 'var(--info-line)',
          300: '#A9C4D4',
          400: '#7FA6BC',
          500: '#5B8CA8',
          600: 'var(--info-fg)',
          700: 'var(--info-fg)',
        },
        compliance: {
          high: '#5FA463',
          medium: '#C5891B',
          low: '#C4574E',
        },
        // CSS variable-driven tokens
        background: 'var(--surface-page)',
        foreground: 'var(--text-body)',
        // Legacy compat aliases
        primary: {
          50: '#ECFDF9',
          100: '#CBF7EE',
          200: '#9BEDE0',
          300: '#7EE8DC',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
      },
      boxShadow: {
        'soft-1': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 1px 2px rgba(0,0,0,0.35)',
        'soft-2': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 2px 4px rgba(0,0,0,0.35), 0 10px 24px rgba(0,0,0,0.35)',
        'soft-3': 'inset 0 1px 0 rgba(255,255,255,0.07), 0 4px 8px rgba(0,0,0,0.4), 0 24px 56px rgba(0,0,0,0.5)',
        'inner-soft': 'inset 0 1px 3px rgba(0,0,0,0.4)',
        'mint-glow': '0 8px 24px rgba(20, 184, 166, 0.18)',
        'mint-glow-lg': '0 12px 40px rgba(20, 184, 166, 0.28)',
      },
      borderRadius: {
        'pill': '9999px',
        'card': '1rem',
        'crown': '1.5rem',
        'crown-lg': '2rem',
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'enter': 'enter 0.2s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        enter: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
