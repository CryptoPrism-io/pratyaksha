# Milestone 4.1: Complete Asset Inventory

## Asset Budget Summary

| Category | Count | Total Size |
|----------|-------|------------|
| 3D Models | 1 | ~500KB |
| Lottie Animations | 14 | ~950KB |
| Frame Sequences | 64 | ~1.5MB |
| Static Images | 15+ | ~1.2MB |
| SVG Diagrams | 5 | ~50KB |
| **Total** | **~100 files** | **~4.2MB** |

---

## 3D Models

| Asset | Format | Size | Specs | Source | Phase |
|-------|--------|------|-------|--------|-------|
| brain-low-poly.glb | GLB (Draco) | <500KB | 5-10k polys | Poly Pizza / Sketchfab | 1 |

### Brain Model Requirements

- **Polygon Count:** 5,000 - 10,000 (low-poly stylized)
- **Compression:** Draco enabled
- **Texture:** Optional normal map (512x512)
- **Format:** GLTF Binary (.glb)

### Optimization Pipeline

```bash
# Install gltf-pipeline
npm install -g gltf-pipeline

# Compress with Draco
gltf-pipeline -i brain.glb -o brain-draco.glb --draco.compressionLevel 10

# Verify size
ls -la brain-draco.glb  # Should be <500KB
```

### Recommended Sources

1. **Poly Pizza** - Free CC0 models (poly.pizza)
2. **Sketchfab** - Free/Paid models (sketchfab.com)
3. **CGTrader** - Professional models
4. **Custom Blender** - 8-12 hours work

---

## Lottie Animations

### Phase 1: Hero

| Asset | File | Size | Duration | Loop |
|-------|------|------|----------|------|
| Loading Spinner | loading-spinner.json | <50KB | 1s | Yes |

### Phase 2: Pipeline

| Asset | File | Size | Duration | Loop |
|-------|------|------|----------|------|
| Intent Agent Icon | intent-agent.json | <30KB | 2s | Yes |
| Emotion Agent Icon | emotion-agent.json | <30KB | 2s | Yes |
| Theme Agent Icon | theme-agent.json | <30KB | 2s | Yes |
| Insight Agent Icon | insight-agent.json | <30KB | 2s | Yes |

### Phase 3: Bento Charts

| Asset | File | Size | Duration | Loop |
|-------|------|------|----------|------|
| Emotional Timeline | emotional-timeline.json | <100KB | 3s | Yes |
| Energy Radar | energy-radar.json | <100KB | 3s | Yes |
| Theme Cloud | theme-cloud.json | <100KB | 4s | Yes |
| Heatmap Fill | heatmap.json | <80KB | 2s | Yes |
| Sankey Flow | sankey-flow.json | <150KB | 3s | Yes |
| Mode Pie | mode-pie.json | <60KB | 2s | Yes |
| Sentiment Pulse | sentiment-pulse.json | <60KB | 2s | Yes |
| Contradiction Tracker | contradiction-tracker.json | <80KB | 3s | Yes |
| Particle Burst | particle-burst.json | <50KB | 0.5s | No |

### Lottie Creation Options

1. **LottieFiles Marketplace** - Pre-made animations
2. **LottieCreator** - Online editor
3. **After Effects + Bodymovin** - Custom creation
4. **Rive** - Alternative animation format

---

## Frame Sequences

### Phase 2: Sankey Contradiction Animation

| Asset | Frames | Dimensions | Format | Size Each | Total |
|-------|--------|------------|--------|-----------|-------|
| sankey-frame-*.webp | 40 | 1280x400 | WebP | ~20KB | ~800KB |

**File Naming:** `sankey-frame-000.webp` to `sankey-frame-039.webp`

### Phase 1: Brain Rotation (Mobile Fallback)

| Asset | Frames | Dimensions | Format | Size Each | Total |
|-------|--------|------------|--------|-----------|-------|
| brain-frame-*.webp | 24 | 800x800 | WebP | ~30KB | ~720KB |

**File Naming:** `brain-frame-00.webp` to `brain-frame-23.webp`

### Frame Sequence Creation

```bash
# From After Effects
# Export as PNG sequence, then convert to WebP

# Using ffmpeg
ffmpeg -i sankey-animation.mp4 -vf "fps=40,scale=1280:400" sankey-frame-%03d.png

# Convert to WebP
for f in *.png; do cwebp -q 85 "$f" -o "${f%.png}.webp"; done
```

---

## Static Images

### Hero & General

| Asset | Format | Dimensions | Size | Purpose |
|-------|--------|------------|------|---------|
| brain-static.webp | WebP | 800x800 | ~100KB | Mobile fallback |
| og-image.png | PNG | 1200x630 | ~150KB | Social sharing |
| favicon.svg | SVG | 32x32 | <5KB | Browser tab |
| logo.svg | SVG | 200x40 | <10KB | Navigation |
| logo-white.svg | SVG | 200x40 | <10KB | Footer |

### Bento Chart Previews (Static)

| Asset | Format | Dimensions | Size |
|-------|--------|------------|------|
| chart-timeline-static.webp | WebP | 400x400 | ~30KB |
| chart-radar-static.webp | WebP | 200x200 | ~20KB |
| chart-cloud-static.webp | WebP | 200x200 | ~20KB |
| chart-heatmap-static.webp | WebP | 400x200 | ~25KB |
| chart-sankey-static.webp | WebP | 400x200 | ~30KB |
| chart-pie-static.webp | WebP | 200x200 | ~15KB |
| chart-sentiment-static.webp | WebP | 200x200 | ~15KB |
| chart-contradiction-static.webp | WebP | 400x200 | ~25KB |

### Launch Assets

| Asset | Format | Dimensions | Size | Platform |
|-------|--------|------------|------|----------|
| ph-thumbnail.png | PNG | 240x240 | ~50KB | Product Hunt |
| ph-gallery-1.png | PNG | 1270x760 | ~200KB | Product Hunt |
| ph-gallery-2.png | PNG | 1270x760 | ~200KB | Product Hunt |
| ph-gallery-3.png | PNG | 1270x760 | ~200KB | Product Hunt |
| dashboard-preview.webp | WebP | 1920x1080 | ~150KB | Website |
| mobile-preview.webp | WebP | 390x844 | ~80KB | Website |

---

## SVG Diagrams & Icons

| Asset | File | Size | Purpose |
|-------|------|------|---------|
| neural-pipeline.svg | SVG | ~15KB | Science section diagram |
| shield-icon.svg | SVG | <2KB | Privacy badge |
| brain-icon.svg | SVG | <2KB | CBT badge |
| lock-icon.svg | SVG | <2KB | Security badge |
| check-icon.svg | SVG | <1KB | Pricing features |

### Using Lucide Icons

Most icons can come from Lucide React (already included):

```tsx
import { Shield, Brain, Lock, Check, ChevronRight } from 'lucide-react'
```

---

## Asset Directory Structure

```
pratyaksha-website/
├── public/
│   ├── models/
│   │   └── brain-low-poly.glb
│   ├── images/
│   │   ├── brain-static.webp
│   │   ├── og-image.png
│   │   ├── dashboard-preview.webp
│   │   ├── mobile-preview.webp
│   │   └── charts/
│   │       ├── chart-timeline-static.webp
│   │       ├── chart-radar-static.webp
│   │       └── ...
│   ├── animations/
│   │   ├── sankey/
│   │   │   ├── sankey-frame-000.webp
│   │   │   ├── sankey-frame-001.webp
│   │   │   └── ...
│   │   └── brain/
│   │       ├── brain-frame-00.webp
│   │       └── ...
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   └── assets/
│       └── lottie/
│           ├── loading-spinner.json
│           ├── intent-agent.json
│           ├── emotion-agent.json
│           ├── theme-agent.json
│           ├── insight-agent.json
│           ├── emotional-timeline.json
│           ├── energy-radar.json
│           ├── theme-cloud.json
│           ├── heatmap.json
│           ├── sankey-flow.json
│           ├── mode-pie.json
│           ├── sentiment-pulse.json
│           ├── contradiction-tracker.json
│           └── particle-burst.json
└── ...
```

---

## Asset Creation Checklist

### P0 - Must Have for Launch

- [ ] Brain 3D model (GLB)
- [ ] Brain static fallback (WebP)
- [ ] OG image (PNG)
- [ ] Favicon (SVG)
- [ ] Sankey frame sequence (40 WebP)
- [ ] 4 Agent icons (Lottie)
- [ ] Loading spinner (Lottie)
- [ ] 8 Chart preview Lotties

### P1 - Important

- [ ] Chart static previews (8 WebP)
- [ ] Dashboard preview screenshot
- [ ] Mobile preview screenshot
- [ ] Brain rotation frames (24 WebP)
- [ ] Particle burst Lottie

### P2 - Launch Assets

- [ ] Product Hunt thumbnail
- [ ] Product Hunt gallery (3 images)
- [ ] Twitter thread GIFs

---

## Performance Budget

| Category | Budget | Actual |
|----------|--------|--------|
| Total assets | <5MB | ~4.2MB |
| Initial load | <1MB | ~800KB |
| 3D load | <500KB | ~500KB |
| Lottie total | <1MB | ~950KB |
| Frame sequences | <2MB | ~1.5MB |

### Lazy Loading Strategy

1. **Critical (preload):** Brain model, loading spinner
2. **Viewport (lazy):** Lottie chart previews
3. **Scroll (lazy):** Frame sequences
4. **Hover (lazy):** Particle burst
