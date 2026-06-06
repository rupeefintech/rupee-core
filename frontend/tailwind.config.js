/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E293B',
          900: '#0F172A',
          950: '#080F1E',
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
        },
      },
      fontFamily: {
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        base: ['16px', { lineHeight: '1.6' }],
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
