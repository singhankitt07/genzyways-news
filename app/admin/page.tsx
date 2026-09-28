import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminNav from "@/components/AdminNav";
import ArticleRow from "@/components/ArticleRow";
import AdminArticleTable from "@/components/AdminArticleTable";

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

  const published = articles.filter((article) => article.published).length;
  const breaking = articles.filter((article) => article.breaking).length;
  const categories = new Set(articles.map((article) => article.category)).size;
  return (
    <div className="py-8 lg:pl-56">
      <AdminNav />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[{ label: "Total articles", value: articles.length }, { label: "Published", value: published }, { label: "Breaking stories", value: breaking }, { label: "Categories", value: categories }].map((stat) => <div key={stat.label} className="rounded-xl border border-line bg-surface p-5 shadow-sm"><p className="text-sm text-ink/60">{stat.label}</p><p className="mt-2 font-serif text-4xl">{stat.value}</p></div>)}
      </div>
      <div className="mb-8 rounded-xl border border-line bg-surface p-5">
        <div className="mb-5 flex items-center justify-between"><div><h2 className="font-serif text-2xl">Publishing activity</h2><p className="text-sm text-ink/60">Recent stories by publication day</p></div><span className="text-sm text-press">{published} live</span></div>
        <div className="flex h-36 items-end gap-2 border-b border-line px-2">{articles.slice(0, 12).reverse().map((article, index) => <div key={article.id} className="group flex flex-1 flex-col items-center justify-end gap-2"><div title={article.title} className={`w-full rounded-t-md ${article.published ? "bg-press" : "bg-line"}`} style={{ height: `${Math.max(18, ((index + 1) / 12) * 100)}%` }} /><span className="text-[10px] text-ink/45">{index + 1}</span></div>)}</div>
      </div>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.18em] text-gold font-semibold">Owner workspace</p><p className="text-sm text-ink/60 mt-1">Review, edit, publish, or remove any story from one place.</p></div><Link href="/admin/articles/new" className="rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-paper hover:opacity-90">+ New article</Link></div>
      {articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line bg-surface p-12 text-center"><p className="font-serif text-2xl">No articles yet</p><p className="mt-2 text-ink/60">Create your first one to start publishing.</p></div>
      ) : (
        <AdminArticleTable articles={articles.map((article) => ({ ...article, createdAt: article.createdAt.toISOString() }))} />
      )}
    </div>
  );
}
