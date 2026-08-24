/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          500: '#2563eb', // Razorpay blue
          600: '#1d4ed8',
          700: '#1d4ed8',
        }
      }
    },
  },
  plugins: [],
}
