import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve("public/brand");
const output = path.join(root, "png");
fs.mkdirSync(output, { recursive: true });
const icon = path.join(root, "GenzyWays News-icon.svg");
for (const size of [16, 32, 180, 192, 512]) {
    await sharp(icon).resize(size, size).png().toFile(path.join(output, `GenzyWays News-icon-${size}.png`));
}
const lockup = await sharp(path.join(root, "GenzyWays News-logo-dark.svg")).resize(617, 200, { fit: "contain" }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 4, background: { r: 15, g: 17, b: 21, alpha: 1 } } })
    .composite([{ input: lockup, left: 292, top: 215 }])
    .png()
    .toFile(path.join(output, "GenzyWays News-og-image.png"));
console.log("Exported supplied logo PNG assets");
