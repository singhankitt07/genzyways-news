import type { Metadata } from "next";
import { Source_Serif_4, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import Masthead from "@/components/Masthead";
import Ticker from "@/components/Ticker";
import Footer from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  title: "GenzyWays News | Current Affairs, Tech & AI",
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
    siteName: "GenzyWays News",
    title: "GenzyWays News | Current Affairs, Tech & AI",
    description: "Current affairs, daily tech news, and the latest AI world developments.",
    images: [{ url: "/brand/png/genzywaynews-og-image.png", width: 1200, height: 630, alt: "GenzyWays News logo" }]
  },
  twitter: {
    card: "summary_large_image",
    title: "GenzyWays News | Current Affairs, Tech & AI",
    description: "Current affairs, daily tech news, and the latest AI world developments.",
    images: ["/brand/png/genzywaynews-og-image.png"]
  }
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let breakingTitles: { title: string; slug: string; live?: boolean; updatedAt?: string }[] = [];
  let initialTheme: "light" | "sepia" | "dark" | "auto" = "auto";
  let initialFontSize = 18;
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
  try {
    const session = await getServerSession(authOptions);
    const reader = session?.user as { theme?: string; readingFontSize?: number } | undefined;
    if (reader?.theme && ["light", "sepia", "dark", "auto"].includes(reader.theme)) initialTheme = reader.theme as typeof initialTheme;
    if (reader?.readingFontSize && Number.isInteger(reader.readingFontSize) && reader.readingFontSize >= 16 && reader.readingFontSize <= 24) initialFontSize = reader.readingFontSize;
  } catch {
    initialTheme = "auto";
  }

  return (
    <html lang="en" className={`${sourceSerif.variable} ${inter.variable} ${notoHindi.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try { const saved = localStorage.getItem('genzywaynews-theme'); const server = ${JSON.stringify(initialTheme)}; const choice = saved || server; const system = window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.dataset.theme = ['light','sepia','dark'].includes(choice) ? choice : (system ? 'dark' : 'light'); const storedSize = localStorage.getItem('genzywaynews-reading-font-size'); const size = storedSize === null ? ${initialFontSize} : Number(storedSize); if (Number.isInteger(size) && size >= 16 && size <= 24) document.documentElement.style.setProperty('--reader-font-size', size + 'px'); } catch (error) { document.documentElement.dataset.theme = ${JSON.stringify(initialTheme === "auto" ? "light" : initialTheme)}; }` }} />
      </head>
      <body className="font-sans">
        <SessionProviderWrapper>
          <ThemeProvider initialTheme={initialTheme} initialFontSize={initialFontSize}>
          <div className="print-watermark" aria-hidden="true"><img src="/brand/genzywaynews-icon.svg" alt="" /></div>
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
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
