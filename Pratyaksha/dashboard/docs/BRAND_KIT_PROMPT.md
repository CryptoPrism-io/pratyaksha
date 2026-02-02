# Brand & Digital Identity Kit Generator Prompt

Use this prompt to create a comprehensive brand and digital identity kit for any product or company.

---

## THE PROMPT

```
Create a comprehensive Digital Identity Kit for [PRODUCT/COMPANY NAME] with the following specifications:

## 1. BRAND FOUNDATION

**Product Info:**
- Name: [PRODUCT NAME]
- Tagline: [PRIMARY TAGLINE]
- Secondary Tagline: [OPTIONAL]
- Industry: [e.g., SaaS, E-commerce, Health Tech]
- Website URL: [e.g., product.app]

**Brand Personality:**
- Tone: [e.g., Professional, Playful, Minimal, Bold]
- Values: [e.g., Trust, Innovation, Simplicity]

**Logo/Symbol:**
- Description: [e.g., "A moth symbol representing transformation"]
- SVG or image file: [provide if available]

---

## 2. COLOR PALETTE

Define 4 color groups with 4-5 shades each:

**Primary Color:** [e.g., Teal]
- Dark: #[hex] - Usage: [e.g., "Primary buttons"]
- Base: #[hex] - Usage: [e.g., "Main brand color"]
- Light: #[hex] - Usage: [e.g., "Hover states"]
- Accent: #[hex] - Usage: [e.g., "Highlights"]
- Tint: #[hex] - Usage: [e.g., "Background tint"]

**Secondary Color:** [e.g., Rose]
- (same structure)

**Accent Color:** [e.g., Amber]
- (same structure)

**Neutral Color:** [e.g., Stone/Gray]
- (same structure)

**Brand Gradients:**
- Primary: [e.g., "Teal → Rose horizontal"]
- Logo: [e.g., "Teal → Rose diagonal"]

---

## 3. TYPOGRAPHY

Define 2-3 typefaces:

| Typeface | Usage | Weights |
|----------|-------|---------|
| [Display Font] | Headlines, Logo | Semibold, Bold |
| [Body Font] | Body text, UI | Regular, Medium, Bold |
| [Accent Font] | Taglines, Quotes | Medium, Italic |

---

## 4. SOCIAL MEDIA BANNERS

Create banners for all platforms with download buttons:

| Platform | Dimensions | Scale for Export |
|----------|------------|------------------|
| LinkedIn Cover | 1584 × 396px | 2x |
| Facebook Cover | 820 × 312px | 1x |
| Twitter/X Header | 1500 × 500px | 2x |
| Instagram Post | 1080 × 1080px | 2.7x |
| YouTube Channel Art | 2560 × 423px | 4x |
| WhatsApp Business Profile | 640 × 640px | 2.13x |
| Website OG Image | 1200 × 630px | 2x |

**Banner Design Elements:**
- Gradient accent bar (top, bottom, or side)
- Logo placement (centered or left-aligned)
- Company name + tagline
- Product offerings/features (subtle)
- Watermark logo (5% opacity in background)

---

## 5. APP ICONS

Generate icons in both Light and Dark variants:

**Sizes:** 512px, 256px, 192px, 128px, 64px, 48px, 32px, 16px

**Light Variant:**
- Background: Light gradient (e.g., stone-50 to stone-100)
- Logo: Dark/colored version

**Dark Variant:**
- Background: Dark gradient (e.g., stone-800 to stone-900)
- Logo: Light/gradient version

**Favicon Preview:** Show 16px icon in browser tab mockup

---

## 6. PROFILE PICTURES

Circular profile images for:
- LinkedIn/Facebook: 400×400px
- Twitter/Instagram: 180×180px
- WhatsApp: 110×110px

Both Light and Dark variants.

---

## 7. LOGO USAGE GUIDELINES

**Background Compatibility:**
- On Light backgrounds
- On Dark backgrounds
- On Gradient backgrounds

**Wordmark Variants:**
- Default (standard logo type)
- Modern (alternative font)
- Split (broken into parts)
- Minimal (simplified)

**Logo + Wordmark Combinations:**
- Show in Small, Medium, Large sizes

---

## 8. TAGLINES COLLECTION

Create 4-6 taglines:
- Primary (short, punchy)
- Secondary (slightly longer)
- Descriptive (explains the product)
- Mission (company purpose)
- Action-oriented (CTA style)

---

## 9. USAGE GUIDELINES

**Don'ts:**
- Don't rotate the logo
- Don't stretch or distort
- Don't change brand colors
- Don't add effects/shadows
- Don't place on busy backgrounds
- Don't use low contrast

**Clear Space:**
- Minimum space = 1x logo height on all sides

**Minimum Sizes:**
- Digital: 24px minimum width
- Print: 0.5 inch / 12mm minimum
- Favicon: 16x16px (simplified version)

---

## 10. DOWNLOAD FUNCTIONALITY

**Individual Downloads:**
- Each banner/icon has its own download button
- Use html2canvas for capture
- Export as PNG with proper scale

**Download All as ZIP:**
- Package all assets in organized folders:
  - /Banners
  - /Icons/Light
  - /Icons/Dark
  - /Profiles
  - /Website
- Use JSZip + FileSaver libraries
- Show progress percentage during generation

---

## 11. PAGE STYLING

**Dark Theme Layout:**
- Background: #0a0f14 (very dark blue-black)
- Section dividers: 1px white/10% opacity
- Section numbers: Large (48-64px), extralight, 20% opacity
- Section titles: Uppercase, letter-spacing 3px, white
- Labels: 11px, uppercase, tracking-wider, white/40-50%
- Dimension badges: Accent color (e.g., teal-400)

**Card Styling:**
- Background: white/2% opacity
- Border: 1px white/10% opacity
- Border-radius: 8px
- Padding: 20px

**Button Styling (Download):**
- Border: 1px accent color/50%
- Text: Accent color
- Hover: Background accent/10%, border solid
- Uppercase, letter-spacing, 10px font

**Download All Button:**
- Gradient background (accent colors)
- Dark text
- Larger padding
- Hover lift effect with shadow
```

---

## EXAMPLE OUTPUT STRUCTURE

```
Digital Identity Kit
├── 01. Social Media Banners
│   ├── LinkedIn Cover (1584×396)
│   ├── Facebook Cover (820×312)
│   ├── Twitter Header (1500×500)
│   ├── Instagram Post (1080×1080)
│   ├── YouTube Banner (2560×423)
│   ├── WhatsApp Profile (640×640)
│   └── OG Image (1200×630)
├── 02. App Icons
│   ├── Light Variant (512-16px)
│   └── Dark Variant (512-16px)
├── 03. Profile Pictures
│   ├── Light (400, 180, 110px)
│   └── Dark (400, 180, 110px)
├── 04. Color Palette
│   ├── Primary (5 shades)
│   ├── Secondary (5 shades)
│   ├── Accent (4 shades)
│   └── Neutral (5 shades)
├── 05. Typography
│   ├── Display Font
│   ├── Body Font
│   └── Accent Font
├── 06. Logo & Wordmark
│   ├── Logo on backgrounds
│   ├── Wordmark variants
│   └── Combinations
├── 07. Taglines
│   ├── Primary
│   ├── Secondary
│   ├── Descriptive
│   └── Mission
└── 08. Usage Guidelines
    ├── Don'ts
    ├── Clear space
    └── Minimum sizes
```

---

## TECH STACK FOR IMPLEMENTATION

**React/Next.js:**
- html2canvas: Capture DOM elements as images
- jszip: Create ZIP archives
- file-saver: Save files client-side
- Dynamic imports for code-splitting

**Vanilla JS/HTML:**
- Same libraries via CDN
- Inline SVG for crisp logo rendering

**Tailwind CSS Classes for Dark Theme:**
```css
bg-[#0a0f14]                 /* Page background */
bg-white/[0.02]              /* Card background */
border-white/10              /* Borders */
text-white/40                /* Muted text */
text-white/90                /* Primary text */
text-[10px] tracking-wider   /* Labels */
text-5xl font-extralight     /* Section numbers */
```

---

## CUSTOMIZATION TIPS

1. **For B2B/Corporate:** Use more muted colors, serif fonts, professional imagery
2. **For Consumer Apps:** Bolder colors, rounded elements, playful icons
3. **For Luxury Brands:** Gold/black palette, elegant serifs, minimal layout
4. **For Tech Startups:** Gradient-heavy, modern sans-serifs, animated elements

---

This prompt and structure can be adapted for any product by replacing the placeholder values with actual brand information.
