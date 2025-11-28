/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#46C2FF',
        secondary: '#11131A',
        accent: '#F8D94A'
      }
    }
  },
  plugins: [],
  darkMode: 'class'
};
