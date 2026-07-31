import { ArrowRight, CheckCircle2 } from 'lucide-react'

const BENEFITS = [
  'No credit card required',
  'Four AI agents on every entry',
  '21+ visualizations included',
]

export function CTA() {
  return (
    <section className="px-4 pb-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="relative overflow-hidden rounded-3xl border border-rule bg-paper-2 px-6 py-14 text-center sm:px-12 sm:py-20">
          {/* Single static accent bloom (no animation) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full"
            style={{ background: 'var(--color-bloom-cta)', filter: 'blur(90px)' }}
          />

          <div className="relative z-10">
            <h2 className="mx-auto max-w-xl text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Ready to see your mind clearly?
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-base text-ink-2 sm:text-lg">
              Start journaling today and let four AI agents reveal the patterns, contradictions, and
              insights you've been missing.
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href="/dashboard"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-ink transition-colors hover:brightness-110 sm:w-auto"
              >
                Start journaling free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>

              <a
                href="/demo"
                className="inline-flex w-full items-center justify-center rounded-full border border-rule-2 px-8 py-4 text-base font-medium text-ink transition-colors hover:border-ink hover:bg-paper sm:w-auto"
              >
                View demo
              </a>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-x-6 gap-y-2 sm:flex-row">
              {BENEFITS.map((benefit) => (
                <span key={benefit} className="inline-flex items-center gap-1.5 text-sm text-muted">
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
