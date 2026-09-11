"use client";
import { useLanguage } from "@/lib/i18n";

export default function PrintButton() {
  const { t } = useLanguage();
  return (
    <button
      onClick={() => window.print()}
      className="h-8 px-3 flex items-center gap-1.5 border border-line text-xs hover:bg-ink hover:text-white transition-colors no-print"
    >
      🖨️ {t("downloadPdf")}
    </button>
  );
}
