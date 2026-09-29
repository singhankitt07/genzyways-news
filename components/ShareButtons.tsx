"use client";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n";

export default function ShareButtons({ title, path }: { title: string; path: string }) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  // Built at click-time so it always reflects the actual deployed domain, not a hardcoded one.
  function fullUrl() {
    if (typeof window === "undefined") return path;
    return `${window.location.origin}${path}`;
  }

  const links = [
    {
      label: "WhatsApp",
      href: () => `https://wa.me/?text=${encodeURIComponent(title + " " + fullUrl())}`,
      icon: "💬"
    },
    {
      label: "X",
      href: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(fullUrl())}`,
      icon: "𝕏"
    },
    {
      label: "Facebook",
      href: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl())}`,
      icon: "f"
    },
    {
      label: "LinkedIn",
      href: () => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl())}`,
      icon: "in"
    }
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — silently ignore, user can still use the share buttons
    }
  }

  return (
    <div className="flex max-w-full flex-wrap items-center gap-2 no-print">
      <span className="text-xs uppercase tracking-wide text-ink/50 mr-1">{t("share")}</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${l.label}`}
          className="button-secondary h-8 w-8 p-0 text-sm"
        >
          {l.icon}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="button-secondary h-8 px-3 text-xs"
      >
        {copied ? "Copied!" : "Copy link"}
      </button>
    </div>
  );
}
