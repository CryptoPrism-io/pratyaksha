import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'SC',
    content: 'Pratyaksha showed me patterns in my thinking I had no idea existed. The contradiction tracker helped me understand why I felt stuck.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Software Engineer',
    avatar: 'MJ',
    content: 'Finally, a journaling app that does more than just store text. The AI insights are genuinely useful, not just gimmicky.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Therapist',
    avatar: 'ER',
    content: 'I recommend this to clients as a complement to therapy. The emotional timeline helps them see their progress between sessions.',
    rating: 5,
  },
  {
    name: 'David Park',
    role: 'Entrepreneur',
    avatar: 'DP',
    content: 'The energy shape analysis is brilliant. Now I know which days I\'m most productive and plan my week accordingly.',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section className="py-20 md:py-32 bg-gray-50 dark:bg-gray-900">
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
              Testimonials
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by mindful journalers
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Join hundreds of people who've transformed their self-understanding.
            </p>
          </motion.div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-violet-100 dark:text-violet-900/50" />

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
