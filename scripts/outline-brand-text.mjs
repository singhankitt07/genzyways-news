#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

const args = new Map(process.argv.slice(2).reduce((pairs, value, index, values) => {
  if (value.startsWith("--")) pairs.push([value.slice(2), values[index + 1]]);
  return pairs;
}, []));

const fontPath = args.get("font");
const text = args.get("text");
const output = args.get("output");
const color = args.get("color") || "#0F1115";
const size = Number(args.get("size") || 88);
if (!fontPath || !text || !output) {
  console.error("Usage: node scripts/outline-brand-text.mjs --font path/to/font.ttf --text GenzyWayNews --output public/brand/wordmark-outlined.svg [--size 88] [--color #0F1115]");
  process.exit(1);
}

const font = opentype.loadSync(fontPath);
const pathData = font.getPath(text, 20, size + 20, size).toPathData(2);
const width = Math.ceil(font.getAdvanceWidth(text, size) + 40);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${size + 40}" role="img"><path d="${pathData}" fill="${color}"/></svg>\n`;
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, svg);
console.log(`Wrote ${output}`);
