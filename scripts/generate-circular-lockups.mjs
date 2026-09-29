import fs from "node:fs";
import path from "node:path";

const output = path.resolve("public/brand");
const colors = {
  light: { bg: "#FFFFFF", ink: "#111111", circle: "#F26B5B", label: "#111111" },
  dark: { bg: "#0F1115", ink: "#FFFFFF", circle: "#F26B5B", label: "#FFFFFF" },
  black: { bg: "#FFFFFF", ink: "#111111", circle: "#111111", label: "#111111" },
  white: { bg: "#0F1115", ink: "#FFFFFF", circle: "#FFFFFF", label: "#FFFFFF" }
};
const icon = (x, y, radius, circle, ink) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${circle}"/><path d="M${x - radius * .72} ${y - radius * .43}h${radius * 1.44}M${x - radius * .5} ${y - radius * .42}v${radius * .46}c0 ${radius * .31} ${radius * .15} ${radius * .5} ${radius * .45} ${radius * .58}l${radius * .3} ${radius * .08}c${radius * .15} ${radius * .03} ${radius * .25}-.04 ${radius * .25}-.17 0-.12-.08-.19-.22-.23l-${radius * .36}-.1c-${radius * .12}-.04-${radius * .17}-.1-${radius * .17}-.2 0-.15 ${radius * .1}-.24 ${radius * .27}-.24h${radius * .32}" fill="none" stroke="${ink}" stroke-width="${radius * .18}" stroke-linecap="square" stroke-linejoin="round"/><circle cx="${x + radius * .49}" cy="${y + radius * .25}" r="${radius * .1}" fill="${ink}"/>`;

for (const [name, c] of Object.entries(colors)) {
  const horizontal = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 190" role="img" aria-labelledby="title desc"><title id="title">GenzyWayNews horizontal lockup ${name}</title><desc id="desc">Circular Devanagari-inspired badge and bold GenzyWay News wordmark.</desc>${icon(95,95,78,c.circle,c.ink)}<text x="205" y="102" font-family="Poppins, Outfit, Arial, sans-serif" font-size="62" font-weight="800" letter-spacing="-1.5" fill="${c.label}">GenzyWay</text><text x="208" y="142" font-family="Poppins, Outfit, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="1" fill="${c.circle}">NEWS</text></svg>\n`;
  const stacked = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 610" role="img" aria-labelledby="title desc"><title id="title">GenzyWayNews stacked lockup ${name}</title><desc id="desc">Circular Devanagari-inspired badge above bold GenzyWay News wordmark.</desc>${icon(300,180,125,c.circle,c.ink)}<text x="300" y="390" text-anchor="middle" font-family="Poppins, Outfit, Arial, sans-serif" font-size="64" font-weight="800" letter-spacing="-1.5" fill="${c.label}">GenzyWay</text><text x="300" y="440" text-anchor="middle" font-family="Poppins, Outfit, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="5" fill="${c.circle}">NEWS</text><text x="300" y="490" text-anchor="middle" font-family="Poppins, Outfit, Arial, sans-serif" font-size="15" font-weight="700" letter-spacing="6" fill="${c.label}">SIGNAL. CONTEXT. NOW.</text></svg>\n`;
  fs.writeFileSync(path.join(output, `lockup-horizontal-${name}.svg`), horizontal);
  fs.writeFileSync(path.join(output, `lockup-stacked-${name}.svg`), stacked);
}
fs.copyFileSync(path.join(output, "icon-ja-nukta.svg"), path.join(output, "circular-favicon.svg"));
console.log("Generated circular badge lockup variants");
