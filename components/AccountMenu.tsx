"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/account/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-on-dark hover:underline"><svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" /></svg>Login</Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email?.split("@")[0] || "Reader";
  const isOwner = (session.user as { role?: string }).role === "ADMIN";
  return (
    <div className="flex items-center gap-3">
      <Link href="/account/profile" className="text-xs font-semibold text-ink hover:text-accent-on-dark">Hello, {name}</Link>
      {isOwner && <Link href="/admin" className="text-xs font-semibold text-accent-on-dark hover:underline">Owner workspace</Link>}
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[11px] text-ink/70 hover:text-accent-on-dark">Sign out</button>
    </div>
  );
}
