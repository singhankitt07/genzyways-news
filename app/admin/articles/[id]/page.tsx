import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminNav from "@/components/AdminNav";
import ArticleForm from "@/components/ArticleForm";

export default async function EditArticlePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!isAdminSession(session)) redirect(session ? "/" : "/admin/login");

  const article = await prisma.article.findUnique({ where: { id: params.id }, include: { media: { orderBy: [{ paragraphIndex: "asc" }, { sortOrder: "asc" }] } } });
  if (!article) notFound();

  return (
    <div className="py-8">
      <AdminNav />
      <h1 className="font-serif text-2xl mb-6">Edit Article</h1>
      <ArticleForm initial={article} />
    </div>
  );
}
