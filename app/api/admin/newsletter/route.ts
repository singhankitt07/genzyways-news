import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, isAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUnsubscribeToken, hashNewsletterToken } from "@/lib/newsletter-tokens";
import { newsletterMailConfig } from "@/lib/resend";

async function requireAdmin() {
  return isAdminSession(await getServerSession(authOptions));
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const subscribers = await prisma.subscriber.count({ where: { status: "ACTIVE" } });
  return NextResponse.json({ subscribers, configured: Boolean(newsletterMailConfig().apiKey && newsletterMailConfig().from) });
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: "Administrator access required." }, { status: 403 });
  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === "string" ? body.subject.trim().slice(0, 180) : "";
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 30_000) : "";
  if (!subject || !text) return NextResponse.json({ error: "A subject and newsletter message are required." }, { status: 400 });
  const { apiKey, from } = newsletterMailConfig();
  if (!apiKey || !from) return NextResponse.json({ error: "Set RESEND_API_KEY and NEWSLETTER_FROM before sending." }, { status: 503 });

  const subscribers = await prisma.subscriber.findMany({ where: { status: "ACTIVE" }, select: { id: true, email: true, unsubscribeTokenHash: true }, orderBy: { email: "asc" }, take: 10_000 });
  if (!subscribers.length) return NextResponse.json({ error: "There are no confirmed subscribers yet." }, { status: 409 });

  const base = (process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || new URL(request.url).origin).replace(/\/$/, "");
  const paragraphs = text.split(/\n\s*\n/).map((paragraph: string) => `<p>${escapeHtml(paragraph).replace(/\n/g, "<br>")}</p>`).join("");
  const messages = [];
  for (const subscriber of subscribers) {
    const token = createUnsubscribeToken(subscriber.email);
    const tokenHash = hashNewsletterToken(token);
    if (subscriber.unsubscribeTokenHash !== tokenHash) await prisma.subscriber.update({ where: { id: subscriber.id }, data: { unsubscribeTokenHash: tokenHash } });
    const unsubscribeUrl = `${base}/newsletter/unsubscribe?token=${token}`;
    messages.push({
      from,
      to: [subscriber.email],
      subject,
      text: `${text}\n\nUnsubscribe: ${unsubscribeUrl}`,
      html: `${paragraphs}<p><a href="${unsubscribeUrl}">Unsubscribe from this newsletter</a></p>`,
      headers: { "List-Unsubscribe": `<${base}/api/newsletter/unsubscribe?token=${token}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
    });
  }

  let delivered = 0;
  for (let index = 0; index < messages.length; index += 100) {
    try {
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(messages.slice(index, index + 100)),
        cache: "no-store",
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) return NextResponse.json({ error: result?.message || result?.error || "The email provider rejected this batch.", delivered }, { status: 502 });
      delivered += Math.min(100, messages.length - index);
    } catch {
      return NextResponse.json({ error: "Unable to reach the email provider.", delivered }, { status: 502 });
    }
  }
  return NextResponse.json({ ok: true, delivered });
}