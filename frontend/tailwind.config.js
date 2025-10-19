/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'hedera': {
          50: '#f0fdf9',
          100: '#ccfbef',
          500: '#00D4AA',
          600: '#00B894',
          700: '#009876',
        },
        'medical': {
          50: '#eff6ff',
          500: '#1E3A8A',
          600: '#1e40af',
        }
      }
    },
  },
  plugins: [],
}
