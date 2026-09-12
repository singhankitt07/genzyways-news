"use client";

import { useEffect, useState } from "react";

export default function LiveTimestamp({ value }: { value: Date | string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));
  return <>{minutes < 1 ? "just now" : `${minutes}m ago`}</>;
}
