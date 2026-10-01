import type { ReactNode } from "react";
import { parseRichText, type RichTextNode } from "@/lib/article-content";
import { renderInline } from "@/lib/markdown";

type MediaItem = { id: string; type: "IMAGE" | "VIDEO"; url: string; caption: string | null; paragraphIndex: number };

function renderNode(node: RichTextNode, key: string): ReactNode {
  if (node.type === "text") {
    let text: ReactNode = node.text || "";
    for (const mark of node.marks || []) {
      if (mark.type === "bold") text = <strong key={`${key}-bold`}>{text}</strong>;
      else if (mark.type === "italic") text = <em key={`${key}-italic`}>{text}</em>;
      else if (mark.type === "strike") text = <s key={`${key}-strike`}>{text}</s>;
      else if (mark.type === "code") text = <code key={`${key}-code`}>{text}</code>;
      else if (mark.type === "link" && mark.attrs?.href) text = <a key={`${key}-link`} href={mark.attrs.href} target="_blank" rel="noopener noreferrer" className="underline hover:text-press">{text}</a>;
    }
    return text;
  }

  const children = (node.content || []).map((child, index) => renderNode(child, `${key}-${index}`));
  switch (node.type) {
    case "doc": return <>{children}</>;
    case "paragraph": return <p key={key}>{children}</p>;
    case "heading": {
      const level = Number(node.attrs?.level);
      if (level === 3) return <h3 key={key}>{children}</h3>;
      if (level === 4) return <h4 key={key}>{children}</h4>;
      return <h2 key={key}>{children}</h2>;
    }
    case "bulletList": return <ul key={key} className="list-disc pl-6">{children}</ul>;
    case "orderedList": return <ol key={key} className="list-decimal pl-6">{children}</ol>;
    case "listItem": return <li key={key}>{children}</li>;
    case "blockquote": return <blockquote key={key} className="border-l-2 border-press pl-4 italic">{children}</blockquote>;
    case "horizontalRule": return <hr key={key} />;
    case "hardBreak": return <br key={key} />;
    default: return null;
  }
}

function MediaFigure({ item, hindi }: { item: MediaItem; hindi: boolean }) {
  return <figure key={item.id} className="my-8">{item.type === "VIDEO" ? <video src={item.url} controls preload="metadata" className="w-full" /> : <img src={item.url} alt={item.caption || (hindi ? "समाचार फोटो" : "Article photo")} className="w-full" />}{item.caption && <figcaption className="mt-2 text-sm text-ink/60">{item.caption}</figcaption>}</figure>;
}

export default function ArticleContent({ content, format, media = [], hindi = false }: { content: string; format: string; media?: MediaItem[]; hindi?: boolean }) {
  if (format === "RICH_TEXT") {
    const document = parseRichText(content);
    if (!document) return null;
    const blocks = document.content || [];
    let paragraphCount = 0;
    const rendered: ReactNode[] = [];
    for (const [index, block] of blocks.entries()) {
      rendered.push(<div key={`block-${index}`}>{renderNode(block, `block-${index}`)}</div>);
      if (block.type === "paragraph") {
        paragraphCount += 1;
        media.filter((item) => item.paragraphIndex === paragraphCount).forEach((item) => rendered.push(<MediaFigure key={item.id} item={item} hindi={hindi} />));
      }
    }
    return <>{rendered}</>;
  }

  return <>{content.split(/\n\s*\n/).map((paragraph, index) => <div key={index}><p>{renderInline(paragraph)}</p>{media.filter((item) => item.paragraphIndex === index + 1).map((item) => <MediaFigure key={item.id} item={item} hindi={hindi} />)}</div>)}</>;
}