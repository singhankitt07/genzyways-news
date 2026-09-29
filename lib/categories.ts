// Plain data + helper functions, deliberately NOT a "use client" file.
// Server Components (like app/category/[slug]/page.tsx) need to import these directly
// from here — importing plain functions out of a "use client" file (lib/i18n.tsx) into a
// Server Component doesn't work in Next.js, since "use client" turns every export of that
// module into a client-only reference.

export type Lang = "en" | "hi" | "hinglish";

export type Dict = Record<string, Record<Lang, string>>;

export const dictionary: Dict = {
  siteName: { en: "GenzyWays News", hi: "जेनज़ीवे न्यूज़", hinglish: "GenzyWays News" },
  tagline: {
    en: "Current affairs, tech and AI — every day.",
    hi: "हर दिन करेंट अफेयर्स, टेक और एआई।",
    hinglish: "Current affairs, tech aur AI — har din."
  },
  breaking: { en: "BREAKING", hi: "ताज़ा खबर", hinglish: "BREAKING" },
  live: { en: "LIVE", hi: "लाइव", hinglish: "LIVE" },
  staffLogin: { en: "Staff Login", hi: "स्टाफ लॉगिन", hinglish: "Staff Login" },
  viewSite: { en: "View site", hi: "साइट देखें", hinglish: "Site dekho" },
  signOut: { en: "Sign out", hi: "साइन आउट", hinglish: "Sign out" },
  noStories: { en: "No stories published yet", hi: "अभी कोई खबर प्रकाशित नहीं हुई", hinglish: "Abhi koi story publish nahi hui" },
  noStoriesSub: {
    en: "Log in to the admin panel and publish your first article.",
    hi: "एडमिन पैनल में लॉगिन करें और अपना पहला लेख प्रकाशित करें।",
    hinglish: "Admin panel me login karke apna pehla article publish karo."
  },
  noSectionStories: {
    en: "No stories in this section yet.",
    hi: "इस सेक्शन में अभी कोई खबर नहीं है।",
    hinglish: "Is section me abhi koi story nahi hai."
  },
  by: { en: "By", hi: "लेखक:", hinglish: "By" },
  share: { en: "Share", hi: "शेयर करें", hinglish: "Share karo" },
  downloadPdf: { en: "Save as PDF", hi: "पीडीएफ़ सेव करें", hinglish: "PDF me save karo" },
  contactUs: { en: "Contact Us", hi: "संपर्क करें", hinglish: "Contact Us" },
  privacyPolicy: { en: "Privacy Policy", hi: "गोपनीयता नीति", hinglish: "Privacy Policy" },
  readMore: { en: "Read more", hi: "और पढ़ें", hinglish: "Aur padho" }
};

export const categories: { slug: string; label: Record<Lang, string> }[] = [
  { slug: "current-affairs", label: { en: "Current Affairs", hi: "करेंट अफेयर्स", hinglish: "Current Affairs" } },
  { slug: "tech-news", label: { en: "Tech News", hi: "टेक न्यूज़", hinglish: "Tech News" } },
  { slug: "ai-world", label: { en: "AI World", hi: "एआई वर्ल्ड", hinglish: "AI World" } },
  { slug: "business", label: { en: "Business", hi: "बिज़नेस", hinglish: "Business" } },
  { slug: "opinion", label: { en: "Opinion", hi: "राय", hinglish: "Opinion" } },
  { slug: "cricket", label: { en: "Cricket", hi: "क्रिकेट", hinglish: "Cricket" } },
  { slug: "india-news", label: { en: "India News", hi: "भारत न्यूज़", hinglish: "India News" } },
  { slug: "entertainment", label: { en: "Entertainment", hi: "मनोरंजन", hinglish: "Entertainment" } },
  { slug: "world-news", label: { en: "World News", hi: "विश्व न्यूज़", hinglish: "World News" } },
  { slug: "lifestyle", label: { en: "Lifestyle", hi: "लाइफस्टाइल", hinglish: "Lifestyle" } }
];

export function translateCategory(englishLabel: string, lang: Lang): string {
  const match = categories.find((c) => c.label.en === englishLabel);
  return match ? match.label[lang] : englishLabel;
}

export function categorySlugFor(englishLabel: string): string {
  const match = categories.find((c) => c.label.en === englishLabel);
  return match ? match.slug : englishLabel.toLowerCase().replace(/\s+/g, "-");
}

export function categoryFromSlug(slug: string) {
  return categories.find((c) => c.slug === slug) || null;
}
