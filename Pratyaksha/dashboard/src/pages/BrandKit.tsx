import { useState } from "react"
import { MothLogo } from "@/components/brand/MothLogo"
import { BrandWordmark, BrandLogo } from "@/components/brand/BrandWordmark"
import { Copy, Check, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import JSZip from "jszip"
import { saveAs } from "file-saver"

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
    <button onClick={copyToClipboard} className="group flex flex-col text-left">
      <div
        className="w-full h-16 rounded-lg mb-2 ring-1 ring-white/10 group-hover:ring-2 group-hover:ring-teal-500/50 transition-all flex items-center justify-center"
        style={{ backgroundColor: hex }}
      >
        {copied ? (
          <Check className="h-4 w-4 text-white drop-shadow-md" />
        ) : (
          <Copy className="h-3 w-3 text-white/0 group-hover:text-white/80 drop-shadow-md transition-all" />
        )}
      </div>
      <span className="text-xs font-medium text-white/90">{name}</span>
      <span className="text-[10px] text-white/50 font-mono">{hex}</span>
      <span className="text-[10px] text-white/40">{usage}</span>
    </button>
  )
}

// Moth SVG for banners - inline so we can capture it
function MothSVG({ className, variant = "gradient" }: { className?: string; variant?: "gradient" | "light" | "dark" }) {
  return (
    <svg viewBox="0 0 80 50" className={className} aria-label="Becoming logo">
      <defs>
        <linearGradient id="mothWingL" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
        <linearGradient id="mothWingR" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#be123c" />
        </linearGradient>
      </defs>
      <ellipse cx="25" cy="25" rx="20" ry="14" fill={variant === "light" ? "#134e4a" : "url(#mothWingL)"} />
      <ellipse cx="55" cy="25" rx="20" ry="14" fill={variant === "light" ? "#134e4a" : "url(#mothWingR)"} />
      <ellipse cx="40" cy="25" rx="3" ry="12" fill={variant === "dark" ? "#fafaf9" : "#134e4a"} />
      <line x1="38" y1="14" x2="32" y2="5" stroke={variant === "dark" ? "#fafaf9" : "#134e4a"} strokeWidth="2" strokeLinecap="round" />
      <line x1="42" y1="14" x2="48" y2="5" stroke={variant === "dark" ? "#fafaf9" : "#134e4a"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

// Download component for banners
function DownloadButton({ elementId, filename, scale = 2 }: { elementId: string; filename: string; scale?: number }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import("html2canvas")).default
      const element = document.getElementById(elementId)
      if (!element) {
        toast.error("Element not found")
        return
      }

      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        backgroundColor: null,
        logging: false,
      })

      const link = document.createElement("a")
      link.download = `${filename}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
      toast.success(`Downloaded ${filename}.png`)
    } catch (error) {
      console.error("Download failed:", error)
      toast.error("Download failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="mt-3 px-4 py-2 text-[10px] font-semibold tracking-wider uppercase border border-teal-500/50 text-teal-400 rounded hover:bg-teal-500/10 hover:border-teal-500 transition-all disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : `Download ${scale}x`}
    </button>
  )
}

// Download All as ZIP component
function DownloadAllButton() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const assets = [
    // Social Media Banners
    { id: "linkedin-banner", name: "Banners/LinkedIn-Banner-1584x396", scale: 2 },
    { id: "facebook-banner", name: "Banners/Facebook-Banner-820x312", scale: 1 },
    { id: "twitter-banner", name: "Banners/Twitter-Banner-1500x500", scale: 2 },
    { id: "instagram-banner", name: "Banners/Instagram-Post-1080x1080", scale: 2.7 },
    { id: "youtube-banner", name: "Banners/YouTube-Banner-2560x423", scale: 4 },
    { id: "whatsapp-profile", name: "Banners/WhatsApp-Profile-640x640", scale: 2.13 },
    { id: "og-image", name: "Website/OG-Image-1200x630", scale: 2 },
    // Profile Pictures
    { id: "profile-400-light", name: "Profiles/Light/Profile-400x400", scale: 2 },
    { id: "profile-400-dark", name: "Profiles/Dark/Profile-400x400", scale: 2 },
    // App Icons - Light (512px base)
    { id: "icon-512-light", name: "Icons/Light/icon-512x512", scale: 4 },
    // App Icons - Dark (512px base)
    { id: "icon-512-dark", name: "Icons/Dark/icon-512x512", scale: 4 },
  ]

  const handleDownloadAll = async () => {
    setLoading(true)
    setProgress(0)

    try {
      const html2canvas = (await import("html2canvas")).default
      const zip = new JSZip()

      let completed = 0
      const total = assets.length

      for (const asset of assets) {
        const element = document.getElementById(asset.id)
        if (element) {
          try {
            const canvas = await html2canvas(element, {
              scale: asset.scale,
              useCORS: true,
              backgroundColor: null,
              logging: false,
            })
            const dataUrl = canvas.toDataURL("image/png")
            const base64Data = dataUrl.split(",")[1]
            zip.file(`${asset.name}.png`, base64Data, { base64: true })
          } catch (e) {
            console.error(`Failed to capture ${asset.id}:`, e)
          }
        }
        completed++
        setProgress(Math.round((completed / total) * 100))
      }

      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, "Becoming-Digital-Identity-Kit.zip")
      toast.success("Downloaded all assets as ZIP!")
    } catch (error) {
      console.error("ZIP creation failed:", error)
      toast.error("Failed to create ZIP. Please try again.")
    } finally {
      setLoading(false)
      setProgress(0)
    }
  }

  return (
    <button
      onClick={handleDownloadAll}
      disabled={loading}
      className="mt-6 px-8 py-3.5 text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-teal-500 to-teal-400 text-stone-900 rounded-md hover:from-teal-400 hover:to-teal-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating... {progress}%
        </>
      ) : (
        <>
          <Download className="h-4 w-4" />
          Download All as ZIP
        </>
      )}
    </button>
  )
}

export function BrandKit() {
  return (
    <div className="min-h-screen bg-[#0a0f14]">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-white font-clash text-3xl font-light tracking-[6px] uppercase opacity-90 mb-2">
            Digital Identity Kit
          </h1>
          <p className="text-white/40 text-xs tracking-[3px] uppercase">
            Becoming - Brand Assets & Guidelines
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <MothLogo size="xl" animated />
            <BrandWordmark size="2xl" variant="default" animated />
          </div>
          <DownloadAllButton />
        </div>

        {/* ==================== SECTION 01: SOCIAL MEDIA BANNERS ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">01</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Social Media Banners</span>
          </div>

          <div className="space-y-10">
            {/* LinkedIn Banner */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                LinkedIn Cover <span className="text-teal-400 text-[10px]">1584 × 396px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="linkedin-banner"
                  className="w-[792px] h-[198px] bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-between px-12 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-rose-500 to-teal-500" />
                  <div className="flex items-center gap-6 z-10">
                    <MothSVG className="w-20 h-16" />
                    <div>
                      <div className="font-clash text-2xl font-semibold text-stone-800 tracking-wide">
                        Becoming
                      </div>
                      <div className="font-cormorant text-sm text-stone-600 italic mt-1">
                        Stop drifting. Start becoming.
                      </div>
                    </div>
                  </div>
                  <div className="text-right z-10">
                    <div className="text-[11px] text-stone-700 tracking-wide">Journal • Dashboard • AI</div>
                    <div className="text-xs text-teal-600 font-semibold tracking-wider mt-1">becoming.app</div>
                  </div>
                  <MothSVG className="absolute -right-10 top-1/2 -translate-y-1/2 w-48 h-48 opacity-5" />
                </div>
              </div>
              <DownloadButton elementId="linkedin-banner" filename="Becoming-LinkedIn-Banner" scale={2} />
            </div>

            {/* Twitter/X Banner */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                Twitter / X Header <span className="text-teal-400 text-[10px]">1500 × 500px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="twitter-banner"
                  className="w-[750px] h-[250px] bg-gradient-to-br from-stone-900 to-stone-950 flex items-center px-16 relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-rose-500 to-teal-500" />
                  <div className="flex items-center gap-8 z-10">
                    <MothSVG className="w-24 h-20" />
                    <div>
                      <div className="font-clash text-4xl font-semibold text-white tracking-wide">
                        Becoming
                      </div>
                      <div className="font-space text-base text-white/60 mt-2">
                        Who you want to be.
                      </div>
                    </div>
                  </div>
                  <div className="absolute right-16 text-right z-10">
                    <div className="text-sm text-white/50 leading-relaxed">
                      AI-powered journaling<br />
                      Pattern recognition<br />
                      Trajectory tracking
                    </div>
                  </div>
                  <MothSVG className="absolute right-8 top-1/2 -translate-y-1/2 w-44 h-44 opacity-[0.03]" />
                </div>
              </div>
              <DownloadButton elementId="twitter-banner" filename="Becoming-Twitter-Banner" scale={2} />
            </div>

            {/* Instagram Post */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                Instagram Post <span className="text-teal-400 text-[10px]">1080 × 1080px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="instagram-banner"
                  className="w-[400px] h-[400px] bg-gradient-to-br from-stone-900 to-stone-950 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 border-4 border-transparent" style={{ borderImage: "linear-gradient(135deg, #14b8a6, #f43f5e) 1" }} />
                  <MothSVG className="w-32 h-28 mb-6" />
                  <div className="font-clash text-3xl font-semibold text-white tracking-wider text-center">
                    Becoming
                  </div>
                  <div className="font-cormorant text-base text-white/60 italic mt-3">
                    Stop drifting. Start becoming.
                  </div>
                  <div className="mt-6 text-[10px] text-white/40 tracking-widest uppercase">
                    Journal • Dashboard • AI
                  </div>
                  <div className="absolute bottom-6 text-xs text-teal-400 tracking-wider">
                    becoming.app
                  </div>
                </div>
              </div>
              <DownloadButton elementId="instagram-banner" filename="Becoming-Instagram-Post" scale={2.7} />
            </div>

            {/* Facebook Cover */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                Facebook Cover <span className="text-teal-400 text-[10px]">820 × 312px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="facebook-banner"
                  className="w-[820px] h-[312px] bg-gradient-to-br from-stone-900 to-stone-950 flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-teal-500 via-rose-500 to-teal-500" />
                  <MothSVG className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.03]" />
                  <div className="text-center z-10">
                    <MothSVG className="w-24 h-20 mx-auto mb-5" />
                    <div className="font-clash text-4xl font-semibold text-white tracking-wider">
                      Becoming
                    </div>
                    <div className="font-cormorant text-base text-white/60 italic mt-2">
                      Stop drifting. Start becoming.
                    </div>
                    <div className="mt-5 text-[11px] text-white/40 tracking-widest uppercase">
                      Journal • Dashboard • AI
                    </div>
                  </div>
                  <MothSVG className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 opacity-[0.03]" />
                </div>
              </div>
              <DownloadButton elementId="facebook-banner" filename="Becoming-Facebook-Cover" scale={1} />
            </div>

            {/* YouTube Banner */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                YouTube Channel Art (Safe Area) <span className="text-teal-400 text-[10px]">2560 × 423px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="youtube-banner"
                  className="w-[640px] h-[106px] bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-rose-500" />
                  <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-teal-500 to-rose-500" />
                  <div className="flex items-center gap-8 z-10">
                    <MothSVG className="w-16 h-14" />
                    <div className="text-left">
                      <div className="font-clash text-3xl font-semibold text-white tracking-wide">
                        Becoming
                      </div>
                      <div className="text-[11px] text-white/40 tracking-widest uppercase mt-1">
                        Journal • Dashboard • AI - Since 2024
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <DownloadButton elementId="youtube-banner" filename="Becoming-YouTube-Banner" scale={4} />
            </div>

            {/* WhatsApp Business Profile */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                WhatsApp Business Profile <span className="text-teal-400 text-[10px]">640 × 640px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="whatsapp-profile"
                  className="w-[300px] h-[300px] rounded-full bg-gradient-to-br from-stone-50 to-stone-100 flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <MothSVG className="w-36 h-32" variant="light" />
                  <div className="font-clash text-lg font-semibold text-stone-800 tracking-wide mt-4 text-center">
                    Becoming
                  </div>
                </div>
              </div>
              <DownloadButton elementId="whatsapp-profile" filename="Becoming-WhatsApp-Profile" scale={2.13} />
            </div>

            {/* OG Image */}
            <div>
              <div className="text-white/50 text-[11px] tracking-wider uppercase mb-3 flex items-center gap-2">
                Website OG Image <span className="text-teal-400 text-[10px]">1200 × 630px</span>
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5 inline-block">
                <div
                  id="og-image"
                  className="w-[600px] h-[315px] bg-gradient-to-br from-stone-900 to-stone-950 flex items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-rose-500 to-teal-500" />
                  <div className="text-center z-10">
                    <MothSVG className="w-24 h-20 mx-auto mb-5" />
                    <div className="font-clash text-4xl font-semibold text-white tracking-wider">
                      Becoming
                    </div>
                    <div className="font-cormorant text-lg text-white/60 italic mt-2">
                      Who you want to be.
                    </div>
                    <div className="mt-5 text-sm text-teal-400 tracking-wider">
                      becoming.app
                    </div>
                  </div>
                </div>
              </div>
              <DownloadButton elementId="og-image" filename="Becoming-OG-Image" scale={2} />
            </div>
          </div>
        </section>

        {/* ==================== SECTION 02: APP ICONS ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">02</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">App Icons</span>
          </div>

          {/* Light Variant */}
          <div className="text-white/40 text-[11px] tracking-wider mb-5">LIGHT VARIANT</div>
          <div className="flex flex-wrap gap-6 items-end mb-10">
            {[512, 256, 192, 128, 64, 48, 32, 16].map((size) => {
              const displaySize = Math.max(size / 4, 16)
              return (
                <div key={`light-${size}`} className="text-center">
                  <div className="text-white/40 text-[10px] mb-2">{size}px</div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                    <div
                      id={`icon-${size}-light`}
                      className="flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 shadow-lg"
                      style={{
                        width: displaySize,
                        height: displaySize,
                        borderRadius: displaySize * 0.22,
                      }}
                    >
                      <MothSVG className="w-[55%] h-[55%]" variant="light" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Dark Variant */}
          <div className="text-white/40 text-[11px] tracking-wider mb-5 mt-10">DARK VARIANT</div>
          <div className="flex flex-wrap gap-6 items-end">
            {[512, 256, 192, 128, 64, 48, 32, 16].map((size) => {
              const displaySize = Math.max(size / 4, 16)
              return (
                <div key={`dark-${size}`} className="text-center">
                  <div className="text-white/40 text-[10px] mb-2">{size}px</div>
                  <div className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                    <div
                      id={`icon-${size}-dark`}
                      className="flex items-center justify-center bg-gradient-to-br from-stone-800 to-stone-900 shadow-lg"
                      style={{
                        width: displaySize,
                        height: displaySize,
                        borderRadius: displaySize * 0.22,
                      }}
                    >
                      <MothSVG className="w-[55%] h-[55%]" />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ==================== SECTION 03: PROFILE PICTURES ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">03</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Profile Pictures</span>
          </div>

          <div className="flex flex-wrap gap-10 justify-center">
            {/* Light Profile 400x400 */}
            <div className="text-center">
              <div className="text-white/40 text-[10px] tracking-wider uppercase mb-3">
                LinkedIn / Facebook (400×400)
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5">
                <div
                  id="profile-400-light"
                  className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center shadow-xl"
                >
                  <MothSVG className="w-28 h-24" variant="light" />
                </div>
              </div>
              <DownloadButton elementId="profile-400-light" filename="Becoming-Profile-400-Light" scale={2} />
            </div>

            {/* Dark Profile 400x400 */}
            <div className="text-center">
              <div className="text-white/40 text-[10px] tracking-wider uppercase mb-3">
                Dark Variant (400×400)
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5">
                <div
                  id="profile-400-dark"
                  className="w-[200px] h-[200px] rounded-full bg-gradient-to-br from-stone-800 to-stone-900 flex items-center justify-center shadow-xl"
                >
                  <MothSVG className="w-28 h-24" />
                </div>
              </div>
              <DownloadButton elementId="profile-400-dark" filename="Becoming-Profile-400-Dark" scale={2} />
            </div>

            {/* Smaller sizes */}
            <div className="text-center">
              <div className="text-white/40 text-[10px] tracking-wider uppercase mb-3">
                Twitter / Instagram (180×180)
              </div>
              <div className="bg-white/[0.02] border border-white/10 rounded-lg p-5">
                <div
                  id="profile-180"
                  className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center shadow-xl"
                >
                  <MothSVG className="w-16 h-14" variant="light" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 04: COLORS ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">04</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Color Palette</span>
          </div>

          {Object.entries(BRAND_COLORS).map(([key, palette]) => (
            <div key={key} className="mb-8">
              <h3 className="text-sm font-medium text-white/70 mb-4">{palette.name}</h3>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                {palette.colors.map((color) => (
                  <ColorSwatch key={color.hex} {...color} />
                ))}
              </div>
            </div>
          ))}

          {/* Gradients */}
          <h3 className="text-sm font-medium text-white/70 mt-10 mb-4">Brand Gradients</h3>
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

        {/* ==================== SECTION 05: TYPOGRAPHY ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">05</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Typography</span>
          </div>

          <div className="space-y-6">
            {TYPOGRAPHY.map((font) => (
              <div key={font.name} className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
                <div className="flex flex-wrap items-baseline justify-between gap-4 mb-4">
                  <h3 className={`text-2xl text-white ${font.className}`}>{font.name}</h3>
                  <span className="text-xs text-white/50">{font.usage}</span>
                </div>
                <p className={`text-lg text-white/80 ${font.className} mb-2`}>
                  The quick brown fox jumps over the lazy dog.
                </p>
                <p className={`text-sm ${font.className} text-white/50 mb-2`}>
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ abcdefghijklmnopqrstuvwxyz 0123456789
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {font.weights.map((weight) => (
                    <span key={weight} className="text-[10px] px-2 py-1 rounded bg-white/5 text-white/60">
                      {weight}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ==================== SECTION 06: LOGO USAGE ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">06</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Logo & Wordmark</span>
          </div>

          {/* Logo on different backgrounds */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="rounded-xl bg-white p-8 flex flex-col items-center justify-center gap-4 ring-1 ring-white/10">
              <MothLogo size="xl" />
              <span className="text-xs text-stone-500">On Light</span>
            </div>
            <div className="rounded-xl bg-stone-900 p-8 flex flex-col items-center justify-center gap-4">
              <MothLogo size="xl" />
              <span className="text-xs text-stone-400">On Dark</span>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-teal-600 to-rose-600 p-8 flex flex-col items-center justify-center gap-4">
              <MothLogo size="xl" />
              <span className="text-xs text-white/70">On Gradient</span>
            </div>
          </div>

          {/* Wordmark variants */}
          <h3 className="text-sm font-medium text-white/70 mb-4">Wordmark Variants</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <span className="text-[10px] text-white/50 mb-4 block uppercase tracking-wider">Default</span>
              <BrandWordmark size="xl" variant="default" />
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <span className="text-[10px] text-white/50 mb-4 block uppercase tracking-wider">Modern (Syne)</span>
              <BrandWordmark size="xl" variant="modern" />
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <span className="text-[10px] text-white/50 mb-4 block uppercase tracking-wider">Split</span>
              <BrandWordmark size="xl" variant="split" />
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <span className="text-[10px] text-white/50 mb-4 block uppercase tracking-wider">Minimal</span>
              <BrandWordmark size="xl" variant="minimal" />
            </div>
          </div>

          {/* Logo + Wordmark combo */}
          <h3 className="text-sm font-medium text-white/70 mt-10 mb-4">Logo + Wordmark Combinations</h3>
          <div className="flex items-center gap-8 p-6 rounded-xl bg-white/[0.02] border border-white/10">
            <BrandLogo size="sm" />
            <BrandLogo size="md" />
            <BrandLogo size="lg" />
          </div>
        </section>

        {/* ==================== SECTION 07: TAGLINES ==================== */}
        <section className="mb-20 pb-16 border-b border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">07</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Taglines</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <span className="text-[10px] text-white/50 mb-2 block uppercase tracking-wider">Primary</span>
              <p className="text-xl font-space font-semibold text-white">Stop drifting. Start becoming.</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <span className="text-[10px] text-white/50 mb-2 block uppercase tracking-wider">Secondary</span>
              <p className="text-xl font-space font-semibold text-white">Who you want to be.</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <span className="text-[10px] text-white/50 mb-2 block uppercase tracking-wider">Descriptive</span>
              <p className="text-lg font-satoshi text-white/80">A journal. A dashboard. An AI that keeps you on track.</p>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-6">
              <span className="text-[10px] text-white/50 mb-2 block uppercase tracking-wider">Mission</span>
              <p className="text-lg font-satoshi text-white/80">Helping you see your patterns, so you can become who you define.</p>
            </div>
          </div>
        </section>

        {/* ==================== SECTION 08: GUIDELINES ==================== */}
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-8">
            <span className="text-5xl font-extralight text-white/20">08</span>
            <span className="text-sm font-medium tracking-[3px] uppercase text-white">Usage Guidelines</span>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "Don't rotate the logo",
              "Don't stretch or distort",
              "Don't change gradient colors",
              "Don't add effects/shadows",
              "Don't place on busy backgrounds",
              "Don't use low contrast",
            ].map((rule, i) => (
              <div
                key={i}
                className="rounded-lg bg-rose-500/10 border border-rose-500/20 p-4 text-center"
              >
                <span className="text-sm text-rose-400">{rule}</span>
              </div>
            ))}
          </div>

          {/* Clear space */}
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <div className="relative inline-block p-8 border-2 border-dashed border-teal-500/30">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] text-teal-400 bg-[#0a0f14] px-1">
                  1x height
                </div>
                <MothLogo size="xl" />
              </div>
              <p className="text-xs text-white/50 mt-4">
                Clear space = 1x the height of the moth body
              </p>
            </div>
            <div className="rounded-xl bg-white/[0.02] border border-white/10 p-8">
              <h4 className="font-semibold text-white/80 mb-4">Minimum Sizes</h4>
              <ul className="space-y-2 text-sm text-white/50">
                <li>• Digital: 24px minimum width</li>
                <li>• Print: 0.5 inch / 12mm minimum</li>
                <li>• Favicon: 16x16px (simplified)</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
