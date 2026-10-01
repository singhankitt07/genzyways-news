import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasStaffRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CATEGORIES = new Set(["Current Affairs", "Tech News", "AI World", "Business", "Opinion", "Cricket", "India News", "Entertainment", "World News", "Lifestyle"]);

function parseJson(value: string) {
  const cleaned = value.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  return JSON.parse(cleaned) as Record<string, unknown>;
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!hasStaffRole(session, ["ADMIN", "EDITOR"])) return NextResponse.json({ error: "Editor access required" }, { status: 403 });

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured. Add AI_API_KEY to the server environment." }, { status: 503 });

  const article = await prisma.article.findUnique({ where: { id } });
  if (!article) return NextResponse.json({ error: "Article not found." }, { status: 404 });

  const baseUrl = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const prompt = [
    "You are an editor preparing a news draft for human review.",
    "Rewrite the supplied source material clearly and accurately. Do not invent facts, quotes, names, dates, numbers, or claims.",
    "Return only valid JSON with exactly these string keys: title, summary, content, titleHi, summaryHi, contentHi, category.",
    "Use markdown paragraphs in content and contentHi. Keep the source attribution in mind. Choose one category from: Current Affairs, Tech News, AI World, Business, Opinion, Cricket, India News, Entertainment, World News, Lifestyle.",
    "The result is a draft and must not be treated as verified or published without editorial review.",
    `Existing headline: ${article.title}`,
    `Existing source: ${article.sourceName || "Unknown"}`,
    `Source URL: ${article.sourceUrl || "Unknown"}`,
    `Source material:\n${article.content}`
  ].join("\n\n");

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "user", content: prompt }] }),
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) return NextResponse.json({ error: "The AI provider rejected the request." }, { status: 502 });
    const payload = await response.json();
    const text = payload.choices?.[0]?.message?.content;
    if (typeof text !== "string") throw new Error("AI response did not contain content");
    const result = parseJson(text);
    const stringValue = (key: string, fallback: string) => typeof result[key] === "string" && result[key].trim() ? result[key].trim() : fallback;
    const category = stringValue("category", article.category);
    const content = typeof result.content === "string" && result.content.trim() ? result.content.trim() : null;
    const contentHi = typeof result.contentHi === "string" && result.contentHi.trim() ? result.contentHi.trim() : null;
    const updated = await prisma.article.update({
      where: { id: article.id },
      data: {
        title: stringValue("title", article.title).slice(0, 240),
        summary: stringValue("summary", article.summary).slice(0, 1000),
        content: content || article.content,
        contentFormat: content ? "MARKDOWN" : article.contentFormat,
        titleHi: stringValue("titleHi", article.titleHi || "").slice(0, 240) || null,
        summaryHi: stringValue("summaryHi", article.summaryHi || "").slice(0, 1000) || null,
        contentHi: contentHi || article.contentHi,
        contentHiFormat: contentHi ? "MARKDOWN" : article.contentHiFormat,
        category: CATEGORIES.has(category) ? category : article.category,
        published: false,
        publishedHi: false
      }
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("AI article enhancement failed", error);
    return NextResponse.json({ error: "AI enhancement failed. Check the provider configuration and try again." }, { status: 502 });
  }
}