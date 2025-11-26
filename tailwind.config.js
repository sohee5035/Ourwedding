/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 웨딩 테마 컬러
        blush: {
          50: '#FFF5F7',
          100: '#FFE4E8',
          200: '#FFC1CC',
          300: '#FF9DB0',
          400: '#FF7A94',
          500: '#FF5678',
          600: '#E63E5C',
          700: '#CC2640',
        },
        gold: {
          50: '#FFFEF7',
          100: '#F9F5E3',
          200: '#F0E68C',
          300: '#E8D56A',
          400: '#D4AF37',
          500: '#C5A028',
          600: '#B8921A',
        },
        ivory: '#FFFEF7',
        lavender: {
          50: '#F9F7FF',
          100: '#E6E6FA',
          200: '#D4D4F5',
          300: '#C2C2F0',
        }
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
