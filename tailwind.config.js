/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0A0A0B", 900: "#111113", 800: "#18181B", 700: "#222226", 600: "#2E2E33" },
        mute: "#8E8E96",
        hot: "#FF3D6E",
        violet: "#7B3BFF",
        go: "#3DDC97",
      },
      fontFamily: {
        display: ['"Barlow Condensed"', "system-ui", "sans-serif"],
        sans: ['Inter', "system-ui", "-apple-system", "sans-serif"],
      },
      backgroundImage: {
        brand: "linear-gradient(135deg, #FF3D6E 0%, #7B3BFF 100%)",
      },
    },
  },
  plugins: [],
};
