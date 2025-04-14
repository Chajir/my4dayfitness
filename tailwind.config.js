/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/react-calendar/dist/*.css" // optional: makes sure calendar styles are included
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
