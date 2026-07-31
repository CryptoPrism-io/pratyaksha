import { Brain, Sparkles, GitBranch, BarChart3, Activity, Mic } from 'lucide-react'

const FEATURES = [
  {
    icon: Brain,
    title: 'Intent classification',
    description:
      'Every entry is automatically categorized: Emotional, Cognitive, Work, Health, Reflection, or one of ten other types.',
    span: 'md:col-span-2 md:row-span-2',
  },
  {
    icon: Sparkles,
    title: 'Mood & energy shapes',
    description: 'Beyond simple moods — detect whether your energy is Rising, Chaotic, Centered, Expanding, or Flat.',
    span: 'md:col-span-2',
  },
  {
    icon: GitBranch,
    title: 'Contradiction tracking',
    description: 'Spot internal conflicts like "Action vs Fear" or "Growth vs Comfort" across entries.',
    span: 'md:col-span-2',
  },
  {
    icon: BarChart3,
    title: '21 visualizations',
    description: 'Sankey flows, heatmaps, radar charts, theme clouds, emotional timelines.',
    span: 'md:col-span-2',
  },
  {
    icon: Activity,
    title: 'Actionable insights',
    description: 'Each entry ends with a personalized next action based on your cognitive patterns.',
    span: 'md:col-span-2',
  },
  {
    icon: Mic,
    title: 'Voice journaling',
    description: 'Speak freely — real-time transcription means less friction, more flow.',
    span: 'md:col-span-2',
  },
]

export function Features() {
  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Section head — left-aligned */}
        <div className="mb-12 max-w-2xl sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
            Beyond simple journaling
          </h2>
          <p className="mt-5 text-lg text-ink-2">
            Pratyaksha doesn't just store your thoughts — it analyzes them with four specialized AI
            agents to reveal patterns you've never seen before.
          </p>
        </div>

        {/* Bento grid — asymmetric spans */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:auto-rows-[13rem]">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className={`group rounded-2xl border border-rule bg-paper-2 p-6 transition-colors hover:border-rule-2 ${feature.span}`}
            >
              <div className="flex h-full flex-col">
                <feature.icon className="mb-4 h-6 w-6 text-accent" />
                <h3 className="text-lg font-semibold text-ink">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-2">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
