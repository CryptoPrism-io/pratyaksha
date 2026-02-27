import { Lock, Sparkles, Check } from "lucide-react"
import { Link } from "react-router-dom"

interface PremiumGateProps {
  title: string
  description: string
  features: string[]
  icon?: React.ReactNode
}

export function PremiumGate({ title, description, features, icon }: PremiumGateProps) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12 bg-background">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Lock badge */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
              {icon ?? <Lock className="h-8 w-8 text-amber-500" />}
            </div>
            <div className="absolute -top-1 -right-1 p-1 rounded-full bg-amber-500">
              <Lock className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wide">
              Premium Feature
            </span>
          </div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        </div>

        {/* Feature list */}
        <div className="glass-card rounded-xl p-5 text-left space-y-3">
          {features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <Check className="h-3 w-3 text-emerald-500" />
              </div>
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="space-y-3">
          <a
            href="mailto:hello@becoming.app?subject=Premium Access Request"
            className="flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-amber-500/20"
          >
            <Sparkles className="h-4 w-4" />
            Get Early Access
          </a>
          <Link
            to="/logs"
            className="flex items-center justify-center w-full h-10 rounded-xl border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            Back to Logs
          </Link>
        </div>
      </div>
    </div>
  )
}
