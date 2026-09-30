import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import EbookLibrary, { type PublicEbook } from "@/components/EbookLibrary";

export const metadata: Metadata = {
  title: "Guides & eBooks | GenzyWays News",
  description: "Free, editor-reviewed guides and eBooks from GenzyWays News."
};

export default async function EbooksPage() {
  let ebooks: PublicEbook[] = [];
  try {
    const rows = await prisma.ebook.findMany({ where: { published: true }, orderBy: { updatedAt: "desc" } });
    ebooks = rows.map((ebook) => ({ ...ebook, updatedAt: ebook.updatedAt.toISOString() }));
  } catch {
    ebooks = [];
  }

  return <section className="ebooks-page"><EbookLibrary ebooks={ebooks} /></section>;
}