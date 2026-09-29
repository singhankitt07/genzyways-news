import { readFileSync } from "node:fs";
import postcss from "postcss";

const stylesheet = postcss.parse(readFileSync("app/globals.css", "utf8"));

function tokensFor(selector) {
    const rule = stylesheet.nodes.find((node) => node.type === "rule" && node.selector === selector);
    if (!rule) throw new Error(`Missing theme rule: ${selector}`);
    const tokens = {};
    rule.walkDecls(/^--/, (declaration) => { tokens[declaration.prop.slice(2)] = declaration.value; });
    return tokens;
}

function themeFrom(selector) {
    const tokens = { ...tokensFor(":root"), ...tokensFor(selector) };
    return {
        page: tokens.bg,
        surface: tokens.surface,
        surfaceHover: tokens["surface-hover"],
        text: tokens["text-primary"],
        secondary: tokens["text-secondary"],
        muted: tokens["text-muted"],
        link: tokens["color-link"],
        accent: tokens.accent,
        accentText: tokens["accent-text-on-dark"],
        onAccent: tokens["on-accent"],
        border: tokens.border,
        controlBorder: tokens["border-control"],
        focusRing: tokens["focus-ring"],
        footer: tokens["color-footer-background"],
        footerText: tokens["color-footer-text"],
        footerMuted: tokens["color-footer-muted"],
        action: tokens["color-action-background"]
    };
}

const themes = {
    Light: themeFrom('[data-theme="light"]'),
    Sepia: themeFrom('[data-theme="sepia"]'),
    Dark: themeFrom('[data-theme="dark"]')
};

function parseColor(value) {
    const hex = value.match(/^#([\da-f]{3}|[\da-f]{6})$/i);
    if (hex) {
        const digits = hex[1].length === 3 ? [...hex[1]].map((part) => part + part).join("") : hex[1];
        return [...digits.match(/../g)].map((part) => parseInt(part, 16)).concat(1);
    }
    const rgba = value.match(/^rgba?\(([^)]+)\)$/i);
    if (!rgba) throw new Error(`Unsupported color: ${value}`);
    const parts = rgba[1].split(/[\s,\/]+/).filter(Boolean).map(Number);
    return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

function composite(foreground, background) {
    const fg = parseColor(foreground);
    const bg = parseColor(background);
    const alpha = fg[3];
    return [0, 1, 2].map((index) => fg[index] * alpha + bg[index] * (1 - alpha));
}

function luminance(rgb) {
    const channels = rgb.map((channel) => {
        const normalized = channel / 255;
        return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(foreground, background) {
    const foregroundLum = luminance(composite(foreground, background));
    const backgroundLum = luminance(parseColor(background));
    const brightest = Math.max(foregroundLum, backgroundLum);
    const darkest = Math.min(foregroundLum, backgroundLum);
    return (brightest + 0.05) / (darkest + 0.05);
}

const rows = [];
const failures = [];

for (const [themeName, theme] of Object.entries(themes)) {
    const pairs = [
        ["Primary / page", theme.text, theme.page, 4.5],
        ["Primary / surface", theme.text, theme.surface, 4.5],
        ["Primary / hover surface", theme.text, theme.surfaceHover, 4.5],
        ["Secondary / page", theme.secondary, theme.page, 4.5],
        ["Secondary / surface", theme.secondary, theme.surface, 4.5],
        ["Muted / page", theme.muted, theme.page, 4.5],
        ["Muted / surface", theme.muted, theme.surface, 4.5],
        ["Muted / hover surface", theme.muted, theme.surfaceHover, 4.5],
        ["Link / page", theme.link, theme.page, 4.5],
        ["Link / surface", theme.link, theme.surface, 4.5],
        ["Accent icon / page", theme.accent, theme.page, 3],
        ["Accent icon / surface", theme.accent, theme.surface, 3],
        ["Accent text / page", theme.accentText, theme.page, 4.5],
        ["Accent text / surface", theme.accentText, theme.surface, 4.5],
        ["Button text / accent", theme.onAccent, theme.accent, 4.5],
        ["Control border / page", theme.controlBorder, theme.page, 3],
        ["Control border / surface", theme.controlBorder, theme.surface, 3],
        ["Focus ring / page", theme.focusRing, theme.page, 3],
        ["Focus ring / surface", theme.focusRing, theme.surface, 3],
        ["Footer text / footer", theme.footerText, theme.footer, 4.5],
        ["Footer muted / footer", theme.footerMuted, theme.footer, 4.5],
        ["Action text / action", theme.onAccent, theme.action, 4.5],
        ["Decorative border / page", theme.border, theme.page, null],
        ["Decorative border / surface", theme.border, theme.surface, null],
        ["Decorative footer border / footer", tokensFor(`[data-theme="${themeName.toLowerCase()}"]`)["color-footer-border"], theme.footer, null]
    ];

    for (const [label, foreground, background, threshold] of pairs) {
        const ratio = contrast(foreground, background);
        rows.push({ themeName, label, ratio, threshold });
        if (threshold && ratio < threshold) failures.push(`${themeName}: ${label} is ${ratio.toFixed(2)}:1; requires ${threshold}:1`);
    }
}

console.log("Theme | Foreground/background pair | Contrast | Requirement");
console.log("--- | --- | ---: | ---");
for (const row of rows) {
    console.log(`${row.themeName} | ${row.label} | ${row.ratio.toFixed(2)}:1 | ${row.threshold ? `${row.threshold}:1 minimum` : "Decorative only"}`);
}

if (failures.length) {
    console.error("\nContrast failures:");
    for (const failure of failures) console.error(`- ${failure}`);
    process.exitCode = 1;
} else {
    console.log("\nAll required text and UI contrast checks pass.");
}