/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#050308',
        surface: '#0f0a16',
        brand: {
          DEFAULT: '#a855f7',
          strong: '#7c3aed',
        },
      },
      keyframes: {
        'hero-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'hero-scroll': 'hero-scroll 40s linear infinite',
      },
    },
  },
  plugins: [],
};
