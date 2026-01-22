import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Play, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950" />

      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-400/20 rounded-full blur-3xl animate-float" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-2">
              <Sparkles className="w-4 h-4 text-violet-500" />
              AI-Powered Cognitive Journaling
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6"
          >
            See Your Mind.{' '}
            <span className="gradient-text">Clearly.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-10"
          >
            Transform raw thoughts into actionable self-insight. Our 4-agent AI pipeline
            reveals patterns, contradictions, and insights you've never seen before.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button size="xl" className="gap-2 shadow-lg shadow-violet-500/25">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-white text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-gray-900 dark:text-white">500+</span> people already journaling smarter
            </p>
          </motion.div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-16 md:mt-24 relative"
        >
          <div className="relative mx-auto max-w-5xl">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 rounded-2xl blur-2xl opacity-20" />

            {/* Dashboard Preview Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="px-4 py-1 bg-white dark:bg-gray-700 rounded-md text-xs text-gray-500 dark:text-gray-400">
                    pratyaksha.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard Content Placeholder */}
              <div className="p-6 md:p-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-[300px] md:min-h-[400px]">
                <div className="grid grid-cols-3 gap-4">
                  {/* Stats Cards */}
                  {['Entries', 'Insights', 'Streaks'].map((label, i) => (
                    <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                        {[127, 48, 21][i]}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Chart Placeholder */}
                <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 h-48">
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Emotional Timeline</p>
                  <div className="flex items-end justify-between h-28 gap-2">
                    {[40, 65, 45, 80, 55, 70, 60, 75, 50, 85, 65, 90].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-violet-500 to-purple-400 rounded-t"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
