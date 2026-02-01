import { BarChart3, Bot, Zap, GitBranch } from 'lucide-react'

const STATS = [
  { icon: BarChart3, value: '21+', label: 'Visualizations', sublabel: 'Charts & insights', color: 'text-purple-400', bgColor: 'bg-purple-500/15' },
  { icon: Bot, value: '4', label: 'AI Agents', sublabel: 'Working in sequence', color: 'text-blue-400', bgColor: 'bg-blue-500/15' },
  { icon: GitBranch, value: '12', label: 'Contradictions', sublabel: 'Tracked patterns', color: 'text-pink-400', bgColor: 'bg-pink-500/15' },
  { icon: Zap, value: '<2s', label: 'Processing', sublabel: 'Per entry analysis', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15' },
]

export function Stats() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="p-6 sm:p-8 rounded-3xl bg-white/[0.02] border border-white/[0.06]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className={`inline-block p-3 rounded-2xl ${stat.bgColor} mb-4`}>
                  <stat.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm font-medium text-white/70 mb-0.5">{stat.label}</div>
                <div className="text-xs text-white/40">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
