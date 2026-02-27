# Signal Dashboard — Visual Overhaul Design

**Date**: 2026-02-27
**Direction**: Bold, technical, high-contrast — "Cognitive Logger meets Mission Control"
**Scope**: Dashboard, Logs, Header, Chat, Profile, global styles. Landing page excluded.

## Typography

| Role | Font | Weight | Where |
|------|------|--------|-------|
| Display/Headings | Geist | 600, 700 | Page titles, card titles, hero headlines, nav |
| Body/UI | Geist | 400, 500 | Descriptions, labels, buttons, body text |
| Data/Numbers | Geist Mono | 400, 500 | Stats, chart values, counters, timestamps, badges |

Removed: Satoshi, Clash Display, Space Grotesk imports. `.font-satoshi`, `.font-clash`, `.font-space` utility classes remapped to Geist.

Tailwind config:
```
sans: ['Geist', 'system-ui', 'sans-serif']
mono: ['Geist Mono', 'monospace']
```

## Color System

### Dark Mode (Primary)

| Token | Value | Rationale |
|-------|-------|-----------|
| `--background` | `220 14% 4%` | Cool-blue tint, not pure black |
| `--card` | `220 13% 7%` | Cards barely lift off background |
| `--card-foreground` | `210 10% 93%` | Slightly warm white |
| `--border` | `220 10% 12%` | Subtle, low-contrast |
| `--muted` | `220 12% 11%` | Quiet secondary surfaces |
| `--muted-foreground` | `220 8% 50%` | Dimmed but readable |

### Light Mode (Secondary)

| Token | Value |
|-------|-------|
| `--background` | `220 14% 97%` |
| `--card` | `0 0% 100%` |
| `--border` | `220 10% 88%` |
| `--muted` | `220 12% 93%` |
| `--muted-foreground` | `220 8% 45%` |

### Data Colors (Luminous)

| Role | HSL | Usage |
|------|-----|-------|
| Teal (Signal) | `168 70% 48%` | Primary data, positive states, CTAs |
| Rose (Alert) | `350 75% 58%` | Contradictions, negative sentiment |
| Amber (Neutral) | `42 90% 55%` | Neutral data, streaks, mid-energy |
| Violet (AI) | `265 70% 62%` | AI explainer, insight badges |
| Cyan (Info) | `190 80% 50%` | Secondary data lines, hover states |

## Card System

### Tiers

| Tier | Used For | Treatment |
|------|----------|-----------|
| Hero | Streak Widget, Contradiction Flow (row 1) | Gradient border (teal→violet 15% opacity), larger padding |
| Standard | All other chart cards | 1px `border-border`, solid `bg-card` |
| Stat Pill | Top stats bar | No border, monospace numbers, colored dot indicator |

### Removed
All glassmorphism: `glass-card`, `glass-stat`, `glass-teal`, `glass-rose`, `glass-feature-card`, `glass-light`, `glass-violet`, `dashboard-glass-bg`. All `backdrop-filter: blur()` on cards. `card-hover` shadow animation replaced with border-color brighten.

## Motion

### Keep (refined)
- `fade-in` — page entry
- `slide-up` — card stagger on mount (300ms, 50ms stagger)
- `chart-line-draw` — SVG path animation
- `chart-point-pop` — data point entrance
- `AnimatedCounter` — stat numbers

### Remove
`glow-teal`, `glow-rose`, `pulse-slow`, `pulse-soft`, `pulse-glow`, `float` (all variants), `brand-shimmer`, `cta-pulse`, `moth-fly`, `wing-flap-*` (from dashboard context), `gradient-shift`

### New
- Card mount: `translateY(8px)→0 + opacity 0→1`, 300ms, cubic-bezier(0.16, 1, 0.3, 1)
- Card hover: border-color brighten 150ms
- Button hover: `scale(1.02)` 100ms
- Nav active: 2px teal underline, slide-in from left 200ms

## Header
- Height: `h-16` → `h-12`
- Background: solid `bg-background`, no backdrop-blur
- Border: `border-border/50`
- Active nav: 2px bottom bar in teal
- Wordmark: plain "becoming" in Geist 600, tracking -0.03em

## Logs Page
- Background: `bg-background` (flat)
- Tab bar: solid bg, `border-border/50`
- Active tab: 2px teal bottom border
- Entries table: `bg-card border border-border rounded-md`
- Entry count badge: Geist Mono number, no background

## Files Changed

1. `index.css` — fonts, glass removal, animation cleanup, new utilities
2. `tailwind.config.js` — font family, color tokens, keyframes
3. `DashboardGrid.tsx` — ChartCard tiers, no glass
4. `Dashboard.tsx` — flat bg, stagger classes
5. `Header.tsx` — slim, solid, teal indicator
6. `Logs.tsx` — flat bg, solid tab bar, crisp cards
