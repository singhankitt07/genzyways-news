"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import WeatherWidget from "./WeatherWidget";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <WeatherWidget />
        <Link href="/account/login" className="text-xs font-semibold text-press hover:underline">Reader sign in</Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email?.split("@")[0] || "Reader";
  return (
    <div className="flex items-center gap-3">
      <WeatherWidget />
      <Link href="/account/profile" className="text-xs font-semibold text-ink hover:text-press">Hello, {name}</Link>
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[11px] text-ink/50 hover:text-press">Sign out</button>
    </div>
  );
}
