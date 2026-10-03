"use client";

import { useEffect } from "react";

// Counts one view per browser tab session. Runs after hydration, so crawlers and prefetches that don't execute JS aren't counted.
export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    const key = `viewed:${articleId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch { /* storage blocked: count anyway */ }
    fetch(`/api/articles/${articleId}/view`, { method: "POST", keepalive: true }).catch(() => undefined);
  }, [articleId]);
  return null;
}
