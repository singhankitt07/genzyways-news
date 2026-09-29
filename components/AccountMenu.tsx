"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function PersonIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
}

export default function AccountMenu({ mobile = false }: { mobile?: boolean }) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session?.user) {
    if (mobile) {
      return <Link href="/account/login" className="mobile-account-button"><PersonIcon /><span>Sign in</span></Link>;
    }

    return (
      <div className="flex items-center gap-3">
        <Link href="/account/login" className="text-xs font-semibold text-ink hover:text-press">Login</Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email?.split("@")[0] || "Reader";
  const isOwner = (session.user as { role?: string }).role === "ADMIN";
  if (mobile) {
    return <Link href="/account/profile" className="mobile-account-button"><PersonIcon /><span>Account</span></Link>;
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/account/profile" className="text-xs font-semibold text-ink hover:text-accent-on-dark">Hello, {name}</Link>
      {isOwner && <Link href="/admin" className="text-xs font-semibold text-accent-on-dark hover:underline">Owner workspace</Link>}
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[11px] text-ink/70 hover:text-accent-on-dark">Sign out</button>
    </div>
  );
}
