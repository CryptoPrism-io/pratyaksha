import { Link } from "react-router-dom"
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
} from "lucide-react"
import { cn } from "../lib/utils"

// Stats that matter to customers
const stats = [
  { label: "AI Agents", value: "9", description: "Specialized analysis" },
  { label: "Data Points", value: "95+", description: "Per user profile" },
  { label: "Warning Types", value: "4", description: "Proactive alerts" },
]

// The 3-step plan
const steps = [
  {
    number: "1",
    title: "Define Your Vision",
    description: "Tell us who you want to become—and who you don't want to become.",
    icon: Compass,
    color: "from-violet-500 to-purple-500",
  },
  {
    number: "2",
    title: "Journal Your Truth",
    description: "Write freely. 9 AI agents analyze every word for patterns.",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-500",
  },
  {
    number: "3",
    title: "Stay On Course",
    description: "Get warnings when patterns drift toward your anti-vision.",
    icon: Bell,
    color: "from-emerald-500 to-green-500",
  },
]

// Comparison: Us vs Generic AI
const comparison = [
  { feature: "AI Agents", generic: "1 generic pass", pratyaksha: "9 specialized agents" },
  { feature: "Data Points", generic: "Conversation only", pratyaksha: "95+ structured fields" },
  { feature: "Goal Awareness", generic: "None", pratyaksha: "Vision + Anti-Vision" },
  { feature: "Pattern Detection", generic: "None", pratyaksha: "4 warning types" },
  { feature: "Context Depth", generic: "~10⁴ tokens", pratyaksha: "10²⁴× more" },
]

// Testimonials (success stories)
const testimonials = [
  {
    quote: "Within 2 weeks, Pratyaksha showed me a pattern I never saw—and it was pulling me toward exactly what I said I didn't want to become.",
    author: "Priya",
    role: "Software Engineer",
    highlight: "pattern I never saw",
  },
  {
    quote: "Other apps track mood. This one tracks whether I'm becoming who I actually want to be. Completely different.",
    author: "Marcus",
    role: "Entrepreneur",
    highlight: "who I actually want to be",
  },
  {
    quote: "The anti-vision warning stopped me in my tracks. I was drifting toward burnout—the exact thing I wrote I feared.",
    author: "Sarah",
    role: "Product Manager",
    highlight: "anti-vision warning",
  },
]

// Features (supporting, not leading)
const features = [
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
  {
    icon: MessageCircle,
    title: "AI That Knows You",
    description: "Chat with AI that references YOUR goals, not generic advice.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Target,
    title: "Smart Prompts",
    description: "Personalized journal prompts based on your Life Blueprint.",
    color: "from-emerald-500 to-green-500",
  },
  {
    icon: LineChart,
    title: "Vision Alignment",
    description: "See how your entries align with your stated direction.",
    color: "from-indigo-500 to-violet-500",
  },
]

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 via-purple-500/10 to-blue-500/5 animate-gradient" />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 -z-10 hero-pattern opacity-50" />

        {/* Floating orbs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-float animation-delay-400" />

        <div className="container mx-auto px-4 py-20 md:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge - Emotional hook */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm animate-slide-up">
              <Eye className="h-4 w-4 text-primary" />
              <span>What if your journal knew your goals?</span>
            </div>

            {/* Main heading - Customer transformation */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl animate-slide-up animation-delay-200">
              <span className="block">Finally, a journal that</span>
              <span className="gradient-text">warns you when you're drifting.</span>
            </h1>

            {/* Subtitle - The promise */}
            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up animation-delay-400">
              Define your vision. Journal your truth.
              Let 9 AI agents keep you on course toward who you want to become.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-600">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-xl animate-glow"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-8 py-4 text-lg font-medium transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                See How It Works
              </a>
            </div>

            {/* Social proof */}
            <p className="mt-6 text-sm text-muted-foreground animate-slide-up animation-delay-800">
              Free to start. No credit card required.
            </p>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8 border-t border-border/50 pt-12">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="text-center animate-slide-up opacity-0"
                  style={{
                    animationDelay: `${800 + index * 150}ms`,
                    animationFillMode: 'forwards'
                  }}
                >
                  <div className="text-3xl font-bold text-foreground md:text-4xl">{stat.value}</div>
                  <div className="text-sm font-medium text-foreground">{stat.label}</div>
                  <div className="text-xs text-muted-foreground">{stat.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="h-10 w-6 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <div className="h-2 w-1 rounded-full bg-muted-foreground/50 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ==================== STAKES SECTION (The Problem) ==================== */}
      <section className="relative py-24 md:py-32 border-t">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-red-500/5 to-background" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            {/* Opening hook */}
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-6">
                You've journaled before. Maybe for years.
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                But here's what most apps won't tell you...
              </p>
            </div>

            {/* The 3 problems */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Writing without insight</h3>
                <p className="text-muted-foreground text-sm">
                  You journal, but do you actually see your patterns? Most entries disappear into the void.
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Goals without tracking</h3>
                <p className="text-muted-foreground text-sm">
                  You set intentions every January. By March, they've faded. Who tells you when you drift?
                </p>
              </div>

              <div className="p-6 rounded-2xl border bg-card hover:shadow-lg transition-shadow">
                <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Patterns forming unseen</h3>
                <p className="text-muted-foreground text-sm">
                  By the time you notice, they're already habits. You're becoming someone—but who?
                </p>
              </div>
            </div>

            {/* Empathy close */}
            <p className="text-center text-muted-foreground text-lg max-w-2xl mx-auto">
              <span className="text-foreground font-medium">We built Pratyaksha because we lived this.</span> We journaled for years—and still felt stuck.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== DIFFERENTIATOR SECTION ==================== */}
      <section className="py-24 md:py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
                <Zap className="h-4 w-4 text-primary" />
                <span>Not just another AI journal</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
                This isn't ChatGPT with a journal skin.
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Pratyaksha operates with <span className="text-foreground font-semibold">10²⁴× more structured context</span> than vanilla AI.
              </p>
            </div>

            {/* Comparison table */}
            <div className="rounded-2xl border overflow-hidden mb-8">
              <div className="grid grid-cols-3 bg-muted/50">
                <div className="p-4 font-medium text-sm text-muted-foreground">Feature</div>
                <div className="p-4 font-medium text-sm text-muted-foreground text-center">Generic AI</div>
                <div className="p-4 font-medium text-sm text-center bg-primary/10 text-primary">Pratyaksha</div>
              </div>
              {comparison.map((row, index) => (
                <div key={row.feature} className={cn("grid grid-cols-3", index % 2 === 0 ? "bg-background" : "bg-muted/30")}>
                  <div className="p-4 text-sm font-medium">{row.feature}</div>
                  <div className="p-4 text-sm text-muted-foreground text-center">{row.generic}</div>
                  <div className="p-4 text-sm text-center font-medium bg-primary/5">{row.pratyaksha}</div>
                </div>
              ))}
            </div>

            {/* Key insight */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 border border-primary/20 text-center">
              <p className="text-lg">
                <span className="font-semibold">The difference:</span> Generic AI gives you "take a deep breath."
                Pratyaksha says <span className="text-primary font-medium">"I see you're drifting toward burnout—the thing you said you fear most."</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== THE PLAN (How It Works) ==================== */}
      <section id="how-it-works" className="py-24 md:py-32 border-t">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Three steps. That's all.
            </h2>
            <p className="text-lg text-muted-foreground">
              From drifting unconsciously to living intentionally.
            </p>
          </div>

          <div className="mx-auto max-w-5xl">
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="relative group">
                  {/* Connector line (hidden on mobile) */}
                  {step.number !== "3" && (
                    <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
                  )}

                  <div className="relative z-10 text-center p-6 rounded-2xl border bg-card hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className={cn(
                      "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-r text-white text-2xl font-bold",
                      step.color
                    )}>
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="text-xs font-medium text-primary mb-2">Step {step.number}</div>
                    <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA after plan */}
            <div className="text-center mt-12">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-xl"
              >
                Start Your Journey
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== GUIDE SECTION (Empathy + Authority) ==================== */}
      <section className="py-24 md:py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Empathy side */}
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-6">
                  We built this because we needed it ourselves.
                </h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We journaled for years. Set goals every January. Watched them fade by March.
                    Felt stuck in patterns we couldn't see clearly.
                  </p>
                  <p>
                    Then we wondered: <span className="text-foreground font-medium">what if AI could actually know where we're trying to go—and tell us when we drift?</span>
                  </p>
                  <p>
                    That question became Pratyaksha.
                  </p>
                </div>
              </div>

              {/* Authority side - stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 text-center">
                  <div className="text-4xl font-bold text-violet-500 mb-1">9</div>
                  <div className="text-sm font-medium">AI Agents</div>
                  <div className="text-xs text-muted-foreground">Specialized analysis</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-center">
                  <div className="text-4xl font-bold text-blue-500 mb-1">95+</div>
                  <div className="text-sm font-medium">Data Points</div>
                  <div className="text-xs text-muted-foreground">Per user profile</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20 text-center">
                  <div className="text-4xl font-bold text-pink-500 mb-1">17</div>
                  <div className="text-sm font-medium">Soul Topics</div>
                  <div className="text-xs text-muted-foreground">Deep self-discovery</div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center">
                  <div className="text-4xl font-bold text-amber-500 mb-1">4</div>
                  <div className="text-sm font-medium">Warning Types</div>
                  <div className="text-xs text-muted-foreground">Proactive alerts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SUCCESS SECTION (Testimonials) ==================== */}
      <section className="py-24 md:py-32 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight md:text-5xl mb-4">
                This is what clarity feels like.
              </h2>
              <p className="text-lg text-muted-foreground">
                Real stories from people who stopped drifting.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((testimonial) => (
                <div key={testimonial.author} className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-shadow">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-sm mb-4 leading-relaxed">
                    "{testimonial.quote.split(testimonial.highlight)[0]}
                    <span className="text-primary font-medium">{testimonial.highlight}</span>
                    {testimonial.quote.split(testimonial.highlight)[1]}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-semibold text-primary">
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

      {/* ==================== FEATURES SECTION (Supporting) ==================== */}
      <section className="py-24 md:py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
              <Layers className="h-4 w-4 text-primary" />
              <span>Everything you need</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Tools to stay on course.
            </h2>
            <p className="text-lg text-muted-foreground">
              Not just tracking—transformation.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-2xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient border on hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r ${feature.color} text-white`}>
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

      {/* ==================== FINAL CTA SECTION ==================== */}
      <section className="py-24 md:py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 p-12 text-center border border-primary/20">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Your patterns are already forming.
            </h2>
            <p className="mx-auto mb-2 max-w-xl text-xl text-muted-foreground">
              The question is: are they the ones you want?
            </p>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              Define your vision. Let AI keep you on course.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-xl"
            >
              Start Your Journey
              <ArrowRight className="h-5 w-5" />
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Free to start. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-auto border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-semibold">Pratyaksha</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                प्रत्यक्ष — Direct Perception
              </p>
              <p className="text-xs text-muted-foreground">
                AI that knows where you're going.
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
            &copy; {new Date().getFullYear()} Pratyaksha. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
