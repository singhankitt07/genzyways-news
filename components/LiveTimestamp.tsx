"use client";

import { useEffect, useState } from "react";

export default function LiveTimestamp({ value }: { value: Date | string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const minutes = Math.max(0, Math.floor((now - new Date(value).getTime()) / 60000));
  if (minutes < 1) return <>just now</>;
  if (minutes < 60) return <>{minutes}m ago</>;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return <>{hours}h ago</>;
  const days = Math.floor(hours / 24);
  return <>{days}d ago</>;
}
