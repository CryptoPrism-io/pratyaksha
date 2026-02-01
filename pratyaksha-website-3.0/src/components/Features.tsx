import { Brain, Sparkles, BarChart3, GitBranch, Activity, Mic } from 'lucide-react'

const FEATURES = [
  { icon: Brain, title: 'Intent Classification', description: 'Automatically categorizes your entry: Emotional, Cognitive, Work, Health, Reflection, or 10 other types.', color: 'text-purple-400', bgColor: 'bg-purple-500/15' },
  { icon: Sparkles, title: 'Mood & Energy Shapes', description: 'Beyond simple moods — detect whether your energy is Rising, Chaotic, Centered, Expanding, or Flat.', color: 'text-pink-400', bgColor: 'bg-pink-500/15' },
  { icon: GitBranch, title: 'Contradiction Tracking', description: 'Unique feature: Spot internal conflicts like "Action vs Fear" or "Growth vs Comfort" across entries.', color: 'text-amber-400', bgColor: 'bg-amber-500/15' },
  { icon: BarChart3, title: '21 Visualizations', description: 'Sankey flows, GitHub-style heatmaps, radar charts, theme clouds, emotional timelines, and more.', color: 'text-blue-400', bgColor: 'bg-blue-500/15' },
  { icon: Activity, title: 'Actionable Insights', description: 'Each entry ends with a personalized "Next Action" suggestion based on your cognitive patterns.', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15' },
  { icon: Mic, title: 'Voice Journaling', description: 'Speak your thoughts freely. Real-time transcription means less friction, more flow.', color: 'text-cyan-400', bgColor: 'bg-cyan-500/15' },
]

export function Features() {
  return (
    <section id="features" className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16" style={{ textAlign: 'center' }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5" style={{ textAlign: 'center' }}>
            Beyond simple journaling
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed" style={{ textAlign: 'center' }}>
            Pratyaksha doesn't just store your thoughts — it analyzes them with 4 specialized AI agents to reveal patterns you've never seen before.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 sm:p-7 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300"
            >
              <div className={`inline-block p-3.5 rounded-2xl ${feature.bgColor} mb-5 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2.5">{feature.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
