/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        fairway: {
          950: '#071510',
          900: '#0f2318',
          800: '#1a3d2b',
          700: '#245236',
          600: '#2d6a4f',
          500: '#3a8a65',
          400: '#52b788',
          300: '#74c69d',
          200: '#95d5b2',
          100: '#b7e4c7',
        },
        gold: {
          700: '#a07c1a',
          600: '#c4972a',
          500: '#d4af37',
          400: '#e0c050',
          300: '#edd068',
          200: '#f5e090',
          100: '#faf0c0',
        },
        rough: {
          900: '#1c1c1c',
          800: '#2a2a2a',
          700: '#3d3d3d',
        },
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-gold': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
