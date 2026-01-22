import { motion } from 'framer-motion'
import { BaseOverlay, AnimatedText, TextReveal, TypewriterText } from './BaseOverlay'
import { STATE_CONTENT, STATES } from '@/lib/constants'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CTAOverlayProps {
  isVisible: boolean
  transitionOpacity?: number
  isPreloading?: boolean
}

export function CTAOverlay({ isVisible, transitionOpacity, isPreloading }: CTAOverlayProps) {
  const content = STATE_CONTENT[STATES.RADIANT]

  return (
    <BaseOverlay isVisible={isVisible} transitionOpacity={transitionOpacity} isPreloading={isPreloading}>
      <div className="flex flex-col items-center justify-center text-center px-4 sm:px-6 max-w-3xl mx-auto">
        {/* Glowing orb with particles */}
        <AnimatedText delay={0} animation="scaleIn">
          <motion.div className="relative mb-10">
            {/* Orbiting particles */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/30 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                }}
                animate={{
                  x: [0, Math.cos(i * 2.09) * 50, 0],
                  y: [0, Math.sin(i * 2.09) * 50, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 1,
                  ease: 'easeInOut',
                }}
              />
            ))}

            <motion.div
              animate={{
                boxShadow: [
                  '0 0 40px 10px rgba(255,255,255,0.2)',
                  '0 0 80px 30px rgba(255,255,255,0.4)',
                  '0 0 40px 10px rgba(255,255,255,0.2)',
                ],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </AnimatedText>

        {/* Headline with text reveal */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6"
        >
          <TextReveal text={content.headline} delay={0.1} />
        </motion.h2>

        {/* Subline with typewriter effect */}
        <AnimatedText delay={0.3} animation="slideUp">
          <p className="text-xl sm:text-2xl text-white/80 mb-12 max-w-xl">
            <TypewriterText
              text={content.subline}
              delay={0.3}
              speed={18}
              highlights={[
                { words: ['Transform'], color: '#a78bfa', fontClass: 'font-cabinet' },
                { words: ['thoughts'], color: '#60a5fa', fontClass: 'font-playfair', italic: true },
                { words: ['actionable'], color: '#34d399', fontClass: 'font-syne', uppercase: true },
                { words: ['self-insight'], color: '#fbbf24', fontClass: 'font-space' },
              ]}
            />
          </p>
        </AnimatedText>

        {/* CTA Buttons */}
        <AnimatedText delay={0.4} animation="pop">
          <div className="flex flex-col items-center gap-4">
            {/* Primary row */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="xl"
                    className="bg-white text-gray-900 hover:bg-gray-100 gap-2 px-8 py-6 text-lg font-semibold relative overflow-hidden group"
                  >
                    <motion.span
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Start Free
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  </Button>
                </a>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                <a
                  href="https://pratyaksha-963362833537.asia-south1.run.app"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="xl"
                    className="border-white/30 text-white hover:bg-white/10 gap-2 px-8 py-6 text-lg"
                  >
                    <Play className="w-5 h-5" />
                    Watch Demo
                  </Button>
                </a>
              </motion.div>
            </div>

            {/* Secondary link */}
            <motion.a
              href="https://pratyaksha-963362833537.asia-south1.run.app/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white/80 text-sm transition-colors"
              whileHover={{ y: -1 }}
            >
              or explore the dashboard first →
            </motion.a>
          </div>
        </AnimatedText>

        {/* Trust signals */}
        <AnimatedText delay={0.5} animation="slideUp" className="mt-12">
          <motion.div
            className="flex flex-col sm:flex-row items-center gap-6 text-white/50 text-sm"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: { staggerChildren: 0.1, delayChildren: 0.6 }
              }
            }}
          >
            {[
              'No credit card required',
              'Free forever plan',
              'Cancel anytime',
            ].map((text, i) => (
              <motion.span
                key={i}
                className="flex items-center gap-2"
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <CheckIcon />
                {text}
              </motion.span>
            ))}
          </motion.div>
        </AnimatedText>

        {/* Logo with safe area support - positioned above safe area */}
        <AnimatedText
          delay={0.7}
          animation="slideUp"
          className="absolute left-1/2 -translate-x-1/2"
          style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <motion.div
            className="flex items-center gap-2 text-white/30"
            whileHover={{ scale: 1.05, opacity: 0.5 }}
          >
            <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
              <span className="text-xs font-bold">P</span>
            </div>
            <span className="text-sm font-medium">Pratyaksha</span>
          </motion.div>
        </AnimatedText>
      </div>
    </BaseOverlay>
  )
}

function CheckIcon() {
  return (
    <motion.svg
      className="w-4 h-4"
      fill="currentColor"
      viewBox="0 0 20 20"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, delay: 0.3 }}
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </motion.svg>
  )
}
