import MediaGrid from "@/components/MediaGrid";
import { prisma } from "@/lib/prisma";

export default async function ShortsPage() {
  const videos = await prisma.mediaVideo.findMany({ where: { published: true, kind: "SHORT" }, orderBy: { createdAt: "desc" } });
  return <div className="py-10"><p className="section-kicker mb-2">Quick takes</p><h1 className="font-serif text-4xl">Shorts</h1><p className="mt-3 max-w-2xl text-ink/65">Short, vertical updates from the GenzyWayNews newsroom.</p><div className="mt-8"><MediaGrid videos={videos} shorts /></div></div>;
}
