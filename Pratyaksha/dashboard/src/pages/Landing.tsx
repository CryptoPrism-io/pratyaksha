import { Link } from "react-router-dom"
import { ArrowRight, Brain, BarChart3, Calendar, Sparkles } from "lucide-react"

export function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Brain className="h-12 w-12 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-6xl">
              <span className="text-primary">Pratyaksha</span>
              <br />
              <span className="text-foreground">Direct Perception</span>
            </h1>

            {/* Subtitle */}
            <p className="mb-8 text-lg text-muted-foreground md:text-xl">
              Visualize your mind. Transform cognitive journal entries into
              actionable insights with beautiful analytics.
            </p>

            {/* CTA */}
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Enter Dashboard
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold tracking-tight">
              Understand Your Patterns
            </h2>
            <p className="mb-12 text-muted-foreground">
              10 powerful visualizations to illuminate your cognitive landscape
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Emotional Timeline</h3>
              <p className="text-sm text-muted-foreground">
                Track your emotional trajectory over time. Spot patterns and
                cycles in your mental states.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Calendar Heatmap</h3>
              <p className="text-sm text-muted-foreground">
                See your journaling consistency at a glance. Identify high-stress
                periods and patterns.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border bg-card p-8 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <Sparkles className="h-6 w-6 text-accent" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Automatic sentiment analysis and theme extraction from your
                entries. Powered by AI.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with{" "}
            <span className="text-primary">React</span>,{" "}
            <span className="text-primary">Tremor</span>, and{" "}
            <span className="text-primary">Airtable</span>
          </p>
          <p className="mt-2">
            Pratyaksha (प्रत्यक्ष) — Sanskrit for "direct perception"
          </p>
        </div>
      </footer>
    </div>
  )
}
