import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Brain } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-20 md:py-32 bg-gradient-to-br from-violet-600 via-purple-600 to-violet-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }} />
      </div>

      {/* Floating Orbs */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Brain className="w-8 h-8 text-white" />
          </div>

          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to see your mind clearly?
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-violet-100 mb-10 max-w-2xl mx-auto">
            Join 500+ people who've transformed their self-understanding with AI-powered journaling. Start free today.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="xl"
              className="bg-white text-violet-600 hover:bg-gray-100 gap-2 shadow-xl shadow-black/20"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="xl"
              className="border-white/30 text-white hover:bg-white/10 gap-2"
            >
              Schedule Demo
            </Button>
          </div>

          {/* Trust Signals */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-violet-200 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              No credit card required
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Cancel anytime
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Privacy-first
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
