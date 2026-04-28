/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        orange: {
          DEFAULT: '#F5821F',
          light: '#FEF0E3',
          dark: '#C4610A',
        },
        caramel: {
          DEFAULT: '#8B5E3C',
          light: '#F7EEE4',
          dark: '#5C3A1E',
        },
        cream: '#FDF8F3',
        border: '#E8D5C0',
      },
      fontFamily: {
        playfair: ['"Playfair Display"', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
