import defaultColors from 'tailwindcss/colors.js';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Legacy indigo scale — kept for pages not yet migrated to the token system below.
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        accent: {
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
        },
        gold: {
          400: '#FCD34D',
          500: '#F59E0B',
          600: '#D97706',
          DEFAULT: 'rgb(var(--gold-rgb) / <alpha-value>)',
        },

        // New token system (design/DESIGN_HANDOFF.md) — CSS vars in src/styles/globals.css.
        // Use these on any newly migrated page. No hex/slate/gray literals on migrated pages.
        // rgb(var(--x-rgb) / <alpha-value>) — NOT plain var(--x) — so opacity modifiers like
        // bg-acc/20 actually generate; Tailwind can't apply slash-opacity to a bare var() hex string.
        bg: 'rgb(var(--bg-rgb) / <alpha-value>)',
        'bg-2': 'rgb(var(--bg-2-rgb) / <alpha-value>)',
        surface: 'rgb(var(--surf-rgb) / <alpha-value>)',
        'surface-2': 'rgb(var(--surf-2-rgb) / <alpha-value>)',
        raise: 'rgb(var(--raise-rgb) / <alpha-value>)',
        ink: 'rgb(var(--ink-rgb) / <alpha-value>)',
        body: 'rgb(var(--body-rgb) / <alpha-value>)',
        muted: 'rgb(var(--muted-rgb) / <alpha-value>)',
        faint: 'rgb(var(--faint-rgb) / <alpha-value>)',
        line: 'rgb(var(--line-rgb) / <alpha-value>)',
        'line-2': 'rgb(var(--line-2-rgb) / <alpha-value>)',
        acc: {
          DEFAULT: 'rgb(var(--acc-rgb) / <alpha-value>)',
          2: 'rgb(var(--acc-2-rgb) / <alpha-value>)',
          deep: 'rgb(var(--acc-deep-rgb) / <alpha-value>)',
        },
        // cyan/violet also exist as Tailwind's default palette scales (cyan-500 etc, used by
        // several not-yet-migrated pages) — merge our token in as DEFAULT instead of replacing
        // the whole scale, so both `text-cyan` (token) and `bg-cyan-500` (legacy) keep working.
        cyan: { ...defaultColors.cyan, DEFAULT: 'rgb(var(--cyan-rgb) / <alpha-value>)' },
        violet: { ...defaultColors.violet, DEFAULT: 'rgb(var(--violet-rgb) / <alpha-value>)' },
        mint: 'rgb(var(--mint-rgb) / <alpha-value>)',
        coral: 'rgb(var(--coral-rgb) / <alpha-value>)',
      },
      fontFamily: {
        sans:    ['ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        display: ['ui-sans-serif', 'system-ui', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
        mono:    ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace'],
      },
      boxShadow: {
        'acc-glow': '0 6px 22px -6px var(--acc-glow)',
        'acc-glow-lg': '0 10px 30px -6px var(--acc-glow)',
      },
      fontSize: {
        xs:   ['13px', { lineHeight: '1.5' }],
        sm:   ['14.5px', { lineHeight: '1.55' }],
        base: ['16px', { lineHeight: '1.65' }],
        lg:   ['18px', { lineHeight: '1.6' }],
        xl:   ['20px', { lineHeight: '1.5' }],
        '2xl':['24px', { lineHeight: '1.4' }],
        '3xl':['30px', { lineHeight: '1.3' }],
        '4xl':['36px', { lineHeight: '1.2' }],
        '5xl':['48px', { lineHeight: '1.1' }],
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease-out',
        'slide-up':  'slideUp 0.4s ease-out',
        'pulse-slow':'pulse 3s infinite',
        'float1':    'float1 9s ease-in-out infinite',
        'float2':    'float2 13s ease-in-out infinite',
        'float3':    'float3 11s ease-in-out infinite 2s',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float1:  { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(24px,-24px) scale(1.04)' } },
        float2:  { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '50%': { transform: 'translate(-20px,20px) scale(1.03)' } },
        float3:  { '0%,100%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(12px,-12px)' } },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
