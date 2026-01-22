import { motion } from 'framer-motion'
import { BarChart3, PieChart, Activity, GitBranch, Flame, Target, TrendingUp, Layers } from 'lucide-react'

const visualizations = [
  {
    icon: Activity,
    title: 'Emotional Timeline',
    description: 'Track mood fluctuations over time',
    color: 'bg-violet-500',
  },
  {
    icon: Target,
    title: 'Energy Radar',
    description: 'Multi-dimensional energy view',
    color: 'bg-blue-500',
  },
  {
    icon: Flame,
    title: 'Journaling Heatmap',
    description: 'GitHub-style consistency tracker',
    color: 'bg-emerald-500',
  },
  {
    icon: GitBranch,
    title: 'Sankey Flow',
    description: 'Emotional transition patterns',
    color: 'bg-pink-500',
  },
  {
    icon: PieChart,
    title: 'Mode Distribution',
    description: 'Balance of mental states',
    color: 'bg-amber-500',
  },
  {
    icon: BarChart3,
    title: 'Theme Frequency',
    description: 'What occupies your mind',
    color: 'bg-cyan-500',
  },
  {
    icon: Layers,
    title: 'Contradiction Tracker',
    description: 'Internal conflict patterns',
    color: 'bg-rose-500',
  },
  {
    icon: TrendingUp,
    title: 'Growth Metrics',
    description: 'Progress over time',
    color: 'bg-indigo-500',
  },
]

export function Visualizations() {
  return (
    <section id="visualizations" className="py-20 md:py-32 bg-white dark:bg-gray-950">
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
              21 Visualizations
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Your mind, beautifully visualized
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              From GitHub-style heatmaps to Sankey flows, see patterns that words alone can't reveal.
            </p>
          </motion.div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {visualizations.map((viz, index) => (
            <motion.div
              key={viz.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`group relative overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl transition-all duration-300 ${
                index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''
              }`}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 ${viz.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${viz.color} flex items-center justify-center mb-4`}>
                <viz.icon className="w-5 h-5 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {viz.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {viz.description}
              </p>

              {/* Expanded content for larger cards */}
              {(index === 0 || index === 5) && (
                <div className="mt-6 h-32 md:h-48 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-24">
                    {[40, 60, 30, 80, 50, 70, 45, 90, 55, 75].map((h, i) => (
                      <div
                        key={i}
                        className={`w-4 md:w-6 ${viz.color} rounded-t opacity-70`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* See More */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          + 13 more visualizations including contradiction tracker, loop detector, and energy shape analysis
        </motion.div>
      </div>
    </section>
  )
}
