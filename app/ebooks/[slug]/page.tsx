import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import EbookDetail from "@/components/EbookDetail";
import type { PublicEbook } from "@/components/EbookLibrary";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const ebook = await prisma.ebook.findUnique({ where: { slug: params.slug } });
  if (!ebook || !ebook.published) return {};
  return {
    title: `${ebook.title} | Guides & eBooks | GenzyWays News`,
    description: ebook.summary,
    alternates: { canonical: `/ebooks/${ebook.slug}` }
  };
}

export default async function EbookPage({ params }: { params: { slug: string } }) {
  const ebook = await prisma.ebook.findUnique({ where: { slug: params.slug } });
  if (!ebook || !ebook.published) notFound();
  const data: PublicEbook = { ...ebook, updatedAt: ebook.updatedAt.toISOString() };
  return <section className="ebooks-page"><EbookDetail ebook={data} /></section>;
}