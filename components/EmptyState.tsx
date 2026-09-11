"use client";
import { useLanguage } from "@/lib/i18n";

export default function EmptyState({ variant = "home" }: { variant?: "home" | "section" }) {
  const { t } = useLanguage();
  if (variant === "section") {
    return <p className="text-ink/60">{t("noSectionStories")}</p>;
  }
  return (
    <div className="py-24 text-center">
      <h1 className="font-serif text-3xl mb-2">{t("noStories")}</h1>
      <p className="text-ink/60">{t("noStoriesSub")}</p>
    </div>
  );
}
