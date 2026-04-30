/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
          800: '#5B21B6',
          900: '#4C1D95',
          950: '#2E1065',
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
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
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
