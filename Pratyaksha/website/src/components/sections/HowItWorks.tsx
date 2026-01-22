import { motion } from 'framer-motion'
import { PenLine, Brain, Sparkles, LineChart, ArrowRight } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: PenLine,
    title: 'Write Freely',
    description: 'Journal your thoughts without structure. Morning pages, evening reflections, or anytime in between.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    icon: Brain,
    title: '4-Agent AI Pipeline',
    description: 'Intent, Emotion, Theme, and Insight agents analyze your entry in parallel within seconds.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    number: '03',
    icon: Sparkles,
    title: 'Instant Insights',
    description: 'See your mood, energy patterns, recurring themes, and contradictions immediately.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    number: '04',
    icon: LineChart,
    title: 'Track Over Time',
    description: 'Watch patterns emerge across days, weeks, and months with 21 powerful visualizations.',
    color: 'from-amber-500 to-orange-500',
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              From thought to insight in seconds
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No tagging, no categorizing, no manual tracking. Just write, and let AI do the rest.
            </p>
          </motion.div>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-violet-500 to-amber-500 opacity-20" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step Card */}
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 h-full">
                  {/* Number Badge */}
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg`}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>

                  {/* Step Number */}
                  <span className="absolute top-6 right-6 text-4xl font-bold text-gray-100 dark:text-gray-800">
                    {step.number}
                  </span>

                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Mobile/Tablet */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-gray-300 dark:text-gray-600 rotate-90 md:rotate-0" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pipeline Visual */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 md:mt-24 p-6 md:p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
            The 4-Agent AI Pipeline
          </h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
            {[
              { name: 'Intent Agent', desc: 'Type & Snapshot' },
              { name: 'Emotion Agent', desc: 'Mode & Energy' },
              { name: 'Theme Agent', desc: 'Tags & Loops' },
              { name: 'Insight Agent', desc: 'Summary & Actions' },
            ].map((agent, i) => (
              <div key={agent.name} className="flex items-center gap-4 md:gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {i + 1}
                  </div>
                  <p className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{agent.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{agent.desc}</p>
                </div>
                {i < 3 && (
                  <ArrowRight className="hidden md:block w-5 h-5 text-gray-300 dark:text-gray-600" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
