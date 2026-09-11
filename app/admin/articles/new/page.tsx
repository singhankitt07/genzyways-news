import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import ArticleForm from "@/components/ArticleForm";

export default async function NewArticlePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="font-serif text-2xl mb-6">New Article</h1>
      <ArticleForm />
    </div>
  );
}
