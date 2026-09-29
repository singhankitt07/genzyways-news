"use client";
import { useLanguage } from "@/lib/i18n";

export default function PrintButton() {
  const { t } = useLanguage();
  return (
    <button
      onClick={() => window.print()}
      className="button-secondary h-8 gap-1.5 px-3 text-xs no-print"
    >
      🖨️ {t("downloadPdf")}
    </button>
  );
}
