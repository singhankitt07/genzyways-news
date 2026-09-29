# Color variants

The SVGs ship with these default fallbacks:

- Light: `--brand-bg: #FFFFFF`, `--brand-ink: #0F1115`, `--brand-accent: #F26B5B`, `--brand-amber: #F5A623`
- Dark: `--brand-bg: #0F1115`, `--brand-ink: #FFFFFF`, `--brand-accent: #F26B5B`, `--brand-amber: #F5A623`
- One-color black: set `--brand-bg: #FFFFFF`, `--brand-ink: #0F1115`, and set accent/amber to `currentColor`.
- One-color white: set `--brand-bg: #0F1115`, `--brand-ink: #FFFFFF`, and set accent/amber to `currentColor`.

When using an SVG inline, override variables on the root `<svg>` or a wrapper:

```css
.brand-mark { --brand-bg: var(--bg); --brand-ink: var(--text-primary); --brand-accent: var(--accent); --brand-amber: #F5A623; }
```
