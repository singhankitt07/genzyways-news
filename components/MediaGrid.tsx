import Link from "next/link";

type Video = { id: string; title: string; description?: string | null; url: string; thumbnailUrl?: string | null; kind: "SHORT" | "VIDEO" };

export default function MediaGrid({ videos, shorts = false }: { videos: Video[]; shorts?: boolean }) {
  return <div className={shorts ? "grid gap-5 sm:grid-cols-2 lg:grid-cols-4" : "grid gap-8 sm:grid-cols-2 lg:grid-cols-3"}>{videos.map((video) => <article key={video.id} className={shorts ? "media-short overflow-hidden border border-line bg-surface" : "overflow-hidden border border-line bg-surface"}><Link href={video.url} target="_blank" rel="noreferrer" className="block"><div className={shorts ? "aspect-[9/16] bg-black" : "aspect-video bg-black"}>{video.thumbnailUrl ? <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" /> : <video src={video.url} muted playsInline className="h-full w-full object-cover" />}</div><div className="p-4"><p className="section-kicker">{video.kind === "SHORT" ? "Short" : "Video"}</p><h2 className="mt-2 font-serif text-xl">{video.title}</h2>{video.description && <p className="mt-2 text-sm text-ink/65">{video.description}</p>}</div></Link></article>)}</div>;
}
