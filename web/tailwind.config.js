/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f3faf8',
          100: '#d9e8e4',
          500: '#609f9c',
          600: '#4d8d89',
          800: '#315f5d',
          900: '#183c3a', // HuelliCam Brand Ink
        },
        secondary: {
          50: '#fffbef',
          100: '#f2eddd',
          500: '#609f9c',
          600: '#315f5d',
        },
      },
      fontFamily: {
        sans: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Manrope"', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
