import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole } from "@/lib/auth";
import { redirect } from "next/navigation";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) redirect(session ? "/" : "/admin/login");

  return (
    <div className="admin-page py-8">
      <h1 className="font-serif text-2xl mb-6">New Article</h1>
      <ArticleForm />
    </div>
  );
}
