import Link from "next/link";

type BrandMarkProps = {
  compact?: boolean;
};

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      href="/"
      aria-label="GenzyWayNews home"
      className={`inline-flex items-center gap-2.5 ${compact ? "" : "group"}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 64 64"
        className={compact ? "h-10 w-10 shrink-0" : "h-12 w-12 shrink-0"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="64" height="64" rx="16" fill="var(--color-text-primary)" />
        <path d="M16 22.5C20.4 16.7 26.3 14 32.4 14c7.4 0 13.2 3.5 16.4 9.4" stroke="var(--color-link)" strokeWidth="3" strokeLinecap="round" />
        <path d="M20 28.5c3.1-3.3 7.2-5 12-5 5.5 0 9.7 2 12.5 5.7" stroke="var(--color-link)" strokeWidth="3" strokeLinecap="round" />
        <path d="M17 42h10.5V31.5H37V42h10" stroke="var(--color-background)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="32" cy="45.5" r="3" fill="var(--color-accent)" />
      </svg>
      {!compact && (
        <span className="leading-none">
          <span className="block font-serif text-2xl tracking-tight text-ink group-hover:text-press transition-colors">
            GenzyWayNews
          </span>
          <span className="mt-1 block text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
            Signal. Context. Now.
          </span>
        </span>
      )}
    </Link>
  );
}