import { ArrowRight, Play } from 'lucide-react'

export function Hero() {
  return (
    <section className="px-4 pb-8 pt-32 sm:px-6 sm:pt-40 lg:px-8">
      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="text-xs font-medium tracking-wide text-accent">Your mind, visualized</span>
        </div>

        {/* Sanskrit Title */}
        <h1 className="font-sanskrit text-6xl font-bold leading-none text-ink sm:text-7xl md:text-8xl">
          प्रत्यक्ष
        </h1>

        {/* English name */}
        <p className="mt-3 text-xl font-bold tracking-tight text-ink sm:text-2xl">Pratyaksha</p>

        {/* Tagline */}
        <p className="mt-2 text-base text-muted sm:text-lg">Direct Perception — see yourself clearly.</p>

        {/* Value proposition */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-2 sm:text-xl">
          Write your thoughts. Four AI agents analyze your intent, emotions, themes, and
          contradictions — revealing patterns you never knew existed.
        </p>

        {/* Sub-feature highlight */}
        <p className="mx-auto mt-4 max-w-lg text-sm text-muted">
          21 visualizations · Contradiction tracking · Energy shape analysis
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href="/dashboard"
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-ink transition-colors hover:brightness-110 sm:w-auto"
          >
            Start journaling free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>

          <a
            href="/demo"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-rule-2 px-8 py-4 text-base font-medium text-ink transition-colors hover:border-ink hover:bg-paper-2 sm:w-auto"
          >
            <Play className="h-4 w-4" />
            Watch demo
          </a>
        </div>
      </div>
    </section>
  )
}
