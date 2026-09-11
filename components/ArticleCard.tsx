import Link from "next/link";
import CategoryBadge from "./CategoryBadge";

type Props = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  imageUrl?: string | null;
  size?: "lead" | "normal";
};

export default function ArticleCard({ title, slug, summary, category, imageUrl, size = "normal" }: Props) {
  const isLead = size === "lead";
  return (
    <div className={`group ${isLead ? "" : "p-3 -m-3 hover:bg-white hover:shadow-md transition-all duration-200 rounded-sm"}`}>
      <Link href={`/article/${slug}`} className="block">
        <div className={`overflow-hidden bg-gradient-to-br from-line to-ink/10 mb-3 ${isLead ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            />
          )}
        </div>
      </Link>
      <div className="mb-1.5"><CategoryBadge category={category} /></div>
      <Link href={`/article/${slug}`} className="block">
        <h3 className={`font-serif leading-snug group-hover:text-press transition-colors ${isLead ? "text-3xl sm:text-4xl" : "text-lg"}`}>
          {title}
        </h3>
        <p className={`text-ink/70 mt-2 ${isLead ? "text-base" : "text-sm"} line-clamp-3`}>{summary}</p>
      </Link>
    </div>
  );
}
