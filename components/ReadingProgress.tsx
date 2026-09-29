"use client";

import { useEffect, useState } from "react";

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const header = document.querySelector<HTMLElement>(".masthead");
    const article = document.querySelector<HTMLElement>(".article-paper-card");

    function update() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const headerOffset = Math.max(0, header?.getBoundingClientRect().bottom || 0);
        document.documentElement.style.setProperty("--reading-header-offset", `${headerOffset}px`);
        if (!article) return;
        const articleTop = article.getBoundingClientRect().top + window.scrollY;
        const scrollStart = articleTop - headerOffset;
        const scrollRange = Math.max(1, article.offsetHeight - window.innerHeight + headerOffset);
        const amount = Math.max(0, Math.min(1, (window.scrollY - scrollStart) / scrollRange));
        setProgress(Math.round(amount * 100));
      });
    }

    const observer = header && "ResizeObserver" in window ? new ResizeObserver(update) : null;
    if (header) observer?.observe(header);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="reading-progress" role="progressbar" aria-label="Article reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
      <div className="reading-progress-fill" style={{ transform: `scaleX(${progress / 100})` }} />
    </div>
  );
}