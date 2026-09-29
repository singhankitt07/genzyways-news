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
        <path d="M47.5 21.5c-4.25-5-9.75-7.5-16.5-7.5-11.5 0-19.75 7.5-19.75 18.25S19.5 50.5 31 50.5c6.25 0 11.75-2 16-6V34.75H33.5" fill="none" stroke="var(--color-background)" strokeWidth="7" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M17.75 22.75h26l-22 18.75h24.5" fill="none" stroke="var(--color-accent)" strokeWidth="5.5" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M46.75 12.5c3 1.25 5.5 2.75 7.75 5M48.25 8.25c4 1.5 7.25 3.75 10 6.75" fill="none" stroke="#F5A623" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50.25" cy="47" r="2.5" fill="#F5A623" />
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