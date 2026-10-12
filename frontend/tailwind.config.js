/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moon: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          500: '#0284c7',
          600: '#0066cc', // Màu xanh thương hiệu Moon.vn
          700: '#0052a3',
          800: '#074282',
          orange: '#ff6600', // Màu cam điểm nhấn Moon.vn
          gold: '#f59e0b',
        }
      }
    },
  },
  plugins: [],
}
