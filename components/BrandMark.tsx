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
        <path d="M49 25c-4.5-6-11.5-9.5-19-9.5-13.5 0-23 8.5-23 20.5s9.5 20.5 23 20.5c7.5 0 14.5-3 19-8.5V37H32" fill="none" stroke="var(--color-background)" strokeWidth="8" strokeLinecap="square" strokeLinejoin="round" />
        <path d="M44 19c4 1.7 7.2 4.1 10 7.3M48 14c4.8 2 8.9 4.8 12 8.7" fill="none" stroke="var(--color-accent)" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="49" cy="47" r="2.8" fill="#F5A623" />
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