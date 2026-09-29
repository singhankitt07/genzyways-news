"use client";

import { useTheme, ThemeChoice } from "./ThemeProvider";

function Icon({ type }: { type: ThemeChoice }) {
  if (type === "light") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>;
  if (type === "dark") return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5 8.5 8.5 0 1 0 20.5 14.5Z" /></svg>;
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 8h18M8 8v12" /></svg>;
}

const OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "default", label: "Default" }
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex items-center rounded-lg border border-line bg-surface p-1" aria-label="Choose color theme" role="group">
      {OPTIONS.map((option) => (
        <button key={option.value} type="button" aria-label={`${option.label} theme`} aria-pressed={theme === option.value} onClick={() => setTheme(option.value)} className={`inline-flex h-8 w-8 items-center justify-center rounded-md ${theme === option.value ? "bg-press text-on-accent" : "text-ink/70 hover:bg-surface-hover hover:text-ink"}`}>
          <Icon type={option.value} />
        </button>
      ))}
    </div>
  );
}