import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#000000",
          teal: "#00BB9F",
          surface: "#F5F7FA",
          ink: "#1C1C1E",

          tealLight: "#E6F4F4",
          navyMid: "#152236",
          muted: "#6B7280",
          border: "#E4E8EE",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      transitionDuration: {
        DEFAULT: "200ms",
        slow: "250ms",
      },
      boxShadow: {
        card: "0 1px 4px 0 rgba(10,22,40,0.06), 0 1px 2px 0 rgba(10,22,40,0.04)",
        drawer: "0 -4px 24px 0 rgba(10,22,40,0.12)",
        bar: "0 -1px 0 0 #E4E8EE",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
