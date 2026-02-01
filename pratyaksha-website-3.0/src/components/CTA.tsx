import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

const BENEFITS = [
  'No credit card required',
  '4 AI agents analyzing every entry',
  '21+ visualizations included',
]

export function CTA() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 pb-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative p-8 sm:p-12 lg:p-16 rounded-3xl bg-white/[0.02] border border-white/[0.06] text-center overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-pink-500/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

          <div className="relative z-10">
            {/* Icon */}
            <div className="inline-block p-4 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/20 mb-8">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>

            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight" style={{ textAlign: 'center' }}>
              Ready to see your mind{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">clearly?</span>
            </h2>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed" style={{ textAlign: 'center' }}>
              Start journaling today and let 4 AI agents reveal the patterns, contradictions, and insights you've been missing.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
              >
                Start Journaling Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>

              <a
                href="/demo"
                className="px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/30 transition-all"
              >
                View Demo
              </a>
            </div>

            {/* Benefits list */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-x-6 gap-y-3">
              {BENEFITS.map((benefit) => (
                <div key={benefit} className="inline-flex items-center gap-2 text-sm text-white/50">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
