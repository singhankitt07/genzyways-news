import Link from "next/link";
import Logo from "./Logo";

export default function AdminSidebar() {
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <Logo iconOnly />
      <nav className="mt-10 space-y-1">
        <Link className="block rounded-lg bg-ink/10 px-3 py-3 font-medium" href="/admin">Dashboard</Link>
        <Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/articles/new">New Article</Link>
        <Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/media/new">Upload Media</Link>
      </nav>
    </aside>
  );
}