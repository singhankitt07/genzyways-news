import MediaGrid from "@/components/MediaGrid";
import { prisma } from "@/lib/prisma";

export default async function VideosPage() {
  const videos = await prisma.mediaVideo.findMany({ where: { published: true, kind: "VIDEO" }, orderBy: { createdAt: "desc" } });
  return <div className="py-10"><p className="section-kicker mb-2">Watch</p><h1 className="font-serif text-4xl">Videos</h1><p className="mt-3 max-w-2xl text-ink/65">Longer conversations, explainers, and newsroom coverage.</p><div className="mt-8"><MediaGrid videos={videos} /></div></div>;
}
