import { Link } from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "../components/theme-toggle"
import {
  ArrowRight,
  Brain,
  Sparkles,
  Zap,
  Target,
  AlertTriangle,
  Eye,
  TrendingUp,
  MessageCircle,
  Calendar,
  Activity,
  ChevronRight,
  Quote,
  Compass,
  Map,
  Bell,
  Mic,
  BarChart3,
  GitCompare,
  LayoutDashboard,
  Play,
  Menu,
  X,
} from "lucide-react"
import { cn } from "../lib/utils"
import { HeroIntro } from "../components/landing/HeroIntro"
import { BackgroundOrbs } from "../components/landing/BackgroundOrbs"
import { DemoTimelineChart } from "../components/marketing/DemoCharts/DemoTimelineChart"
import { DemoModeChart } from "../components/marketing/DemoCharts/DemoModeChart"
import { DemoRadarChart } from "../components/marketing/DemoCharts/DemoRadarChart"
import { DemoHeatmapChart } from "../components/marketing/DemoCharts/DemoHeatmapChart"
import { DemoContradictionChart } from "../components/marketing/DemoCharts/DemoContradictionChart"
import { DemoTrendChart } from "../components/marketing/DemoCharts/DemoTrendChart"
import { ThemedBackground } from "../components/ui/ThemedImage"
import {
  TextHighlight,
  RevealOnScroll,
} from "../components/typography"

// Animated counter with increasing speed effect
function AnimatedStatCounter({
  target,
  suffix = "",
  className = ""
}: {
  target: number
  suffix?: string
  className?: string
}) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [hasAnimated])

  useEffect(() => {
    if (!hasAnimated) return

    const duration = 1500 // 1.5 seconds total
    let startTime: number | null = null

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Increasing speed: ease-in cubic (starts slow, ends fast)
      const easeIn = progress * progress * progress

      const currentCount = Math.floor(easeIn * target)
      setCount(currentCount)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    requestAnimationFrame(animate)
  }, [hasAnimated, target])

  return (
    <div ref={ref} className={className}>
      {count}{suffix}
    </div>
  )
}

// The 4-step journey
const steps = [
  {
    number: "1",
    title: "Define",
    description: "Set your Vision. And crucially, your Anti-Vision.",
    icon: Compass,
    color: "from-teal-500 to-cyan-500",
  },
  {
    number: "2",
    title: "Journal",
    description: "Write or speak your truth. 9 agents analyze.",
    icon: MessageCircle,
    color: "from-teal-400 to-teal-600",
  },
  {
    number: "3",
    title: "See",
    description: "Dashboard shows your patterns visually.",
    icon: LayoutDashboard,
    color: "from-rose-400 to-pink-500",
  },
  {
    number: "4",
    title: "Stay On Track",
    description: "AI warns you before you drift too far.",
    icon: Bell,
    color: "from-rose-500 to-rose-600",
  },
]

// Comparison: Other apps vs Becoming
const comparison = [
  { feature: "Focus", generic: "Track mood", becoming: "Track who you're becoming" },
  { feature: "AI", generic: "1 generic pass", becoming: "9 specialized agents" },
  { feature: "Goals", generic: "None", becoming: "Trajectory Tracking" },
  { feature: "Warnings", generic: "None", becoming: "Drift alerts" },
  { feature: "Visibility", generic: "Data sits there", becoming: "Dashboard shows patterns" },
]

// Testimonials (success stories) - specificity = trust
const testimonials = [
  {
    quote: "I thought I was just tired. Becoming showed I was drifting toward burnout for six weeks. The pattern was obvious once I saw it.",
    author: "Priya",
    role: "Software Engineer",
    highlight: "drifting toward burnout",
  },
  {
    quote: "Three months of entries. One dashboard view. I finally understood why I kept self-sabotaging my promotions.",
    author: "Marcus",
    role: "Entrepreneur",
    highlight: "self-sabotaging",
  },
  {
    quote: "The contradiction chart showed Action vs Fear appearing in 73% of my work entries. That number changed everything.",
    author: "Sarah",
    role: "Product Manager",
    highlight: "73% of my work entries",
  },
]

// Product Features (the tech you actually built) - with 6 UNIQUE chart demos
const productFeatures: Array<{
  icon: typeof Mic
  title: string
  description: string
  color: string
  badge: string
  chart?: React.FC<{ animate?: boolean }>
}> = [
  {
    icon: LayoutDashboard,
    title: "Emotional Timeline",
    description: "See how your emotional balance shifts over weeks—not entries.",
    color: "from-teal-500 to-cyan-500",
    badge: "Beautiful",
    chart: DemoTimelineChart,
  },
  {
    icon: Activity,
    title: "Energy Radar",
    description: "Track five dimensions: Focus, Clarity, Drive, Calm, Peace.",
    color: "from-violet-500 to-purple-500",
    badge: "Insightful",
    chart: DemoRadarChart,
  },
  {
    icon: Calendar,
    title: "Activity Heatmap",
    description: "See your consistency patterns at a glance.",
    color: "from-emerald-500 to-green-500",
    badge: "Visual",
    chart: DemoHeatmapChart,
  },
  {
    icon: BarChart3,
    title: "Mode Distribution",
    description: "Know which mental states dominate your weeks.",
    color: "from-rose-500 to-pink-500",
    badge: "Clear",
    chart: DemoModeChart,
  },
  {
    icon: GitCompare,
    title: "Contradiction Flow",
    description: "Spot internal conflicts: Action vs Fear, Growth vs Comfort.",
    color: "from-amber-500 to-orange-500",
    badge: "Unique",
    chart: DemoContradictionChart,
  },
  {
    icon: TrendingUp,
    title: "Mood Trends",
    description: "Watch your trajectory shift over time.",
    color: "from-blue-500 to-indigo-500",
    badge: "Deep",
    chart: DemoTrendChart,
  },
]

// Additional features without charts
const additionalFeatures = [
  {
    icon: Mic,
    title: "Voice Logging",
    description: "Speak. We transcribe and analyze.",
    color: "from-rose-500 to-pink-500",
    badge: "Hands-free",
  },
  {
    icon: MessageCircle,
    title: "AI Chat",
    description: "Knows your history, goals, and patterns.",
    color: "from-teal-500 to-emerald-500",
    badge: "Context-aware",
  },
  {
    icon: Brain,
    title: "9-Agent Pipeline",
    description: "Intent, Emotion, Theme, Contradiction, Drift.",
    color: "from-indigo-500 to-violet-500",
    badge: "Powerful",
  },
]

// Self-Discovery Features
const discoveryFeatures = [
  {
    icon: Map,
    title: "Life Blueprint",
    description: "Vision. Anti-Vision. Levers. Goals.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Identity Architecture",
    description: "17 topics. 3 depth levels. Know yourself.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: AlertTriangle,
    title: "Drift Warnings",
    description: "4 alert types. Before it's too late.",
    color: "from-amber-500 to-orange-500",
  },
]

export function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col overflow-hidden relative">
      {/* Sleek Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[9999] pointer-events-auto">
        <div className="mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between backdrop-blur-md bg-background/30 border border-white/10 rounded-full px-4 sm:px-6 py-2.5 sm:py-3 shadow-lg">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <Sparkles className="h-5 w-5 text-teal-500 group-hover:rotate-12 transition-transform" />
              <span className="font-space font-medium text-lg tracking-tight">Becoming</span>
            </Link>

            {/* Nav Links - Hidden on mobile */}
            <div className="hidden md:flex items-center font-space text-sm tracking-wide">
              {/* Primary: What, Why, How */}
              <a href="#what" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all nav-link-underline">
                What
              </a>
              <span className="text-border/60">|</span>
              <a href="#why" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all nav-link-underline">
                Why
              </a>
              <span className="text-border/60">|</span>
              <a href="#how" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all nav-link-underline">
                How
              </a>

              <span className="text-border/40 mx-2">|</span>

              {/* Secondary with Dropdowns: Blog, Research, About */}
              {/* Blog Dropdown */}
              <div className="relative group">
                <Link to="/blog" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 nav-link-underline">
                  Blog
                  <ChevronRight className="h-3 w-3 rotate-90 opacity-50" />
                </Link>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-2 min-w-[180px]">
                    <Link to="/blog" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      All Posts
                    </Link>
                    <Link to="/blog?tag=Product" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Product Updates
                    </Link>
                    <Link to="/blog?tag=Science" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Science & Research
                    </Link>
                    <Link to="/blog?tag=Guides" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Guides & Tutorials
                    </Link>
                  </div>
                </div>
              </div>

              <span className="text-border/60">|</span>

              {/* Research Dropdown */}
              <div className="relative group">
                <Link to="/research" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 nav-link-underline">
                  Research
                  <ChevronRight className="h-3 w-3 rotate-90 opacity-50" />
                </Link>
                <div className="absolute top-full left-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-2 min-w-[200px]">
                    <Link to="/research" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Overview
                    </Link>
                    <Link to="/research#cognitive-patterns" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Cognitive Patterns
                    </Link>
                    <Link to="/research#ai-pipeline" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      AI Pipeline
                    </Link>
                    <Link to="/research#methodology" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Methodology
                    </Link>
                  </div>
                </div>
              </div>

              <span className="text-border/60">|</span>

              {/* About Dropdown */}
              <div className="relative group">
                <a href="#about" className="px-4 py-2 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1 nav-link-underline">
                  About
                  <ChevronRight className="h-3 w-3 rotate-90 opacity-50" />
                </a>
                <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl p-2 min-w-[180px]">
                    <a href="#about" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Our Story
                    </a>
                    <a href="#mission" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Mission
                    </a>
                    <a href="#team" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Team
                    </a>
                    <a href="#contact" className="block px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all">
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Theme + CTA + Mobile Menu */}
            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <Link
                to="/signup"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium transition-transform font-space cta-pulse"
              >
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {/* Mobile hamburger button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-full hover:bg-muted/50 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 px-4 pb-4">
            <div className="backdrop-blur-md bg-background/95 border border-white/10 rounded-2xl shadow-xl p-4 mt-2">
              <div className="flex flex-col gap-1 font-space text-sm">
                {/* Primary Links */}
                <a
                  href="#what"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-foreground hover:bg-muted/50 transition-all font-medium"
                >
                  What
                </a>
                <a
                  href="#why"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-foreground hover:bg-muted/50 transition-all font-medium"
                >
                  Why
                </a>
                <a
                  href="#how"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-foreground hover:bg-muted/50 transition-all font-medium"
                >
                  How
                </a>

                <div className="border-t border-border/30 my-2" />

                {/* Secondary Links */}
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  Blog
                </Link>
                <Link
                  to="/research"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  Research
                </Link>
                <a
                  href="#about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
                >
                  About
                </a>

                <div className="border-t border-border/30 my-2" />

                {/* CTA */}
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:scale-[1.02] transition-transform"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Floating background orbs for glassmorphism depth */}
      <BackgroundOrbs intensity="subtle" />

      {/* ==================== HERO SECTION (Animated Intro) ==================== */}
      <HeroIntro />

      {/* ==================== STAKES SECTION (The Problem) - Glassmorphism ==================== */}
      <section id="why" className="relative py-24 md:py-32 border-t overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">01</span>

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.glass-teal]:pointer-events-auto">
          <div className="mx-auto max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            {/* Opening hook - clear problem statement */}
            <RevealOnScroll className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl heading-gradient mb-6">
                Journaling without <TextHighlight variant="rose">visibility</TextHighlight> is just venting.
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                You write. You reflect. But <span className="text-foreground font-medium">nothing changes</span>—because you can't see the patterns.
              </p>
            </RevealOnScroll>

            {/* The 3 problems - glass cards with hover lift */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="glass-feature-card p-6 card-lift">
                <div className="h-12 w-12 rounded-xl glass-rose flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-rose-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Writing without insight</h3>
                <p className="text-muted-foreground text-sm">
                  You journal, but do you actually see your patterns? Your insights are buried in text, never to be seen again.
                </p>
              </div>

              <div className="glass-feature-card p-6 card-lift">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 backdrop-blur-sm border border-amber-500/20 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Goals without tracking</h3>
                <p className="text-muted-foreground text-sm">
                  You set intentions every January. By March, they've faded. Who tells you when you drift?
                </p>
              </div>

              <div className="glass-feature-card p-6 card-lift">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 backdrop-blur-sm border border-orange-500/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Patterns forming unseen</h3>
                <p className="text-muted-foreground text-sm">
                  By the time you notice, they're already habits. The trajectory was set months ago.
                </p>
              </div>
            </div>

            {/* Empathy close - glass panel */}
            <div className="glass-teal p-6 rounded-2xl text-center">
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
                <span className="text-foreground font-medium">We built Becoming because we lived this.</span> We journaled for years—and still felt stuck.
              </p>
              <Link to="/research" className="cta-highlight text-foreground">
                Read our research
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DIFFERENTIATOR SECTION - Glassmorphism ==================== */}
      <section id="what" className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">02</span>

        {/* Background orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.glass-teal]:pointer-events-auto [&_.hover-glow]:pointer-events-auto">
          <div className="mx-auto max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
                <Zap className="h-4 w-4 text-teal-500" />
                <span>Not just another AI journal</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl heading-gradient mb-4">
                This isn't ChatGPT with a <TextHighlight variant="gradient">journal skin</TextHighlight>.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Unlike chatbots that forget context, Becoming uses a <span className="text-foreground font-semibold">9-Agent Pipeline</span> to cross-reference every entry against your goals, fears, and history.
              </p>
            </RevealOnScroll>

            {/* Comparison table - glass effect */}
            <div className="glass-feature-card overflow-hidden mb-8">
              <div className="grid grid-cols-3 bg-muted/30 backdrop-blur-sm">
                <div className="p-4 font-medium text-sm text-muted-foreground">Feature</div>
                <div className="p-4 font-medium text-sm text-muted-foreground text-center">Generic AI</div>
                <div className="p-4 font-medium text-sm text-center glass-teal text-teal-600 dark:text-teal-400">Becoming</div>
              </div>
              {comparison.map((row, index) => (
                <div key={row.feature} className={cn("grid grid-cols-3 transition-colors duration-200 hover:bg-muted/20", index % 2 === 0 ? "bg-transparent" : "bg-muted/10")}>
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-muted-foreground text-center">{row.generic}</div>
                  <div className="p-4 text-sm text-center font-medium bg-teal-500/5">{row.becoming}</div>
                </div>
              ))}
            </div>

            {/* Key insight - premium glass */}
            <div className="glass-feature-card p-6 text-center hover-glow">
              <p className="text-lg mb-4">
                <span className="font-semibold">The difference:</span> Generic AI gives you "take a deep breath."
                Becoming says <span className="text-teal-600 dark:text-teal-400 font-medium">"I see you're drifting toward burnout—the thing you said you fear most."</span>
              </p>
              <Link to="/signup" className="cta-highlight text-foreground">
                Try it free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== THE PLAN (How It Works) - Glassmorphism ==================== */}
      <section id="how" className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">03</span>

        {/* Background orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.card-shine]:pointer-events-auto">
          <div className="mx-auto max-w-6xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                <TextHighlight variant="teal">Four steps</TextHighlight> to becoming.
              </h2>
              <p className="text-lg text-muted-foreground">
                From <TextHighlight variant="rose">drifting</TextHighlight> unconsciously to living <TextHighlight variant="teal">intentionally</TextHighlight>.
              </p>
            </RevealOnScroll>

            <div className="grid gap-6 md:grid-cols-4">
              {steps.map((step) => (
                <div key={step.number} className="relative group">
                  {/* Connector line with gradient (hidden on mobile) */}
                  {step.number !== "4" && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-teal-500/30 via-rose-500/20 to-transparent z-0" />
                  )}

                  <div className="relative z-10 text-center glass-feature-card p-6 card-shine">
                    <div className={cn(
                      "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r text-white text-2xl font-bold transition-transform duration-300 group-hover:scale-110",
                      step.color
                    )}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="text-xs font-medium text-teal-600 dark:text-teal-400 mb-2">Step {step.number}</div>
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA after plan - glass button */}
            <div className="text-center mt-12">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white transition-all cta-pulse"
              >
                Start Becoming
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== GUIDE SECTION (Empathy + Authority) - Glassmorphism ==================== */}
      <section id="about" className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number - white with drop shadow */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">04</span>

        {/* Background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto">
          <div className="mx-auto max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            {/* Section headline */}
            <RevealOnScroll className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl heading-gradient mb-4">
                Meet your <TextHighlight variant="gradient">guide</TextHighlight>.
              </h2>
              <p className="text-lg text-muted-foreground">
                We built this because we <TextHighlight variant="rose">needed</TextHighlight> it ourselves.
              </p>
            </RevealOnScroll>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Empathy side - glass panel */}
              <div className="glass-feature-card p-8">
                <h3 className="text-2xl font-bold tracking-tight md:text-3xl mb-6">
                  The problem we lived.
                </h3>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We journaled for years. Set goals every January. Watched them fade by March.
                    Felt stuck in patterns we couldn't see clearly.
                  </p>
                  <p>
                    Then we wondered: <span className="text-foreground font-medium">what if AI could actually know where we're trying to go—and tell us when we drift?</span>
                  </p>
                  <p>
                    That question became <span className="brand-gradient font-semibold">Becoming</span>.
                  </p>
                </div>
              </div>

              {/* Authority side - stats with glass - animated counters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-feature-card p-6 text-center card-lift">
                  <AnimatedStatCounter target={9} className="text-4xl font-bold text-violet-500 mb-1" />
                  <div className="text-sm font-medium">AI Agents</div>
                  <div className="text-xs text-muted-foreground">Specialized analysis</div>
                </div>
                <div className="glass-feature-card p-6 text-center card-lift">
                  <AnimatedStatCounter target={95} suffix="+" className="text-4xl font-bold text-blue-500 mb-1" />
                  <div className="text-sm font-medium">Data Points</div>
                  <div className="text-xs text-muted-foreground">Per user profile</div>
                </div>
                <div className="glass-feature-card p-6 text-center card-lift">
                  <AnimatedStatCounter target={17} className="text-4xl font-bold text-pink-500 mb-1" />
                  <div className="text-sm font-medium">Core Themes</div>
                  <div className="text-xs text-muted-foreground">Deep self-discovery</div>
                </div>
                <div className="glass-feature-card p-6 text-center card-lift">
                  <AnimatedStatCounter target={4} className="text-4xl font-bold text-amber-500 mb-1" />
                  <div className="text-sm font-medium">Warning Types</div>
                  <div className="text-xs text-muted-foreground">Proactive alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUCCESS SECTION (Testimonials) - Glassmorphism ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">05</span>

        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/20 -z-10" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.hover-glow]:pointer-events-auto">
          <div className="mx-auto max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl heading-gradient mb-4">
                This is what <TextHighlight variant="teal">clarity</TextHighlight> feels like.
              </h2>
              <p className="text-lg text-muted-foreground">
                Real stories from people who stopped drifting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.author}
                  className="glass-feature-card p-6 card-lift hover-glow"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Quote className="h-8 w-8 text-teal-500/40 mb-4" />
                  <p className="text-sm mb-4 leading-relaxed">
                    "{testimonial.quote.split(testimonial.highlight)[0]}
                    <span className="text-teal-600 dark:text-teal-400 font-medium">{testimonial.highlight}</span>
                    {testimonial.quote.split(testimonial.highlight)[1]}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full glass-teal flex items-center justify-center font-semibold text-teal-600 dark:text-teal-400">
                      {testimonial.author[0]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{testimonial.author}</div>
                      <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link to="/signup" className="cta-highlight cta-highlight-rose text-foreground">
                Join them
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT FEATURES SECTION (Glassmorphism + Chart Previews) ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">06</span>

        {/* Section-specific orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.glass-teal]:pointer-events-auto">
          <div className="mx-auto max-w-6xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="mx-auto max-w-2xl text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
                <Sparkles className="h-4 w-4 text-teal-500" />
                <span>See your patterns</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Turn your thoughts into <TextHighlight variant="teal">data</TextHighlight>.
              </h2>
              <p className="text-lg text-muted-foreground">
                Hover over each card to preview the visualization.
              </p>
            </RevealOnScroll>

            {/* Glassmorphism feature cards with chart previews */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 hover-dim-siblings">
            {productFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass-feature-card p-6 hover-reveal-container"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r text-white transition-transform duration-300 group-hover:scale-110",
                    feature.color
                  )}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-muted/50 text-muted-foreground backdrop-blur-sm">
                    {feature.badge}
                  </span>
                </div>

                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Real chart demo - reveals on hover */}
                {feature.chart && (
                  <div className="h-32 rounded-xl bg-muted/50 dark:bg-black/20 overflow-hidden border border-border/50 transition-all duration-500 group-hover:h-40">
                    <feature.chart animate={true} />
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>

          {/* Additional features - smaller cards */}
          <div className="mt-8 mx-auto max-w-4xl grid gap-4 md:grid-cols-3 backdrop-blur-sm bg-background/30 rounded-3xl p-6 border border-white/5">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group glass-feature-card p-5 flex items-start gap-4"
              >
                <div className={cn(
                  "flex-shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r text-white",
                  feature.color
                )}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview Teaser */}
          <div className="mt-16 mx-auto max-w-4xl text-center backdrop-blur-sm bg-background/30 rounded-3xl p-8 border border-white/5">
            <div className="glass-teal p-8 rounded-2xl">
              <p className="text-foreground mb-6 text-lg">
                10+ visualizations. All connected to your journal. See your transformation unfold.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium hover:scale-105 transition-transform"
              >
                <Play className="h-4 w-4" />
                Explore the Dashboard
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SELF-DISCOVERY SECTION - Glassmorphism ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">07</span>

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/30 -z-10" />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.card-scale-glow]:pointer-events-auto [&_.glass-teal]:pointer-events-auto">
          <div className="mx-auto max-w-4xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <div className="mx-auto max-w-2xl text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
                <Compass className="h-4 w-4 text-teal-500" />
                <span>Know yourself</span>
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
                Go deeper than mood tracking.
              </h2>
              <p className="text-lg text-muted-foreground">
                Define who you want to become. Let AI help you get there.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 hover-dim-siblings">
            {discoveryFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-feature-card p-8 card-scale-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r text-white transition-transform duration-300 group-hover:scale-110",
                  feature.color
                )}>
                  <feature.icon className="h-6 w-6" />
                </div>

                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link to="/blog" className="cta-highlight text-foreground">
                Read the science
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== ABOUT US SECTION ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        <span className="bg-number bg-number-gradient bg-number-xl top-0 left-0" aria-hidden="true">08</span>

        {/* Background orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto [&_.card-lift]:pointer-events-auto [&_.glass-teal]:pointer-events-auto">
          {/* Mission Section */}
          <div id="mission" className="mx-auto max-w-4xl mb-24 backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="text-center mb-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
                <Target className="h-4 w-4 text-teal-500" />
                <span>Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl heading-gradient mb-6">
                Help you become who you <TextHighlight variant="gradient">want to be</TextHighlight>.
              </h2>
            </RevealOnScroll>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="glass-feature-card p-6 text-center card-lift">
                <div className="w-12 h-12 rounded-full bg-teal-500/10 flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-6 h-6 text-teal-500" />
                </div>
                <h3 className="font-semibold mb-2">See Clearly</h3>
                <p className="text-sm text-muted-foreground">Make your invisible patterns visible through beautiful visualizations.</p>
              </div>
              <div className="glass-feature-card p-6 text-center card-lift">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                  <Brain className="w-6 h-6 text-rose-500" />
                </div>
                <h3 className="font-semibold mb-2">Understand Deeply</h3>
                <p className="text-sm text-muted-foreground">AI that truly knows your goals, fears, and aspirations.</p>
              </div>
              <div className="glass-feature-card p-6 text-center card-lift">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-semibold mb-2">Grow Intentionally</h3>
                <p className="text-sm text-muted-foreground">Stay on track toward who you want to become.</p>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center mt-10">
              <Link to="/signup" className="cta-highlight text-foreground">
                Start your journey
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Team Section */}
          <div id="team" className="mx-auto max-w-4xl mb-24 backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight md:text-4xl mb-4">
                Built by people who <TextHighlight variant="rose">needed this</TextHighlight>.
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We're not a faceless corporation. We're a small team of builders, thinkers, and journalers
                who got tired of watching our own patterns repeat.
              </p>
            </RevealOnScroll>

            <div className="glass-feature-card p-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-rose-500 flex items-center justify-center text-white text-2xl font-bold">
                  B
                </div>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                "We journaled for years and still felt stuck. We built Becoming to finally see our own patterns—and we're sharing it with you."
              </p>
              <p className="mt-4 mb-6 font-medium text-teal-600 dark:text-teal-400">— The Becoming Team</p>
              <Link to="/blog" className="cta-highlight cta-highlight-rose text-foreground">
                Read our story
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Contact Section */}
          <div id="contact" className="mx-auto max-w-2xl backdrop-blur-sm bg-background/30 rounded-3xl p-8 md:p-12 border border-white/5">
            <RevealOnScroll className="text-center">
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-4">
                Get in touch
              </h2>
              <p className="text-muted-foreground mb-8">
                Questions, feedback, or just want to say hi? We'd love to hear from you.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:hello@becoming.app"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-feature-card hover:scale-105 transition-transform"
                >
                  <MessageCircle className="h-5 w-5 text-teal-500" />
                  <span>hello@becoming.app</span>
                </a>
                <a
                  href="https://twitter.com/becomingapp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass-feature-card hover:scale-105 transition-transform"
                >
                  <Sparkles className="h-5 w-5 text-rose-500" />
                  <span>@becomingapp</span>
                </a>
              </div>
            </RevealOnScroll>
          </div>
        </div>
      </section>

      {/* ==================== FINAL CTA SECTION - Enhanced Glassmorphism ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Themed background image */}
        <ThemedBackground
          lightSrc="/images/landing/hero-light.svg"
          darkSrc="/images/landing/hero-dark.svg"
          className="absolute inset-0 opacity-30"
          overlay={false}
        >
          <div className="absolute inset-0" />
        </ThemedBackground>

        {/* Background orbs */}
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 pointer-events-none [&_a]:pointer-events-auto [&_button]:pointer-events-auto [&_.glass-feature-card]:pointer-events-auto">
          <RevealOnScroll className="mx-auto max-w-4xl rounded-3xl glass-feature-card p-12 text-center relative overflow-hidden pointer-events-auto">
            {/* Animated gradient border */}
            <div className="absolute inset-0 rounded-3xl p-px bg-gradient-to-r from-teal-500/50 via-rose-500/30 to-teal-500/50 -z-10 opacity-50" />

            {/* Animated glow orbs inside */}
            <div className="absolute -top-20 -left-20 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl floating-orb floating-orb-teal" />
            <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl floating-orb floating-orb-rose" />

            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl relative z-10">
              Your patterns are already <TextHighlight variant="gradient">forming</TextHighlight>.
            </h2>
            <p className="mx-auto mb-2 max-w-xl text-xl text-muted-foreground relative z-10">
              The question is: are they the ones you want?
            </p>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground relative z-10">
              Define your vision. Let AI keep you on course.
            </p>
            <Link
              to="/signup"
              className="group relative z-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white transition-all cta-pulse"
            >
              Start Becoming
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground relative z-10">
              Free to start. No credit card required.
            </p>
          </RevealOnScroll>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-auto border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-6 w-6 text-teal-500" />
                <span className="font-semibold gradient-text">Becoming</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Who you want to be.
              </p>
              <p className="text-xs text-muted-foreground">
                A journal. A dashboard. An AI that keeps you on track.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link></li>
                <li><Link to="/logs" className="hover:text-foreground transition-colors">Journal</Link></li>
                <li><Link to="/chat" className="hover:text-foreground transition-colors">AI Chat</Link></li>
                <li><Link to="/profile#life-blueprint" className="hover:text-foreground transition-colors">Life Blueprint</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/research" className="hover:text-foreground transition-colors">Research</Link></li>
                <li><a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Becoming. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
