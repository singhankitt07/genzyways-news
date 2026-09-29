# Circular badge logo system

This is a new, non-integrated exploration set. It does not replace the live `BrandMark` automatically.

## Options

- `icon-ja-nukta.svg`: bold custom `ज़` direction; the nukta is retained as a clear black dot.
- `icon-ja.svg`: simpler `ज` alternative.
- `icon-g.svg`: English-only geometric G alternative.

The requested colors are flat and high-contrast: coral `#F26B5B`, near-black `#111111`, white `#FFFFFF`, and optional amber `#F5A623`. The icon strokes are at least 2px at 256px and the badge is a mathematically perfect circle.

## Outline generation

Latin wordmarks can be outlined with the existing OpenType script:

```bash
node scripts/outline-brand-text.mjs --font ./fonts/Poppins-ExtraBold.ttf --text GenzyWays --output public/brand/wordmark-circular-outlined.svg --size 64
```

For Devanagari, use HarfBuzz shaping rather than raw OpenType placement:

```bash
python -m pip install uharfbuzz fonttools
python scripts/shape-devanagari.py --font ./fonts/NotoSansDevanagari-Black.ttf --text "ज़" --output public/brand/letter-za-outlined.svg
```

The source icons in this set already use hand-authored paths. The scripts are for regenerating final wordmark/letter paths from the free Google Fonts Poppins ExtraBold and Noto Sans Devanagari Black.

## Swap-in plan

After choosing an option, replace the inline SVG inside `components/BrandMark.tsx` with the selected icon path and update `app/layout.tsx` metadata to point to the selected favicon/OG PNG. The preview and all files in this folder can remain as the design archive.
