const STEPS = [
  { stage: '1.0', title: 'You write', description: 'Type or speak freely.', output: 'Raw text' },
  { stage: '2.0', title: 'Intent agent', description: 'Classifies entry type.', output: 'Type & snapshot' },
  { stage: '3.0', title: 'Emotion agent', description: 'Analyzes mood.', output: 'Energy & sentiment' },
  { stage: '4.0', title: 'Theme agent', description: 'Finds patterns.', output: 'Contradictions' },
  { stage: '5.0', title: 'Insight agent', description: 'Generates actions.', output: 'Next steps' },
]

export function HowItWorks() {
  return (
    <section id="pipeline" className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Section head */}
        <div className="mb-12 max-w-2xl sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            The four-agent pipeline
          </h2>
          <p className="mt-5 text-lg text-ink-2">
            Your entry flows through four specialized AI agents in sequence, each extracting a
            different layer of insight.
          </p>
        </div>

        {/* Step sequence — vertical, numbered */}
        <ol className="space-y-2">
          {STEPS.map((step) => (
            <li
              key={step.title}
              className="flex items-center gap-5 rounded-2xl border border-rule bg-paper-2 px-5 py-5 sm:gap-8 sm:px-7 sm:py-6"
            >
              <span className="tnum shrink-0 font-display text-sm font-bold text-accent">{step.stage}</span>
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-ink sm:text-lg">{step.title}</h3>
                <p className="mt-0.5 text-sm text-ink-2">{step.description}</p>
              </div>
              <span className="ml-auto hidden shrink-0 rounded-full border border-rule bg-paper px-3 py-1 text-xs text-muted sm:inline-block">
                {step.output}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-8 text-center text-sm text-muted">
          Full analysis in under two seconds.
        </p>
      </div>
    </section>
  )
}
