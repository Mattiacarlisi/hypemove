/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#335DFF",
        accent: "#FFFF33",
      },
      borderRadius: {
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
