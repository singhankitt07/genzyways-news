import type { Metadata } from "next";
import SubscribeExperience from "@/components/SubscribeExperience";
import { getPlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Subscribe | GenzyWays News",
  description: "Choose a simple way to receive credible daily news from GenzyWays News.",
  alternates: { canonical: "/subscribe" },
  openGraph: { title: "Subscribe | GenzyWays News", description: "Choose a simple way to receive credible daily news from GenzyWays News.", url: "/subscribe", siteName: "GenzyWays News", type: "website", images: [{ url: "/brand/png/GenzyWays News-og-image.png", width: 1200, height: 630, alt: "GenzyWays News" }] },
  twitter: { card: "summary_large_image", title: "Subscribe | GenzyWays News", description: "Choose a simple way to receive credible daily news from GenzyWays News.", images: ["/brand/png/GenzyWays News-og-image.png"] }
};

export default function SubscribePage() {
  return <SubscribeExperience plans={getPlans()} />;
}
