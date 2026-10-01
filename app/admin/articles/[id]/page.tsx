import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ArticleForm from "@/components/ArticleForm";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) redirect(session ? "/" : "/admin/login");

  const article = await prisma.article.findUnique({ where: { id }, include: { media: { orderBy: [{ paragraphIndex: "asc" }, { sortOrder: "asc" }] } } });
  if (!article) notFound();

  return (
    <div className="py-8">
      <h1 className="font-serif text-2xl mb-6">Edit Article</h1>
      <ArticleForm initial={article} />
    </div>
  );
}
