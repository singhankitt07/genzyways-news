# Next.js metadata

Use the chosen icon after swapping it into the site:

```tsx
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/brand/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/png/favicon-32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [{ url: "/brand/png/favicon-180.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    images: [{ url: "/brand/png/og-image.png", width: 1200, height: 630, alt: "GenzyWayNews" }]
  },
  twitter: {
    card: "summary_large_image",
    images: ["/brand/png/og-image.png"]
  }
};
```

Free fonts used in the source wordmarks: Playfair Display for English and Noto Serif Devanagari for Hindi. Run the outline script with local copies of those Google Fonts before production if font-independent wordmark paths are required.
