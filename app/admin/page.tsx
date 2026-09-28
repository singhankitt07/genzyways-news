import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import ArticleRow from "@/components/ArticleRow";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  if (!isAdminSession(session)) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-gold font-semibold mb-3">Access denied</p>
        <h1 className="font-serif text-4xl mb-4">You are not authorized to access the Admin Panel.</h1>
        <p className="text-ink/60 mb-8">Please sign in with an administrator account to continue.</p>
        <a href="/admin/login" className="inline-block bg-ink text-white px-5 py-3">Return to admin login</a>
      </div>
    );
  }

  const articles = await prisma.article.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="py-8">
      <AdminNav />
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Owner workspace</p>
        <p className="text-sm text-ink/60 mt-1">Review, edit, publish, or remove any story from one place.</p>
      </div>
      {articles.length === 0 ? (
        <p className="text-ink/60">No articles yet. Create your first one.</p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-ink/50">
              <th className="py-2 font-medium">Title</th>
              <th className="py-2 font-medium">Category</th>
              <th className="py-2 font-medium">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {articles.map((a) => (
              <ArticleRow
                key={a.id}
                id={a.id}
                title={a.title}
                category={a.category}
                published={a.published}
                breaking={a.breaking}
                createdAt={a.createdAt.toISOString()}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
