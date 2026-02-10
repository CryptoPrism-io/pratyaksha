import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LucideIcon } from 'lucide-react'

interface AgentCardProps {
  name: string
  icon: LucideIcon
  color: string
  tagline: string
  what: string
  why: string
  how: string
  inputExample: string
  outputExample: string
  order: number
}

export function AgentCard({
  name,
  icon: Icon,
  color,
  tagline,
  what,
  why,
  how,
  inputExample,
  outputExample,
  order,
}: AgentCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="glass-feature-card overflow-hidden">
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left p-6 flex items-start gap-4 hover:bg-white/5 transition-colors"
      >
        {/* Order badge */}
        <div className="flex flex-col items-center gap-2">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            color
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <span className="text-xs font-mono text-muted-foreground">#{order}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-space font-semibold text-lg mb-1">{name}</h3>
          <p className="text-sm text-muted-foreground">{tagline}</p>
        </div>

        {/* Expand toggle */}
        <div className="flex-shrink-0 mt-1">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-0 border-t border-border/50 animate-in slide-in-from-top-2 duration-200">
          <div className="grid gap-6 mt-6">
            {/* What/Why/How */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-teal-600 dark:text-teal-400">What</h4>
                <p className="text-sm text-muted-foreground">{what}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-rose-500">Why</h4>
                <p className="text-sm text-muted-foreground">{why}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-violet-500">How</h4>
                <p className="text-sm text-muted-foreground">{how}</p>
              </div>
            </div>

            {/* Sample Section */}
            <div className="rounded-xl border border-border/50 overflow-hidden">
              <div className="px-4 py-2 bg-muted/30 border-b border-border/50">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Sample</h4>
              </div>
              <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
                {/* Input */}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                    <span className="text-xs font-medium text-muted-foreground">Input</span>
                  </div>
                  <div className="text-sm text-foreground/80 leading-relaxed italic">
                    "{inputExample}"
                  </div>
                </div>
                {/* Output */}
                <div className="p-4 bg-teal-500/5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="text-xs font-medium text-teal-600 dark:text-teal-400">Output</span>
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed font-mono whitespace-pre-line">
                    {outputExample}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
