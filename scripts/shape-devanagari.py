#!/usr/bin/env python3
"""Shape Devanagari with HarfBuzz and emit an outlined SVG path.

Install once: python -m pip install uharfbuzz fonttools
Usage: python scripts/shape-devanagari.py --font NotoSansDevanagari-Black.ttf --text "ज़" --output public/brand/letter-z-outlined.svg
"""
import argparse
from pathlib import Path

import uharfbuzz as hb
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

parser = argparse.ArgumentParser()
parser.add_argument("--font", required=True)
parser.add_argument("--text", required=True)
parser.add_argument("--output", required=True)
parser.add_argument("--size", type=float, default=150)
args = parser.parse_args()

font_path = Path(args.font)
font_bytes = font_path.read_bytes()
face = hb.Face(font_bytes)
font = hb.Font(face)
font.scale = (face.upem, face.upem)
buffer = hb.Buffer()
buffer.add_str(args.text)
buffer.guess_segment_properties()
hb.shape(font, buffer)

fonttools_font = TTFont(str(font_path))
glyph_set = fonttools_font.getGlyphSet()
scale = args.size / face.upem
cursor = 16.0
baseline = args.size + 16.0
paths = []
for glyph_info, glyph_position in zip(buffer.glyph_infos, buffer.glyph_positions):
    glyph_name = fonttools_font.getBestCmap().get(glyph_info.codepoint)
    if glyph_name is None:
        glyph_name = fonttools_font.getGlyphOrder()[glyph_info.codepoint]
    pen = SVGPathPen(glyph_set)
    transform = TransformPen(pen, (scale, 0, 0, -scale, cursor +
                             glyph_position.x_offset * scale, baseline - glyph_position.y_offset * scale))
    glyph_set[glyph_name].draw(transform)
    paths.append(pen.getCommands())
    cursor += glyph_position.x_advance * scale

width = max(32, int(cursor + 16))
svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width:.0f} {args.size + 32:.0f}" role="img"><path d="{" ".join(paths)}" fill="#111111"/></svg>\n'
output = Path(args.output)
output.parent.mkdir(parents=True, exist_ok=True)
output.write_text(svg, encoding="utf-8")
print(f"Wrote {output}")
