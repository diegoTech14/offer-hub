import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Roboto", "Outfit", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#149A9B",
          hover: "#0d7377",
        },
        secondary: "#002333",
        accent: "#15949C",
        background: "#F1F3F7",
        "text-primary": "#19213D",
        "text-secondary": "#6D758F",
        success: "#16a34a",
        warning: "#d97706",
        error: "#FF0000",
      },
      keyframes: {
        fadeInUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 400ms ease-out both",
        fadeIn: "fadeIn 300ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
