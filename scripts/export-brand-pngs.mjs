#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/brand");
const output = path.join(root, "png");
fs.mkdirSync(output, { recursive: true });

const icons = ["icon-a", "icon-b", "icon-c", "icon-d", "icon-e", "icon-genzy", "icon-ja-nukta", "icon-ja", "icon-g", "circular-favicon"];
const sizes = [16, 32, 180, 192, 512];
for (const name of icons) {
    for (const size of sizes) await sharp(path.join(root, `${name}.svg`)).resize(size, size).png().toFile(path.join(output, `${name}-${size}.png`));
}
const ogBase = sharp({ create: { width: 1200, height: 630, channels: 4, background: { r: 242, g: 107, b: 91, alpha: 1 } } });
const ogMark = await sharp(path.join(root, "icon-genzy.svg")).resize(220, 220).png().toBuffer();
await ogBase.composite([{ input: ogMark, left: 490, top: 125 }]).png().toFile(path.join(output, "og-image.png"));
console.log(`Wrote ${icons.length * sizes.length + 1} PNG brand assets to ${output}`);
