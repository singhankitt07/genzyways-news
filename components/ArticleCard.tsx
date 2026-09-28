import Link from "next/link";
import CategoryBadge from "./CategoryBadge";
import LiveTimestamp from "./LiveTimestamp";

type Props = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl?: string | null;
  live?: boolean;
  updatedAt?: Date | string;
  size?: "lead" | "normal";
};

export default function ArticleCard({ title, slug, summary, category, imageUrl, live, updatedAt, size = "normal" }: Props) {
  const isLead = size === "lead";
  return (
    <div className={`group ${isLead ? "" : "p-3 -m-3 hover:bg-white hover:shadow-md transition-all duration-200 rounded-sm"}`}>
      <Link href={`/article/${slug}`} className="block">
        <div className={`relative overflow-hidden bg-gradient-to-br from-line to-ink/10 mb-3 aspect-[16/9] rounded-lg`}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          )}
          {isLead && <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />}
        </div>
      </Link>
      <div className="mb-1.5 flex items-center gap-2"><CategoryBadge category={category} />{live ? <span className="live-dot text-[10px] font-semibold">LIVE{updatedAt ? <> · <LiveTimestamp value={updatedAt} /></> : ""}</span> : updatedAt ? <span className="text-[11px] text-ink/50"><LiveTimestamp value={updatedAt} /></span> : null}</div>
      <Link href={`/article/${slug}`} className="block">
        <h3 className={`font-serif leading-snug line-clamp-3 group-hover:text-press transition-colors ${isLead ? "text-3xl sm:text-4xl" : "text-lg"}`}>
          {title}
        </h3>
        <p className={`text-ink/70 mt-2 ${isLead ? "text-base" : "text-sm"} line-clamp-3`}>{summary}</p>
      </Link>
    </div>
  );
}
