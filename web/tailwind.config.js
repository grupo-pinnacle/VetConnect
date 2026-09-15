/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          800: '#1e40af',
          900: '#1e3a8a', // Brand Primary
        },
        secondary: {
          500: '#14b8a6',
          600: '#0d9488', // Brand Secondary
        },
      },
    },
  },
  plugins: [],
};
