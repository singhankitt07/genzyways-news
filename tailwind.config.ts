import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-text-primary)",
        paper: "var(--color-background)",
        surface: "var(--color-surface)",
        footer: "var(--color-footer-background)",
        press: "var(--color-accent)",
        gold: "var(--color-link)",
        line: "var(--color-border)"
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Georgia", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
export default config;
