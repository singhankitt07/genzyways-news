import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const video = await prisma.mediaVideo.findUnique({ where: { id } });
  if (!video || !video.published) notFound();
  const isShort = video.kind === "SHORT";
  return (
    <div className="py-8">
      <Link href={isShort ? "/shorts" : "/videos"} className="text-sm font-semibold text-press hover:underline">← Back to {isShort ? "Shorts" : "Videos"}</Link>
      <h1 className="mt-4 font-serif text-3xl sm:text-4xl">{video.title}</h1>
      <div className={`mt-6 bg-black ${isShort ? "mx-auto max-w-sm" : "max-w-4xl"}`}>
        <video src={video.url} poster={video.thumbnailUrl || undefined} controls playsInline preload="metadata" className={`w-full ${isShort ? "aspect-[9/16]" : "aspect-video"}`} />
      </div>
      {video.description && <p className="mt-4 max-w-3xl text-ink/70">{video.description}</p>}
    </div>
  );
}
