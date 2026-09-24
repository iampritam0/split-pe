/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        splitpe: {
          50: "#eefbf5",
          100: "#d7f5e6",
          200: "#b0ebce",
          300: "#7cdbb0",
          400: "#45c78d",
          500: "#20b576",
          600: "#15935e",
          700: "#12754d",
          800: "#125d40",
          900: "#104d36",
        },
      },
      boxShadow: {
        soft: "0 10px 40px rgba(15, 23, 42, 0.08)",
        card: "0 20px 60px rgba(15, 23, 42, 0.10)",
      },
      maxWidth: {
        "8xl": "90rem",
      },
    },
  },
  plugins: [],
};