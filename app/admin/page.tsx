import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminNav from "@/components/AdminNav";
import ArticleRow from "@/components/ArticleRow";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");

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
