/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // Stessi caratteri dell'app: Alumni Sans per i titoli, Nunito per il testo.
      fontFamily: {
        display: ['"Alumni Sans"', '"Arial Narrow"', "Impact", "sans-serif"],
        sans: ["Nunito", "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
      },
      colors: {
        paper: "#FFFFFF",
        surface: "#F4F4F2",
        peach: "#F4F4F2",
        orange: { DEFAULT: "#F27B0C", dark: "#D96A05", soft: "#FBD9B8" },
        ink: { DEFAULT: "#171512", 2: "#5A554B", 3: "#8C8677" },
        deep: "#16140F",
        rule: "#E7E5E0",
        primary: "#335DFF",
      },
      maxWidth: { site: "1120px", prose: "68ch" },
    },
  },
  plugins: [],
};
