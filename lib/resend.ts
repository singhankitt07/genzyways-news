type EmailPayload = { to: string; subject: string; html: string; text: string; headers?: Record<string, string> };

export function newsletterMailConfig() {
  return { apiKey: process.env.RESEND_API_KEY, from: process.env.NEWSLETTER_FROM || process.env.SMTP_FROM || process.env.EMAIL_FROM || process.env.SMTP_USER };
}

export async function sendNewsletterEmail(payload: EmailPayload) {
  const { apiKey, from } = newsletterMailConfig();
  if (!apiKey || !from) return { ok: false, error: "Newsletter email is not configured. Set RESEND_API_KEY and NEWSLETTER_FROM." };
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, ...payload }),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) return { ok: false, error: result?.message || result?.error || "The email provider rejected the message." };
  return { ok: true };
}