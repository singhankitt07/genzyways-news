// Netlify replacement for the Vercel Cron entry in vercel.json: calls the newsroom pipeline route once a day.
export default async () => {
  const secret = process.env.CRON_SECRET;
  const siteUrl = process.env.URL;
  if (!secret || !siteUrl) {
    console.error("newsroom-cron: CRON_SECRET or URL is not configured.");
    return;
  }
  try {
    // Scheduled functions stop after 30 s; the route keeps running in its own function if this request times out.
    const response = await fetch(`${siteUrl}/api/cron/newsroom`, {
      headers: { authorization: `Bearer ${secret}` },
      signal: AbortSignal.timeout(25_000),
    });
    console.log(`newsroom-cron: ${response.status} ${await response.text()}`);
  } catch (error) {
    console.log(`newsroom-cron: request still running or failed (${error instanceof Error ? error.message : error})`);
  }
};

export const config = { schedule: "0 3 * * *" };
