"use client";
import Link from "next/link";
import { signOut } from "next-auth/react";
import BrandMark from "./BrandMark";

export default function AdminNav() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4 mb-8">
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-4">
          <BrandMark compact />
          <Link href="/admin" className="font-serif text-2xl">Newsroom</Link>
        </div>
        <Link href="/admin/articles/new" className="text-sm text-press font-semibold">+ New Article</Link>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <Link href="/" className="text-ink/60 hover:text-ink">View site</Link>
        <button onClick={() => signOut({ callbackUrl: "/" })} className="text-ink/60 hover:text-ink">
          Sign out
        </button>
      </div>
    </div>
  );
}
