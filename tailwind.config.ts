/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class", // ⬅️ for theme switching
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#121063",
        cyberpunk: "#ff007c",
        terminal: "#0f0",
        luxe: "#b8a1ff",
      },
    },
  },
  plugins: [],
};

export default config;
