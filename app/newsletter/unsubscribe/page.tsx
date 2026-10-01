import NewsletterUnsubscribe from "@/components/NewsletterUnsubscribe";

export default async function NewsletterUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <NewsletterUnsubscribe token={token || ""} />;
}