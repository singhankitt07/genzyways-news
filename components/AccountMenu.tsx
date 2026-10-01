"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

function PersonIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></svg>;
}

export default function AccountMenu({ mobile = false, mobileMenu = false, onNavigate }: { mobile?: boolean; mobileMenu?: boolean; onNavigate?: () => void }) {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session?.user) {
    if (mobileMenu) return <Link onClick={onNavigate} href="/account/login" className="mega-menu-link">Sign in</Link>;
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
  const role = (session.user as { role?: string }).role;
  const isStaff = role === "ADMIN" || role === "EDITOR" || role === "MODERATOR";
  if (mobileMenu) {
    return <div className="mega-account-actions">
      <Link onClick={onNavigate} href="/account/profile" className="mega-menu-link">Account</Link>
      {isStaff && <Link onClick={onNavigate} href="/admin" className="mega-menu-link">Newsroom workspace</Link>}
      <button type="button" onClick={() => { onNavigate?.(); void signOut({ callbackUrl: "/" }); }} className="mega-menu-link text-left">Sign out</button>
    </div>;
  }
  if (mobile) {
    return <div className="mobile-account-controls">
      <Link href="/account/profile" className="mobile-account-button"><PersonIcon /><span>Account</span></Link>
      <button type="button" onClick={() => { void signOut({ callbackUrl: "/" }); }} className="mobile-account-signout">Sign out</button>
    </div>;
  }
  return (
    <div className="flex items-center gap-3">
      <Link href="/account/profile" className="text-xs font-semibold text-ink hover:text-accent-on-dark">Hello, {name}</Link>
      {isStaff && <Link href="/admin" className="text-xs font-semibold text-accent-on-dark hover:underline">Newsroom workspace</Link>}
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[11px] text-ink/70 hover:text-accent-on-dark">Sign out</button>
    </div>
  );
}
