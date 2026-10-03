import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession, hasStaffRole } from "@/lib/auth";
import Logo from "./Logo";

export default async function AdminSidebar() {
  const session = await getServerSession(authOptions);
  const isAdmin = isAdminSession(session);
  const canEdit = hasStaffRole(session, ["ADMIN", "EDITOR"]);
  const canModerate = hasStaffRole(session, ["ADMIN", "MODERATOR"]);
  return (
    <aside className="admin-sidebar" aria-label="Admin navigation">
      <Logo iconOnly />
      <nav className="mt-10 space-y-1">
        {canEdit && <><Link className="block rounded-lg bg-ink/10 px-3 py-3 font-medium" href="/admin">Dashboard</Link><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/articles/new">New Article</Link><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/ai-news">AI News</Link></>}
        {isAdmin && <><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/media">Media Library</Link><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/ebooks">Guides & eBooks</Link><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/staff">Staff & roles</Link><Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/newsletter">Newsletter</Link></>}
        {canModerate && <Link className="block rounded-lg px-3 py-3 font-medium hover:bg-ink/10" href="/admin/comment-reports">Comment Reports</Link>}
      </nav>
    </aside>
  );
}