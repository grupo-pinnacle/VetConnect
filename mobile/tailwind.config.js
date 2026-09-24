/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#0284C7',
        ink: '#0F172A',
        muted: '#64748B',
        faint: '#94A3B8',
        canvas: '#F8FAFC',
        line: '#E2E8F0',
        danger: '#EF4444',
        amber: '#F59E0B',
        ok: '#10B981',
      },
    },
  },
  plugins: [],
};
