import Link from "next/link";

export default function HindiNewsLink() {
  return <div className="flex items-center gap-3">
    <Link href="/hindi" className="hindi-news-link text-xs font-semibold text-ink hover:text-press">हिंदी न्यूज़</Link>
    <Link href="/ebooks" className="text-xs font-semibold text-ink hover:text-press">Guides & eBooks</Link>
  </div>;
}