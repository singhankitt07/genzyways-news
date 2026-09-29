import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--color-text-primary)",
        paper: "var(--color-background)",
        background: "var(--bg)",
        surface: "var(--color-surface)",
        "surface-hover": "var(--surface-hover)",
        footer: "var(--color-footer-background)",
        "footer-text": "var(--color-footer-text)",
        "footer-muted": "var(--color-footer-muted)",
        "footer-border": "var(--color-footer-border)",
        press: "var(--color-accent)",
        "accent-on-dark": "var(--accent-text-on-dark)",
        "on-accent": "var(--on-accent)",
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
