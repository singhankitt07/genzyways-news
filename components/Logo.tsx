import Link from "next/link";

type LogoProps = {
  iconOnly?: boolean;
  className?: string;
};

export default function Logo({ iconOnly = false, className = "" }: LogoProps) {
  return (
    <Link href="/" aria-label="GenzyWays News" className={`brand-logo ${iconOnly ? "brand-logo-icon-only" : ""} ${className}`}>
      <span className="brand-logo-full" aria-hidden="true">
        <img className="brand-logo-dark" src="/brand/GenzyWays News-logo-dark.svg" alt="" />
        <img className="brand-logo-light" src="/brand/GenzyWays News-logo-light.svg" alt="" />
      </span>
      <span className="brand-logo-icon" aria-hidden="true"><img src="/brand/GenzyWays News-icon.svg" alt="" /></span>
    </Link>
  );
}
