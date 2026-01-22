import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Check, Sparkles } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started with cognitive journaling.',
    features: [
      'Up to 30 entries/month',
      'Basic AI analysis',
      '5 core visualizations',
      'Emotional timeline',
      'Theme extraction',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Full power for serious self-explorers.',
    features: [
      'Unlimited entries',
      'Advanced 4-agent AI pipeline',
      'All 21 visualizations',
      'Contradiction tracker',
      'Energy shape analysis',
      'Loop detection',
      'Export to PDF/CSV',
      'Priority support',
    ],
    cta: 'Start Pro Trial',
    popular: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32 bg-white dark:bg-gray-950">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-sm font-medium mb-6">
              Pricing
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl p-6 md:p-8 ${
                plan.popular
                  ? 'bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-2xl shadow-violet-500/25 scale-105'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Plan Name */}
              <h3 className={`text-xl font-semibold mb-2 ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                <span className={`text-4xl md:text-5xl font-bold ${plan.popular ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ${plan.popular ? 'text-violet-200' : 'text-gray-500 dark:text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Description */}
              <p className={`mb-6 ${plan.popular ? 'text-violet-100' : 'text-gray-600 dark:text-gray-400'}`}>
                {plan.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-violet-200' : 'text-violet-500'}`} />
                    <span className={`text-sm ${plan.popular ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                className={`w-full ${
                  plan.popular
                    ? 'bg-white text-violet-600 hover:bg-gray-100'
                    : ''
                }`}
                variant={plan.popular ? 'secondary' : 'default'}
                size="lg"
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </div>

        {/* Money Back Guarantee */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center text-sm text-gray-500 dark:text-gray-400"
        >
          14-day money-back guarantee. No questions asked.
        </motion.p>
      </div>
    </section>
  )
}
