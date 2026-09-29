import type { Metadata } from "next";
import { Source_Serif_4, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/Masthead";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import AdSenseLoader from "@/components/AdSenseLoader";
import ThemeProvider from "@/components/ThemeProvider";
import ScrollToTop from "@/components/ScrollToTop";

const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoHindi = Noto_Sans_Devanagari({ subsets: ["devanagari"], variable: "--font-noto-hindi" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: "GenzyWayNews | Current Affairs, Tech & AI",
  description: "Current affairs, daily tech news, and the latest AI world developments — in English, Hindi, or Hinglish.",
  icons: {
    icon: [
      { url: "/brand/genzywaynews-icon.svg", type: "image/svg+xml" },
      { url: "/brand/png/genzywaynews-icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/png/genzywaynews-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/brand/png/genzywaynews-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/png/genzywaynews-icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/brand/png/genzywaynews-icon-180.png", sizes: "180x180", type: "image/png" }]
  },
  other: {
    "google-adsense-account": "ca-pub-7431298506667016"
  },
  openGraph: {
    type: "website",
    siteName: "GenzyWayNews",
    title: "GenzyWayNews | Current Affairs, Tech & AI",
    description: "Current affairs, daily tech news, and the latest AI world developments.",
    images: [{ url: "/brand/png/genzywaynews-og-image.png", width: 1200, height: 630, alt: "GenzyWayNews logo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "GenzyWayNews | Current Affairs, Tech & AI",
    description: "Current affairs, daily tech news, and the latest AI world developments.",
    images: ["/brand/png/genzywaynews-og-image.png"]
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let breakingTitles: { title: string; slug: string; live?: boolean; updatedAt?: string }[] = [];
  try {
    const breaking = await prisma.article.findMany({
      where: { published: true, OR: [{ breaking: true }, { live: true }] },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { title: true, slug: true, live: true, updatedAt: true }
    });
    breakingTitles = breaking.map((item) => ({ ...item, updatedAt: item.updatedAt.toISOString() }));
  } catch {
    breakingTitles = [];
  }

  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable} ${notoHindi.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { const saved = localStorage.getItem('genzywaynews-theme'); const system = window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.dataset.theme = saved === 'dark' || (saved !== 'light' && system) ? 'dark' : 'light'; } catch (error) { document.documentElement.dataset.theme = 'light'; }` }} />
      </head>
      <body className="font-sans">
        <ThemeProvider>
          <SessionProviderWrapper>
          <GoogleAnalytics />
          <AdSenseLoader />
          <CookieConsent />
          <LanguageProvider>
            <Masthead />
            {breakingTitles.length > 0 && <Ticker items={breakingTitles} />}
            <main className="max-w-6xl mx-auto px-4">{children}</main>
            <Footer />
            <ScrollToTop />
          </LanguageProvider>
          </SessionProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
