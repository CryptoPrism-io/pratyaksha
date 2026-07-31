# Design — Becoming (Pratyaksha dashboard)

A locked design system for this app. Every page redesign reads this file before
emitting code. Do not regenerate per page — extend or amend this file when the
system needs to grow.

## Genre
modern-minimal with an atmospheric dark canvas. Functional data app first, brand
glow second. Teal is the signal accent; violet is the AI accent. Everything else
is a hue violation.

## Macrostructure family
- Marketing pages (/, /blog, /research, /brand): Split Studio or Bento — text
  beside proof, asymmetric tiles. Centered hero allowed on / only.
- App pages (/dashboard, /logs, /compare, /chat, /insights, /profile): Workbench —
  function carries the page. No enrichment, no decorative orbs, no gradient chrome.
- Auth pages (/login, /signup): minimal card, no glow, no animated brand mark.

## Theme
- Paper: near-black cool `hsl(220 14% 4%)` (dark) / white (light)
- Ink: `hsl(210 10% 93%)` (dark) / `hsl(220 14% 4%)` (light)
- Accent (signal): teal `hsl(168 70% 48%)` dark / `hsl(168 70% 40%)` light
- Accent (AI): violet `hsl(265 70% 62%)` dark / `hsl(265 70% 55%)` light
- Rule: `hsl(220 10% 12%)` dark / `hsl(220 14% 12%)` light
- Focus ring: `hsl(210 10% 70%)`

The chart palette (`--chart-1..5`) is reserved for data visualization only —
never for decorative cards, badges, or icon tiles.

## Typography
- Display: Space Grotesk (font-space), weight 600–700, roman
- Body: system sans (default), weight 400
- Mono: Geist Mono (signal-data), weight 400 — for all numeric values
- Display tracking: -0.02em to -0.03em
- Type scale anchor: page hero = clamp(2.5rem, 5vw, 4rem)

## Spacing
4-point scale via Tailwind defaults. Sections alternate padding rhythm
(py-16 / py-24 / py-32) — never uniform.

## Motion
- Easings: cubic-bezier(0.16, 1, 0.3, 1) for entrances; standard for hovers
- Reveal pattern: hero only, fade + 8px rise. Everything else static.
- Reduced-motion fallback: all infinite animations off; opacity-only, ≤ 150 ms.
- No hover scale on interactive elements — color/border transitions only.

## Microinteractions stance
- Silent success. No celebratory toasts.
- Hover delay 800 ms · focus delay 0 ms.
- All hover-only affordances must have a `:focus-visible` counterpart.
- No glow shadows on dark; use 1px borders and lightness elevation.

## CTA voice
- Primary CTA: solid fill (teal `bg-teal-500` or violet `bg-violet-600`),
  pill radius, `hover:bg-*` darken only. No gradient, no scale, no glow, no pulse.
- Secondary CTA: outline (`border-border text-foreground hover:bg-muted`).

## Per-page allowances
- Marketing pages MAY use enrichment (Tier-A CSS art, Tier-B SVG).
- App pages MUST NOT use enrichment — function carries the page.
- Gradient text is banned everywhere. The brand wordmark renders solid teal.

## What pages MUST share
- The wordmark (solid teal, Space Grotesk).
- The teal + violet accent pair and their placement.
- The CTA voice (pill, solid fill, hover-darken).
- Tabular numerals on every stat figure (`.signal-data`).
- `:focus-visible` rings on every interactive element.

## What pages MAY differ on
- Macrostructure within the page-type family.
- Hero archetype (within the family's allowance) — centered only on /.
- Layout asymmetry — vary section padding and alignment.

## Exports

Drop-in tokens (Tailwind v4 `@theme`):

```css
@theme {
  --color-paper:    hsl(220 14% 4%);
  --color-ink:      hsl(210 10% 93%);
  --color-accent:   hsl(168 70% 48%);
  --color-accent-2: hsl(265 70% 62%);
  --color-rule:     hsl(220 10% 12%);
  --color-focus:    hsl(210 10% 70%);
  --font-display:   "Space Grotesk", ui-sans-serif, sans-serif;
  --font-mono:      "Geist Mono", ui-monospace, monospace;
}
```
