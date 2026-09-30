import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions, isAdminSession } from "@/lib/auth";
import AdminEbookManager from "@/components/AdminEbookManager";

export default async function AdminEbooksPage() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");

  return (
    <div className="admin-page py-8">
      <div className="mb-8">
        <p className="section-kicker mb-2">Publishing tools</p>
        <h2 className="font-serif text-3xl">Guides & eBooks</h2>
        <p className="mt-2 text-sm text-muted">Publish reviewed reader guides in PDF or EPUB format.</p>
      </div>
      <AdminEbookManager />
    </div>
  );
}