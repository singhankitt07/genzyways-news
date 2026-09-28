"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export default function AccountMenu() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/account/login" className="text-xs font-semibold text-press hover:underline">Reader sign in</Link>
        <Link href="/admin/login" className="text-xs font-semibold text-ink hover:text-press">Admin Login</Link>
      </div>
    );
  }

  const name = session.user.name || session.user.email?.split("@")[0] || "Reader";
  const isOwner = (session.user as { role?: string }).role === "ADMIN";
  return (
    <div className="flex items-center gap-3">
      <Link href="/account/profile" className="text-xs font-semibold text-ink hover:text-press">Hello, {name}</Link>
      {isOwner && <Link href="/admin" className="text-xs font-semibold text-press hover:underline">Owner workspace</Link>}
      <button onClick={() => signOut({ callbackUrl: "/" })} className="text-[11px] text-ink/50 hover:text-press">Sign out</button>
    </div>
  );
}
