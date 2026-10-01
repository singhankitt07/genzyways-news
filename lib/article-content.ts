export type ContentFormat = "MARKDOWN" | "RICH_TEXT";

export type RichTextNode = {
  type: string;
  text?: string;
  attrs?: Record<string, string | number>;
  marks?: { type: string; attrs?: Record<string, string> }[];
  content?: RichTextNode[];
};

const allowedNodes = new Set(["doc", "paragraph", "heading", "bulletList", "orderedList", "listItem", "blockquote", "horizontalRule", "text", "hardBreak"]);
const allowedMarks = new Set(["bold", "italic", "strike", "code", "link"]);

function safeHref(value: unknown) {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (/^(https?:|mailto:)/i.test(href) || (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#")) return href.slice(0, 2000);
  return null;
}

function sanitizeNode(value: unknown): RichTextNode | null {
  if (!value || typeof value !== "object") return null;
  const node = value as Record<string, unknown>;
  if (typeof node.type !== "string" || !allowedNodes.has(node.type)) return null;

  if (node.type === "text") {
    if (typeof node.text !== "string") return null;
    const marks = Array.isArray(node.marks) ? node.marks.flatMap((candidate) => {
      if (!candidate || typeof candidate !== "object") return [];
      const mark = candidate as Record<string, unknown>;
      if (typeof mark.type !== "string" || !allowedMarks.has(mark.type)) return [];
      if (mark.type === "link") {
        const href = safeHref((mark.attrs as Record<string, unknown> | undefined)?.href);
        return href ? [{ type: "link", attrs: { href } }] : [];
      }
      return [{ type: mark.type }];
    }) : [];
    return { type: "text", text: node.text.slice(0, 100_000), ...(marks.length ? { marks } : {}) };
  }

  const result: RichTextNode = { type: node.type };
  if (node.type === "heading") {
    const level = Number((node.attrs as Record<string, unknown> | undefined)?.level);
    result.attrs = { level: level === 3 || level === 4 ? level : 2 };
  }
  if (Array.isArray(node.content)) result.content = node.content.flatMap((child) => {
    const safeChild = sanitizeNode(child);
    return safeChild ? [safeChild] : [];
  });
  return result;
}

export function parseRichText(content: unknown): RichTextNode | null {
  if (typeof content !== "string" || content.length > 1_000_000) return null;
  try {
    const document = sanitizeNode(JSON.parse(content));
    return document?.type === "doc" ? document : null;
  } catch {
    return null;
  }
}

export function normalizeArticleContent(content: unknown, format: unknown): { content: string; format: ContentFormat } | null {
  if (format === "RICH_TEXT") {
    const document = parseRichText(content);
    return document && richTextToPlainText(document).trim() ? { content: JSON.stringify(document), format } : null;
  }
  if (format !== undefined && format !== "MARKDOWN") return null;
  if (typeof content !== "string" || content.length > 1_000_000 || !content.trim()) return null;
  return { content, format: "MARKDOWN" };
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function markdownToEditorHtml(markdown: string) {
  return markdown.split(/\n\s*\n/).filter(Boolean).map((paragraph) => {
    const safeText = escapeHtml(paragraph).replace(/\n/g, "<br>");
    const formatted = safeText
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+)\)/g, '<a href="$2">$1</a>');
    return `<p>${formatted}</p>`;
  }).join("");
}

export function richTextToPlainText(document: RichTextNode): string {
  if (document.type === "text") return document.text || "";
  if (document.type === "hardBreak") return " ";
  const separator = document.type === "doc" || document.type === "bulletList" || document.type === "orderedList" ? " " : "";
  return (document.content || []).map(richTextToPlainText).join(separator);
}