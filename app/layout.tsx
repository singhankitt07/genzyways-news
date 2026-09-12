import type { Metadata } from "next";
import { Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/Masthead";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";

const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "GenzyWayNews | Current Affairs, Tech & AI",
  description: "Current affairs, daily tech news, and the latest AI world developments — in English, Hindi, or Hinglish.",
  openGraph: {
    type: "website",
    siteName: "GenzyWayNews",
    title: "GenzyWayNews | Current Affairs, Tech & AI",
    description: "Current affairs, daily tech news, and the latest AI world developments."
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let breakingTitles: { title: string; slug: string }[] = [];
  try {
    const breaking = await prisma.article.findMany({
      where: { breaking: true, published: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { title: true, slug: true }
    });
    breakingTitles = breaking;
  } catch {
    breakingTitles = [];
  }

  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable}`}>
      <body className="font-sans">
        <GoogleAnalytics />
        <CookieConsent />
        <LanguageProvider>
          <Masthead />
          {breakingTitles.length > 0 && <Ticker items={breakingTitles} />}
          <main className="max-w-6xl mx-auto px-4">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
