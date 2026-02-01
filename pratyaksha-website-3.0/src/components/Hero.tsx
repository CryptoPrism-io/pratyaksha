import { ArrowRight, Play, Sparkles } from 'lucide-react'

export function Hero() {
  return (
    <section className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20">
      <div className="max-w-4xl mx-auto" style={{ textAlign: 'center' }}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-10">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-medium text-purple-300">Your mind, visualized with 4 AI agents</span>
        </div>

        {/* Sanskrit Title */}
        <h1
          className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white leading-none mb-4"
          style={{
            fontFamily: 'serif',
            textShadow: '0 0 80px rgba(167, 139, 250, 0.5), 0 0 120px rgba(167, 139, 250, 0.3)'
          }}
        >
          प्रत्यक्ष
        </h1>

        {/* English name */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-3">
          Pratyaksha
        </h2>

        {/* Tagline */}
        <p className="text-base sm:text-lg text-white/50 italic mb-8">
          "Direct Perception" — See yourself clearly
        </p>

        {/* Value proposition */}
        <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-6 leading-relaxed">
          Write your thoughts. Our 4 AI agents analyze your intent, emotions, themes, and contradictions — revealing patterns you never knew existed.
        </p>

        {/* Sub-feature highlight */}
        <p className="text-sm text-white/40 max-w-lg mx-auto mb-10">
          21 visualizations • Contradiction tracking • Energy shape analysis • Under 2 seconds
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <a
            href="/dashboard"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] transition-all"
          >
            Start Journaling Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="/demo"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full border border-white/20 text-white font-medium hover:bg-white/5 hover:border-white/30 transition-all"
          >
            <Play className="w-4 h-4" />
            Watch Demo
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="text-white/40">
          <span className="text-xs tracking-wide uppercase block mb-3">Discover the pipeline</span>
          <div className="w-6 h-10 rounded-full border-2 border-white/20 mx-auto flex items-start justify-center p-1.5">
            <div className="w-1.5 h-2.5 rounded-full bg-white/50 animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  )
}
