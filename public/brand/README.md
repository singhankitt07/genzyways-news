# GenzyWays News brand exploration

These assets are isolated from the current site logo. Nothing here replaces `components/BrandMark.tsx`.

- **Concept A:** custom Devanagari-inspired `za` form; the amber nukta becomes a signal dot.
- **Concept B:** geometric G with two coral broadcast arcs in the cut/gap.
- **Concept C:** G and za monogram fused into one compact newsroom stamp.
- **Concept D:** lightning mark for speed, alerts, and breaking news.
- **Concept E:** signal waves over a grounded news base; closest evolution of the current icon.

Best lockup candidates are A and E. Each has horizontal, stacked, bilingual, and icon-only assets. Every SVG uses CSS variables with fallbacks so it can be recolored inline for light and dark themes. Paths use strokes of at least 11px in the 256px icon system, keeping them legible at 16px.

## Build assets

```bash
npm install
npm run brand:png
node scripts/outline-brand-text.mjs --font ./fonts/PlayfairDisplay-Bold.ttf --text GenzyWays News --output public/brand/wordmark-serif-outlined.svg
node scripts/outline-brand-text.mjs --font ./fonts/NotoSerifDevanagari-Bold.ttf --text "जेन-ज़ी वे न्यूज़" --output public/brand/wordmark-hindi-outlined.svg --size 72
```

The preview is available at `/brand/logo-preview.html`. Choose a concept first, then replace the existing `BrandMark` SVG and metadata references deliberately; this exploration does not alter the live logo.
