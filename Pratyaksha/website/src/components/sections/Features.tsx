import { motion } from 'framer-motion'
import {
  Brain,
  Heart,
  Tags,
  Lightbulb,
  Shield,
  Zap,
  BarChart3,
  Sparkles
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'Intent Classification',
    description: 'AI understands whether you\'re reflecting, venting, planning, or problem-solving.',
    color: 'violet',
  },
  {
    icon: Heart,
    title: 'Emotion Analysis',
    description: 'Track mood patterns, energy levels, and emotional transitions over time.',
    color: 'pink',
  },
  {
    icon: Tags,
    title: 'Theme Extraction',
    description: 'Automatically identify recurring topics, concerns, and focus areas.',
    color: 'blue',
  },
  {
    icon: Lightbulb,
    title: 'Actionable Insights',
    description: 'Get personalized recommendations based on your journal patterns.',
    color: 'amber',
  },
  {
    icon: BarChart3,
    title: '21 Visualizations',
    description: 'From heatmaps to Sankey flows, see your mind in ways you\'ve never imagined.',
    color: 'emerald',
  },
  {
    icon: Shield,
    title: 'Privacy-First',
    description: 'Your thoughts stay yours. End-to-end encryption, no data selling.',
    color: 'slate',
  },
]

const colorClasses = {
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  slate: 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400',
}

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything you need to understand yourself
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Our 4-agent AI pipeline processes every entry in real-time, extracting insights
              that traditional journaling apps miss.
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-6 md:p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-800 transition-all duration-300 hover:shadow-lg"
            >
              <div className={`w-12 h-12 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-5`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 text-violet-600 dark:text-violet-400 font-medium hover:gap-3 transition-all cursor-pointer">
            <Zap className="w-5 h-5" />
            See all 15 entry types and 12 energy shapes
          </div>
        </motion.div>
      </div>
    </section>
  )
}
