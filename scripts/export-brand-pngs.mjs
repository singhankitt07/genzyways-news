#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/brand");
const output = path.join(root, "png");
fs.mkdirSync(output, { recursive: true });

const icons = ["icon-a", "icon-b", "icon-c", "icon-d", "icon-e", "favicon"];
const sizes = [16, 32, 180, 192, 512];
for (const name of icons) {
  for (const size of sizes) await sharp(path.join(root, `${name}.svg`)).resize(size, size).png().toFile(path.join(output, `${name}-${size}.png`));
}
await sharp(path.join(root, "lockup-e-horizontal.svg")).resize(1200, 630, { fit: "contain", background: { r: 15, g: 17, b: 21, alpha: 1 } }).png().toFile(path.join(output, "og-image.png"));
console.log(`Wrote ${icons.length * sizes.length + 1} PNG brand assets to ${output}`);
