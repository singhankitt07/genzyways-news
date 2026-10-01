import { createHash, createHmac } from "crypto";

export function hashNewsletterToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createUnsubscribeToken(email: string) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is required to create unsubscribe links.");
  return createHmac("sha256", secret).update(`newsletter-unsubscribe:${email}`).digest("hex");
}