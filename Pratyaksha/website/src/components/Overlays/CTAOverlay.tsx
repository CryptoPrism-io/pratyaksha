import { motion } from 'framer-motion'
import { BaseOverlay } from './BaseOverlay'
import { VerticalBranding } from './VerticalBranding'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'

interface CTAOverlayProps {
  isVisible: boolean
  transitionOpacity?: number
  isPreloading?: boolean
}

const BENEFITS = [
  'No credit card required',
  '21+ visualizations',
  'Analysis in <2 seconds',
  'Your data stays private',
]

export function CTAOverlay({ isVisible, transitionOpacity, isPreloading }: CTAOverlayProps) {
  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <VerticalBranding isVisible={isVisible} animationStyle="flicker" />
      <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-4xl mx-auto">
        {/* Card container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isVisible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="relative p-8 sm:p-12 lg:p-16 rounded-3xl overflow-hidden w-full"
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Background gradients */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom right, rgba(168,85,247,0.1), transparent, rgba(236,72,153,0.1))',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to top, rgba(0,0,0,0.2), transparent)',
            }}
          />

          <div className="relative z-10">
            {/* Icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isVisible ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block p-4 rounded-2xl mb-8"
              style={{
                background: 'linear-gradient(to bottom right, rgba(168,85,247,0.2), rgba(236,72,153,0.2))',
                border: '1px solid rgba(168,85,247,0.2)',
              }}
            >
              <Sparkles className="w-8 h-8" style={{ color: '#a78bfa' }} />
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight"
              style={{ textAlign: 'center' }}
            >
              Ready to see your mind{' '}
              <motion.span
                style={{
                  color: '#f0abfc',
                  textShadow: '0 0 10px #e879f9, 0 0 20px #d946ef, 0 0 40px #c026d3, 0 0 60px #a855f7',
                }}
                animate={{
                  textShadow: [
                    '0 0 10px #e879f9, 0 0 20px #d946ef, 0 0 40px #c026d3, 0 0 60px #a855f7',
                    '0 0 15px #f0abfc, 0 0 30px #e879f9, 0 0 50px #d946ef, 0 0 80px #c026d3',
                    '0 0 10px #e879f9, 0 0 20px #d946ef, 0 0 40px #c026d3, 0 0 60px #a855f7',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                clearly?
              </motion.span>
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg text-white/60 max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ textAlign: 'center' }}
            >
              Start journaling today and let 4 AI agents reveal the patterns, contradictions, and insights you've been missing.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8"
            >
              <motion.a
                href="https://pratyaksha-dashboard-963362833537.asia-south1.run.app"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-semibold shadow-lg transition-all"
                style={{
                  background: 'linear-gradient(to right, #a855f7, #ec4899)',
                  boxShadow: '0 10px 40px -10px rgba(168, 85, 247, 0.4)',
                }}
              >
                Decode Your Patterns
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                href="https://pratyaksha-dashboard-963362833537.asia-south1.run.app"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 rounded-full text-white font-medium transition-all"
                style={{
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                View Demo
              </motion.a>
            </motion.div>

            {/* Benefits list */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2"
            >
              {BENEFITS.map((benefit, i) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isVisible ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                  className="inline-flex items-center gap-1.5 text-xs text-white/50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#34d399' }} />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* Logo at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 flex items-center gap-2 text-white/30"
        >
          <div
            className="w-6 h-6 rounded flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <span className="text-xs font-bold">P</span>
          </div>
          <span className="text-sm font-medium">Pratyaksha</span>
        </motion.div>
      </div>
    </BaseOverlay>
  )
}
