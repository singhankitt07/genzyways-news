import type { Metadata } from "next";
import SubscribeExperience from "@/components/SubscribeExperience";
import { getPlans } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Subscribe | GenzyWayNews",
  description: "Choose a simple way to receive credible daily news from GenzyWayNews.",
  alternates: { canonical: "/subscribe" },
  openGraph: { title: "Subscribe | GenzyWayNews", description: "Choose a simple way to receive credible daily news from GenzyWayNews.", url: "/subscribe", siteName: "GenzyWayNews", type: "website", images: [{ url: "/brand/png/genzywaynews-og-image.png", width: 1200, height: 630, alt: "GenzyWayNews" }] },
  twitter: { card: "summary_large_image", title: "Subscribe | GenzyWayNews", description: "Choose a simple way to receive credible daily news from GenzyWayNews.", images: ["/brand/png/genzywaynews-og-image.png"] }
};

export default function SubscribePage() {
  return <SubscribeExperience plans={getPlans()} />;
}
