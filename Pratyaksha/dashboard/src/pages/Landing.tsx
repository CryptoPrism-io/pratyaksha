import { Link } from "react-router-dom"
import {
  ArrowRight,
  Brain,
  Calendar,
  Sparkles,
  Zap,
  Shield,
  LineChart,
  Target,
  Layers,
  Activity,
} from "lucide-react"

const stats = [
  { label: "Visualizations", value: "10+" },
  { label: "AI-Powered", value: "4 Agents" },
  { label: "Response Time", value: "<2s" },
]

const features = [
  {
    icon: LineChart,
    title: "Emotional Timeline",
    description: "Track your emotional trajectory over time. Spot patterns and cycles in your mental states.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Calendar,
    title: "Calendar Heatmap",
    description: "See journaling consistency at a glance. Identify high-stress periods and patterns.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Sparkles,
    title: "AI Insights",
    description: "Automatic sentiment analysis and theme extraction from entries. Powered by GPT-4.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Target,
    title: "Contradiction Tracking",
    description: "Identify internal conflicts like hope vs. hopelessness, control vs. surrender.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Layers,
    title: "Energy Patterns",
    description: "Visualize your energy shapes - from chaotic to centered, expanding to contracted.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: Activity,
    title: "Mode Distribution",
    description: "Understand your cognitive modes - reflective, anxious, grounded, and more.",
    color: "from-indigo-500 to-violet-500",
  },
]

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      {/* Hero Section */}
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
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm animate-slide-up">
              <Zap className="h-4 w-4 text-primary" />
              <span>AI-Powered Cognitive Analytics</span>
            </div>

            {/* Main heading */}
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl lg:text-8xl animate-slide-up animation-delay-200">
              <span className="gradient-text">Pratyaksha</span>
            </h1>

            <p className="mb-4 text-2xl font-light text-muted-foreground md:text-3xl animate-slide-up animation-delay-400">
              Direct Perception
            </p>

            {/* Subtitle */}
            <p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground md:text-xl animate-slide-up animation-delay-600">
              Transform your cognitive journal entries into actionable insights.
              Understand your mind through beautiful visualizations and AI-powered analysis.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up animation-delay-800">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-xl animate-glow"
              >
                Enter Dashboard
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                to="/logs"
                className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-8 py-4 text-lg font-medium transition-all hover:bg-primary/10 hover:border-primary/50"
              >
                Start Logging
              </Link>
            </div>

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
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
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

      {/* Features Section */}
      <section className="relative py-24 md:py-32">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/30 to-background" />

        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm">
              <Brain className="h-4 w-4 text-primary" />
              <span>Powerful Visualizations</span>
            </div>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              Understand Your Patterns
            </h2>
            <p className="text-lg text-muted-foreground">
              10 powerful visualizations to illuminate your cognitive landscape
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

      {/* How It Works Section */}
      <section className="py-24 md:py-32 border-t">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-5xl">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground">
              From thought to insight in seconds
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: "Log Your Thoughts", desc: "Write freely in our distraction-free editor" },
                { step: "02", title: "AI Analyzes", desc: "4 specialized agents process your entry" },
                { step: "03", title: "Gain Insights", desc: "Visualize patterns and actionable recommendations" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-2xl font-bold text-primary">
                    {item.step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl rounded-3xl bg-gradient-to-r from-primary/10 via-purple-500/10 to-blue-500/10 p-12 text-center border border-primary/20">
            <Shield className="mx-auto mb-6 h-12 w-12 text-primary" />
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
              Your Data, Your Insights
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-muted-foreground">
              All processing happens securely. Your journal entries are analyzed to provide personalized insights while maintaining complete privacy.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-all hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-semibold">Pratyaksha</span>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Built with React, shadcn/ui, and Airtable
            </p>

            <p className="text-sm text-muted-foreground">
              प्रत्यक्ष — Direct Perception
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
