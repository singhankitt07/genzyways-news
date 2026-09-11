"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

export default function Ticker({ items }: { items: { title: string; slug: string }[] }) {
  const { t } = useLanguage();
  return (
    <div className="bg-press text-white overflow-hidden no-print">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-3 py-1.5 text-sm">
        <span className="font-semibold tracking-tight shrink-0 bg-white/15 px-2 py-0.5 rounded-sm">{t("breaking")}</span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-ticker">
            {items.map((item) => (
              <Link key={item.slug} href={`/article/${item.slug}`} className="mx-6 hover:underline">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
