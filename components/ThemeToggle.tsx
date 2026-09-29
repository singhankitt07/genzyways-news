"use client";

import { useTheme, ThemeChoice } from "./ThemeProvider";

function Icon({ type }: { type: ThemeChoice }) {
  if (type === "light") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>;
  if (type === "sepia") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v18H6.5A2.5 2.5 0 0 0 4 23V5.5Zm16 0A2.5 2.5 0 0 0 17.5 3H12v18h5.5a2.5 2.5 0 0 1 2.5 2V5.5Z" /></svg>;
  if (type === "dark") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 0 0 16Z" /></svg>;
}

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "sepia", label: "Sepia" },
  { value: "dark", label: "Dark" },
  { value: "auto", label: "Auto" }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="theme-switcher flex items-center rounded-md border border-line bg-surface p-1" aria-label="Choose color theme" role="group">
      {OPTIONS.map((option) => (
        <button key={option.value} type="button" title={`${option.label} theme`} aria-label={`${option.label} theme`} aria-pressed={theme === option.value} onClick={() => setTheme(option.value)} className={`tap-target inline-flex h-11 items-center justify-center rounded-sm ${theme === option.value ? "bg-press text-on-accent" : "text-ink hover:bg-surface-hover"}`}>
          <Icon type={option.value} />
        </button>
      ))}
    </div>
  );
}