import { FileText, Brain, Sparkles, GitBranch, Lightbulb, ChevronRight } from 'lucide-react'

const STEPS = [
  { icon: FileText, title: 'You Write', description: 'Type or speak freely', output: 'Raw text', color: 'text-white', bgColor: 'bg-white/10', borderColor: 'border-white/20' },
  { icon: Brain, title: 'Intent Agent', description: 'Classifies entry type', output: 'Type & snapshot', color: 'text-purple-400', bgColor: 'bg-purple-500/15', borderColor: 'border-purple-500/30' },
  { icon: Sparkles, title: 'Emotion Agent', description: 'Analyzes mood', output: 'Energy & sentiment', color: 'text-pink-400', bgColor: 'bg-pink-500/15', borderColor: 'border-pink-500/30' },
  { icon: GitBranch, title: 'Theme Agent', description: 'Finds patterns', output: 'Contradictions', color: 'text-amber-400', bgColor: 'bg-amber-500/15', borderColor: 'border-amber-500/30' },
  { icon: Lightbulb, title: 'Insight Agent', description: 'Generates actions', output: 'Next steps', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15', borderColor: 'border-emerald-500/30' },
]

export function HowItWorks() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-12 sm:mb-16" style={{ textAlign: 'center' }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5" style={{ textAlign: 'center' }}>
            The{' '}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
              4-Agent Pipeline
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed" style={{ textAlign: 'center' }}>
            Your entry flows through 4 specialized AI agents in sequence, each extracting a different layer of insight.
          </p>
        </div>

        {/* Pipeline - Desktop horizontal */}
        <div className="hidden lg:flex items-stretch justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.title} className="flex items-center">
              <div className={`relative p-5 rounded-2xl bg-white/[0.02] border ${step.borderColor} text-center w-40 h-48 flex flex-col items-center`}>
                {/* Step number badge */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full ${step.bgColor} border ${step.borderColor} flex items-center justify-center`}>
                  <span className={`text-[10px] font-bold ${step.color}`}>{i + 1}</span>
                </div>

                <div className={`inline-block p-3.5 rounded-xl ${step.bgColor} mt-3 mb-3`}>
                  <step.icon className={`w-5 h-5 ${step.color}`} />
                </div>

                <h3 className="font-semibold text-white text-sm mb-1">{step.title}</h3>
                <p className="text-[11px] text-white/40 mb-auto">{step.description}</p>
                <p className={`text-[11px] ${step.color} font-medium mt-2`}>{step.output}</p>
              </div>

              {i < STEPS.length - 1 && (
                <ChevronRight className="w-4 h-4 text-white/15 mx-1 flex-shrink-0" />
              )}
            </div>
          ))}
        </div>

        {/* Mobile/Tablet: Grid layout */}
        <div className="lg:hidden grid grid-cols-5 gap-2">
          {STEPS.map((step, i) => (
            <div key={step.title} className={`relative p-3 rounded-xl bg-white/[0.02] border ${step.borderColor} text-center`}>
              <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full ${step.bgColor} border ${step.borderColor} flex items-center justify-center`}>
                <span className={`text-[9px] font-bold ${step.color}`}>{i + 1}</span>
              </div>

              <div className={`inline-block p-2.5 rounded-lg ${step.bgColor} mt-2 mb-2`}>
                <step.icon className={`w-4 h-4 ${step.color}`} />
              </div>

              <h3 className="font-semibold text-white text-[10px] leading-tight">{step.title}</h3>
            </div>
          ))}
        </div>

        {/* Processing time badge */}
        <div className="text-center mt-10 sm:mt-12">
          <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Full analysis in under 2 seconds
          </span>
        </div>
      </div>
    </section>
  )
}
