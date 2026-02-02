import { useState } from "react"
import { MothLogo } from "@/components/brand/MothLogo"
import { BrandWordmark, BrandLogo } from "@/components/brand/BrandWordmark"
import { Copy, Check, Download } from "lucide-react"
import { toast } from "sonner"

// Brand Colors
const BRAND_COLORS = {
  primary: {
    name: "Teal",
    colors: [
      { name: "Teal 800", hex: "#0d9488", usage: "Primary dark" },
      { name: "Teal 600", hex: "#0f766e", usage: "Primary" },
      { name: "Teal 500", hex: "#14b8a6", usage: "Primary light" },
      { name: "Teal 400", hex: "#2dd4bf", usage: "Accent" },
      { name: "Teal 100", hex: "#ccfbf1", usage: "Background tint" },
    ],
  },
  secondary: {
    name: "Rose",
    colors: [
      { name: "Rose 800", hex: "#9f1239", usage: "Secondary dark" },
      { name: "Rose 700", hex: "#be123c", usage: "Secondary" },
      { name: "Rose 500", hex: "#f43f5e", usage: "Secondary light" },
      { name: "Rose 400", hex: "#fb7185", usage: "Accent" },
      { name: "Rose 100", hex: "#ffe4e6", usage: "Background tint" },
    ],
  },
  accent: {
    name: "Amber",
    colors: [
      { name: "Amber 700", hex: "#b45309", usage: "Accent dark" },
      { name: "Amber 500", hex: "#f59e0b", usage: "Accent" },
      { name: "Amber 400", hex: "#fbbf24", usage: "Highlight" },
      { name: "Amber 100", hex: "#fef3c7", usage: "Background tint" },
    ],
  },
  neutral: {
    name: "Neutral",
    colors: [
      { name: "Stone 900", hex: "#1c1917", usage: "Body/text dark" },
      { name: "Stone 800", hex: "#292524", usage: "Background dark" },
      { name: "Stone 600", hex: "#57534e", usage: "Muted text" },
      { name: "Stone 200", hex: "#e7e5e4", usage: "Border light" },
      { name: "Stone 50", hex: "#fafaf9", usage: "Background light" },
    ],
  },
}

// Typography
const TYPOGRAPHY = [
  {
    name: "Clash Display",
    className: "font-clash",
    usage: "Headlines, Logo, Numbers",
    weights: ["600 Semibold", "700 Bold"],
  },
  {
    name: "Satoshi",
    className: "font-satoshi",
    usage: "Body text, UI elements",
    weights: ["400 Regular", "500 Medium", "700 Bold"],
  },
  {
    name: "Space Grotesk",
    className: "font-space",
    usage: "Hero text, Taglines",
    weights: ["500 Medium", "600 Semibold", "700 Bold"],
  },
  {
    name: "Syne",
    className: "font-syne",
    usage: "Impact headlines",
    weights: ["600 Semibold", "700 Bold", "800 ExtraBold"],
  },
]

function ColorSwatch({ name, hex, usage }: { name: string; hex: string; usage: string }) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(hex)
    setCopied(true)
    toast.success(`Copied ${hex}`)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyToClipboard}
      className="group flex flex-col text-left"
    >
      <div
        className="w-full h-20 rounded-lg mb-2 ring-1 ring-black/5 group-hover:ring-2 group-hover:ring-primary/50 transition-all flex items-center justify-center"
        style={{ backgroundColor: hex }}
      >
        {copied ? (
          <Check className="h-5 w-5 text-white drop-shadow-md" />
        ) : (
          <Copy className="h-4 w-4 text-white/0 group-hover:text-white/80 drop-shadow-md transition-all" />
        )}
      </div>
      <span className="text-sm font-medium">{name}</span>
      <span className="text-xs text-muted-foreground font-mono">{hex}</span>
      <span className="text-xs text-muted-foreground">{usage}</span>
    </button>
  )
}

export function BrandKit() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <MothLogo size="xl" animated />
            <BrandWordmark size="2xl" variant="default" animated />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Brand Kit</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The complete visual identity guide for Becoming. Use these assets consistently across all touchpoints.
          </p>
        </div>

        {/* Logo Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Logo</h2>
          <p className="text-muted-foreground mb-8">
            The Becoming moth represents transformation, emergence, and the journey of self-discovery.
          </p>

          {/* Logo on different backgrounds */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Light background */}
            <div className="rounded-xl bg-white p-8 flex flex-col items-center justify-center gap-4 ring-1 ring-black/5">
              <MothLogo size="xl" />
              <span className="text-xs text-stone-500">On Light</span>
            </div>
            {/* Dark background */}
            <div className="rounded-xl bg-stone-900 p-8 flex flex-col items-center justify-center gap-4">
              <MothLogo size="xl" />
              <span className="text-xs text-stone-400">On Dark</span>
            </div>
            {/* Gradient background */}
            <div className="rounded-xl bg-gradient-to-br from-teal-600 to-rose-600 p-8 flex flex-col items-center justify-center gap-4">
              <MothLogo size="xl" />
              <span className="text-xs text-white/70">On Gradient</span>
            </div>
          </div>

          {/* Logo sizes */}
          <h3 className="text-lg font-semibold mb-4">Logo Sizes</h3>
          <div className="flex items-end gap-8 p-6 rounded-xl bg-muted/30">
            <div className="text-center">
              <MothLogo size="sm" />
              <span className="text-xs text-muted-foreground block mt-2">Small (24px)</span>
            </div>
            <div className="text-center">
              <MothLogo size="md" />
              <span className="text-xs text-muted-foreground block mt-2">Medium (32px)</span>
            </div>
            <div className="text-center">
              <MothLogo size="lg" />
              <span className="text-xs text-muted-foreground block mt-2">Large (40px)</span>
            </div>
            <div className="text-center">
              <MothLogo size="xl" />
              <span className="text-xs text-muted-foreground block mt-2">XL (56px)</span>
            </div>
          </div>
        </section>

        {/* Wordmark Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Wordmark</h2>
          <p className="text-muted-foreground mb-8">
            The "Becoming" wordmark uses Clash Display with our signature teal-to-rose gradient.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Default variant */}
            <div className="rounded-xl bg-white dark:bg-stone-900 p-8 ring-1 ring-black/5">
              <span className="text-xs text-muted-foreground mb-4 block">Default</span>
              <BrandWordmark size="xl" variant="default" />
            </div>
            {/* Modern variant */}
            <div className="rounded-xl bg-white dark:bg-stone-900 p-8 ring-1 ring-black/5">
              <span className="text-xs text-muted-foreground mb-4 block">Modern (Syne)</span>
              <BrandWordmark size="xl" variant="modern" />
            </div>
            {/* Split variant */}
            <div className="rounded-xl bg-white dark:bg-stone-900 p-8 ring-1 ring-black/5">
              <span className="text-xs text-muted-foreground mb-4 block">Split</span>
              <BrandWordmark size="xl" variant="split" />
            </div>
            {/* Minimal variant */}
            <div className="rounded-xl bg-white dark:bg-stone-900 p-8 ring-1 ring-black/5">
              <span className="text-xs text-muted-foreground mb-4 block">Minimal</span>
              <BrandWordmark size="xl" variant="minimal" />
            </div>
          </div>

          {/* Logo + Wordmark combo */}
          <h3 className="text-lg font-semibold mt-8 mb-4">Logo + Wordmark</h3>
          <div className="flex items-center gap-8 p-6 rounded-xl bg-muted/30">
            <BrandLogo size="sm" />
            <BrandLogo size="md" />
            <BrandLogo size="lg" />
          </div>
        </section>

        {/* Colors Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Colors</h2>
          <p className="text-muted-foreground mb-8">
            Our palette centers on teal (growth) and rose (reflection), with amber for balance.
          </p>

          {Object.entries(BRAND_COLORS).map(([key, palette]) => (
            <div key={key} className="mb-8">
              <h3 className="text-lg font-semibold mb-4">{palette.name}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {palette.colors.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>
          ))}

          {/* Gradients */}
          <h3 className="text-lg font-semibold mt-8 mb-4">Brand Gradients</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl p-6 bg-gradient-to-r from-teal-600 via-teal-500 to-rose-500 text-white">
              <span className="text-sm font-medium">Primary Gradient</span>
              <p className="text-xs opacity-80 mt-1">Teal → Rose (horizontal)</p>
            </div>
            <div className="rounded-xl p-6 bg-gradient-to-br from-teal-600 to-rose-600 text-white">
              <span className="text-sm font-medium">Logo Gradient</span>
              <p className="text-xs opacity-80 mt-1">Teal → Rose (diagonal)</p>
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Typography</h2>
          <p className="text-muted-foreground mb-8">
            Our type system uses Clash Display for headlines and Satoshi for body text.
          </p>

          <div className="space-y-6">
            {TYPOGRAPHY.map((font) => (
              <div key={font.name} className="rounded-xl bg-muted/30 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                  <h3 className={`text-3xl ${font.className}`}>{font.name}</h3>
                  <span className="text-sm text-muted-foreground">{font.usage}</span>
                </div>
                <p className={`text-xl ${font.className} mb-2`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p className={`text-base ${font.className} text-muted-foreground mb-2`}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {font.weights.map((weight) => (
                    <span
                      key={weight}
                      className="text-xs px-2 py-1 rounded bg-background"
                    >
                      {weight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Taglines */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Taglines</h2>
          <p className="text-muted-foreground mb-8">
            Approved messaging for marketing and brand communications.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-muted/30 p-6">
              <span className="text-xs text-muted-foreground mb-2 block">Primary</span>
              <p className="text-xl font-space font-semibold">Stop drifting. Start becoming.</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-6">
              <span className="text-xs text-muted-foreground mb-2 block">Secondary</span>
              <p className="text-xl font-space font-semibold">Who you want to be.</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-6">
              <span className="text-xs text-muted-foreground mb-2 block">Descriptive</span>
              <p className="text-lg font-satoshi">A journal. A dashboard. An AI that keeps you on track.</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-6">
              <span className="text-xs text-muted-foreground mb-2 block">Mission</span>
              <p className="text-lg font-satoshi">Helping you see your patterns, so you can become who you define.</p>
            </div>
          </div>
        </section>

        {/* Logo Clear Space */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Clear Space & Minimum Size</h2>
          <p className="text-muted-foreground mb-8">
            Maintain adequate clear space around the logo for visual impact.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white dark:bg-stone-900 p-8 ring-1 ring-black/5">
              <div className="relative inline-block p-8 border-2 border-dashed border-teal-500/30">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-xs text-teal-600 bg-white dark:bg-stone-900 px-1">
                  1x height
                </div>
                <MothLogo size="xl" />
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Clear space = 1x the height of the moth body
              </p>
            </div>
            <div className="rounded-xl bg-muted/30 p-8">
              <h4 className="font-semibold mb-4">Minimum Sizes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Digital: 24px minimum width</li>
                <li>• Print: 0.5 inch / 12mm minimum</li>
                <li>• Favicon: 16x16px (simplified)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Don'ts */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Logo Misuse</h2>
          <p className="text-muted-foreground mb-8">
            Please avoid these common mistakes when using our brand assets.
          </p>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Don't rotate the logo",
              "Don't stretch or distort",
              "Don't change colors",
              "Don't add effects/shadows",
              "Don't place on busy backgrounds",
              "Don't use low contrast",
            ].map((rule, i) => (
              <div
                key={i}
                className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-center"
              >
                <span className="text-sm text-rose-600 dark:text-rose-400">{rule}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Download Section */}
        <section className="text-center py-12 rounded-xl bg-gradient-to-br from-teal-500/10 to-rose-500/10 border border-teal-500/20">
          <h2 className="text-2xl font-bold mb-4">Download Assets</h2>
          <p className="text-muted-foreground mb-6">
            Get the full brand kit including SVG logos, color swatches, and guidelines.
          </p>
          <button
            onClick={() => toast.info("Brand kit download coming soon!")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-teal-600 to-teal-500 text-white font-medium hover:from-teal-500 hover:to-teal-400 transition-all"
          >
            <Download className="h-5 w-5" />
            Download Brand Kit
          </button>
        </section>
      </div>
    </div>
  )
}
