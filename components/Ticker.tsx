"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import LiveTimestamp from "./LiveTimestamp";

export default function Ticker({ items }: { items: { title: string; slug: string; live?: boolean; updatedAt?: string }[] }) {
  const { t } = useLanguage();
  return (
    <div className="bg-press text-on-accent overflow-hidden no-print">
      <div className="max-w-6xl mx-auto px-4 flex items-center gap-3 py-1.5 text-sm">
        <span className="font-semibold tracking-tight shrink-0 rounded-sm bg-black/15 px-2 py-0.5">{t("breaking")}</span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="inline-block animate-ticker">
            {items.map((item) => (
              <Link key={item.slug} href={`/article/${item.slug}`} className="mx-6 hover:underline inline-flex items-center gap-2">
                {item.live && <span className="live-dot font-semibold text-[10px]">LIVE</span>}
                {item.title}
                {item.live && item.updatedAt && <time className="text-on-accent/80 text-xs">updated <LiveTimestamp value={item.updatedAt} /></time>}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
