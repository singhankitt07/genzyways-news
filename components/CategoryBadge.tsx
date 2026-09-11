"use client";
import Link from "next/link";
import { useLanguage, translateCategory, categorySlugFor } from "@/lib/i18n";

export default function CategoryBadge({ category }: { category: string }) {
  const { lang } = useLanguage();
  return (
    <Link
      href={`/category/${categorySlugFor(category)}`}
      className="text-xs uppercase tracking-wide text-press font-semibold hover:underline"
    >
      {translateCategory(category, lang)}
    </Link>
  );
}
