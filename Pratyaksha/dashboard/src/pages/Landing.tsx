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
  Shield,
  MessageCircle,
  Calendar,
  LineChart,
  Layers,
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
  PenLine,
  Play,
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
  BackgroundNumber,
  TextHighlight,
  RevealOnScroll,
  UnderlineAccent,
  NumberHighlight,
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

// The three pillars of Becoming
const pillars = [
  { label: "The Journal", value: "📓", description: "Keep you on track" },
  { label: "The Dashboard", value: "📊", description: "See it visually" },
  { label: "The AI", value: "🤖", description: "Warn you early" },
]

// The 4-step journey
const steps = [
  {
    number: "1",
    title: "Define",
    description: "Who you want to become—and who you don't.",
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
  { feature: "Goals", generic: "None", becoming: "Vision + Anti-Vision" },
  { feature: "Warnings", generic: "None", becoming: "Drift alerts" },
  { feature: "Visibility", generic: "Data sits there", becoming: "Dashboard shows patterns" },
]

// Testimonials (success stories)
const testimonials = [
  {
    quote: "I finally saw who I was becoming—and it wasn't who I wanted to be. Becoming showed me the pattern before it was too late.",
    author: "Priya",
    role: "Software Engineer",
    highlight: "who I was becoming",
  },
  {
    quote: "Other apps track my mood. Becoming tracks whether I'm on track to become the person I actually want to be.",
    author: "Marcus",
    role: "Entrepreneur",
    highlight: "person I actually want to be",
  },
  {
    quote: "The dashboard made it visual. The AI made it actionable. Now I can see my progress toward who I want to become.",
    author: "Sarah",
    role: "Product Manager",
    highlight: "see my progress",
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
    description: "See your emotional journey over time. Sentiment analysis shows highs, lows, and patterns.",
    color: "from-teal-500 to-cyan-500",
    badge: "Beautiful",
    chart: DemoTimelineChart,
  },
  {
    icon: Activity,
    title: "Energy Radar",
    description: "Track your energy dimensions: Focus, Clarity, Drive, Calm, and Peace.",
    color: "from-violet-500 to-purple-500",
    badge: "Insightful",
    chart: DemoRadarChart,
  },
  {
    icon: Calendar,
    title: "Activity Heatmap",
    description: "GitHub-style consistency tracker. See your journaling patterns across weeks.",
    color: "from-emerald-500 to-green-500",
    badge: "Visual",
    chart: DemoHeatmapChart,
  },
  {
    icon: BarChart3,
    title: "Mode Distribution",
    description: "See the balance of your mental states: Reflective, Hopeful, Focused, Creative.",
    color: "from-rose-500 to-pink-500",
    badge: "Clear",
    chart: DemoModeChart,
  },
  {
    icon: GitCompare,
    title: "Contradiction Flow",
    description: "Spot internal conflicts like Action vs Fear, Growth vs Comfort in your entries.",
    color: "from-amber-500 to-orange-500",
    badge: "Unique",
    chart: DemoContradictionChart,
  },
  {
    icon: TrendingUp,
    title: "Mood Trends",
    description: "Watch your emotional balance shift over weeks. See your growth trajectory.",
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
    description: "Speak your thoughts. AI transcribes and analyzes in real-time.",
    color: "from-rose-500 to-pink-500",
    badge: "Hands-free",
  },
  {
    icon: MessageCircle,
    title: "AI Chat",
    description: "Conversational AI that knows your history, goals, and patterns.",
    color: "from-teal-500 to-emerald-500",
    badge: "Context-aware",
  },
  {
    icon: Brain,
    title: "9-Agent Pipeline",
    description: "Every entry processed by Intent, Emotion, Theme, and more agents.",
    color: "from-indigo-500 to-violet-500",
    badge: "Powerful",
  },
]

// Self-Discovery Features
const discoveryFeatures = [
  {
    icon: Map,
    title: "Life Blueprint",
    description: "Define your Vision, Anti-Vision, Levers, and Goals across time horizons.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Soul Mapping",
    description: "17 deep self-discovery topics across 3 depth levels.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: AlertTriangle,
    title: "Pattern Warnings",
    description: "4 warning types alert you before you drift too far.",
    color: "from-amber-500 to-orange-500",
  },
]

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden relative">
      {/* Theme toggle - fixed top right */}
      <div className="fixed top-6 right-6 z-[9999] pointer-events-auto">
        <div className="glass-feature-card p-2 pointer-events-auto">
          <ThemeToggle />
        </div>
      </div>

      {/* Floating background orbs for glassmorphism depth */}
      <BackgroundOrbs intensity="subtle" />

      {/* ==================== HERO SECTION (Animated Intro) ==================== */}
      <HeroIntro />

      {/* ==================== STAKES SECTION (The Problem) - Glassmorphism ==================== */}
      <section className="relative py-24 md:py-32 border-t overflow-hidden">
        {/* Giant background number */}
        <BackgroundNumber number="01" position="top-left" variant="rose" size="xl" className="opacity-[0.0375]" />

        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl">
            {/* Opening hook */}
            <RevealOnScroll className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                You're already <TextHighlight variant="rose">becoming</TextHighlight> someone.
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                The question is: <span className="text-foreground font-medium">who?</span>
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
                  You journal, but do you actually see your patterns? Most entries disappear into the void.
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
                  By the time you notice, they're already habits. You're becoming someone—but who?
                </p>
              </div>
            </div>

            {/* Empathy close - glass panel */}
            <div className="glass-teal p-6 rounded-2xl text-center">
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                <span className="text-foreground font-medium">We built Becoming because we lived this.</span> We journaled for years—and still felt stuck.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DIFFERENTIATOR SECTION - Glassmorphism ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <BackgroundNumber number="02" position="top-right" variant="teal" size="xl" className="opacity-[0.0375]" />

        {/* Background orbs */}
        <div className="absolute top-20 right-20 w-80 h-80 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl">
            <RevealOnScroll className="text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
                <Zap className="h-4 w-4 text-teal-500" />
                <span>Not just another AI journal</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
                This isn't ChatGPT with a <TextHighlight variant="gradient">journal skin</TextHighlight>.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Becoming operates with <span className="text-foreground font-semibold">10²⁴× more structured context</span> than vanilla AI.
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
              <p className="text-lg">
                <span className="font-semibold">The difference:</span> Generic AI gives you "take a deep breath."
                Becoming says <span className="text-teal-600 dark:text-teal-400 font-medium">"I see you're drifting toward burnout—the thing you said you fear most."</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== THE PLAN (How It Works) - Glassmorphism ==================== */}
      <section id="how-it-works" className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <BackgroundNumber number="03" position="center" variant="teal" size="xl" className="opacity-[0.025]" />

        {/* Background orbs */}
        <div className="absolute top-10 left-1/4 w-72 h-72 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-64 h-64 bg-rose-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealOnScroll className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              <TextHighlight variant="teal">Four steps</TextHighlight> to becoming.
            </h2>
            <p className="text-lg text-muted-foreground">
              From <TextHighlight variant="rose">drifting</TextHighlight> unconsciously to living <TextHighlight variant="teal">intentionally</TextHighlight>.
            </p>
          </RevealOnScroll>

          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-4">
              {steps.map((step, index) => (
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
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/25"
              >
                Start Becoming
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== GUIDE SECTION (Empathy + Authority) - Glassmorphism ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <BackgroundNumber number="05" position="top-right" variant="rose" size="xl" className="opacity-[0.0375]" />

        {/* Background orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl">
            {/* Section headline */}
            <RevealOnScroll className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
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
                  <div className="text-sm font-medium">Soul Topics</div>
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
        <BackgroundNumber number="06" position="top-left" variant="teal" size="xl" className="opacity-[0.0375]" />

        {/* Subtle background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-background to-muted/20 -z-10" />
        <div className="absolute top-1/3 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
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
          </div>
        </div>
      </section>

      {/* ==================== PRODUCT FEATURES SECTION (Glassmorphism + Chart Previews) ==================== */}
      <section className="py-24 md:py-32 border-t relative overflow-hidden">
        {/* Giant background number */}
        <BackgroundNumber number="04" position="top-left" variant="amber" size="xl" className="opacity-[0.0375]" />

        {/* Section-specific orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealOnScroll className="mx-auto max-w-2xl text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full glass-teal px-4 py-2 text-sm">
              <Sparkles className="h-4 w-4 text-teal-500" />
              <span>See your patterns</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Your mind, <TextHighlight variant="teal">beautifully</TextHighlight> visualized.
            </h2>
            <p className="text-lg text-muted-foreground">
              Hover over each card to preview the visualization.
            </p>
          </RevealOnScroll>

          {/* Glassmorphism feature cards with chart previews */}
          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3 hover-dim-siblings">
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

          {/* Additional features - smaller cards */}
          <div className="mt-8 mx-auto max-w-4xl grid gap-4 md:grid-cols-3">
            {additionalFeatures.map((feature, index) => (
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
          <div className="mt-16 mx-auto max-w-4xl text-center">
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
        <BackgroundNumber number="07" position="top-right" variant="amber" size="xl" className="opacity-[0.0375]" />

        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/20 via-background to-muted/30 -z-10" />
        <div className="absolute top-1/2 left-10 w-64 h-64 bg-violet-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-20 w-72 h-72 bg-pink-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
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

          <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3 hover-dim-siblings">
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

        <div className="container mx-auto px-4 relative z-10">
          <RevealOnScroll className="mx-auto max-w-4xl rounded-3xl glass-feature-card p-12 text-center relative overflow-hidden">
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
              className="group relative z-10 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-teal-600 px-8 py-4 text-lg font-medium text-white transition-all hover:scale-105 hover:shadow-xl hover:shadow-teal-500/30"
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
                <li><Link to="/profile" className="hover:text-foreground transition-colors">Life Blueprint</Link></li>
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
