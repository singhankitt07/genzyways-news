import fs from "node:fs";

const source = "Brand/GenzyWays News-logo-dark.svg";
const target = "Brand/GenzyWays News-logo-light.svg";
const dark = fs.readFileSync(source, "utf8");
let amberCount = 0;
const light = dark
    .replaceAll("#FFFFFF", "#111111")
    .replaceAll("#8A8F98", "#6B7078")
    .replace(/#F5A623/g, (value) => {
        amberCount += 1;
        return amberCount === 2 ? "#C77F00" : value;
    });
fs.writeFileSync(target, light);
console.log(`Wrote ${target}`);
