import { useMemo, useState, useCallback } from "react"
import { useEntries } from "../../hooks/useEntries"
import { loadLifeBlueprint, hasContent } from "../../lib/lifeBlueprintStorage"
import {
  detectPatternWarnings,
  getSeverityColor,
  getWarningTypeLabel,
  type PatternWarning
} from "../../lib/patternWarnings"
import {
  loadStoredWarnings,
  saveStoredWarnings,
  dismissWarning,
  loadDismissedWarnings,
  getActiveWarnings
} from "../../lib/patternWarningStorage"
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Lightbulb
} from "lucide-react"
import { cn } from "../../lib/utils"
import { useNavigate } from "react-router-dom"

// Icon map for severity
const SEVERITY_ICONS = {
  alert: AlertTriangle,
  warning: AlertCircle,
  info: Info
}

interface PatternWarningBannerProps {
  className?: string
}

export function PatternWarningBanner({ className }: PatternWarningBannerProps) {
  const navigate = useNavigate()
  const { data: entries = [] } = useEntries()
  const [isExpanded, setIsExpanded] = useState(false)
  const [localDismissed, setLocalDismissed] = useState<Set<string>>(new Set())

  // Detect warnings based on entries and blueprint
  const warningsData = useMemo(() => {
    const blueprint = loadLifeBlueprint()

    // Don't show warnings if no blueprint data
    if (!hasContent(blueprint)) {
      return null
    }

    // Get existing warnings to avoid duplicates
    const storedData = loadStoredWarnings()
    const existingWarnings = storedData?.warnings || []
    const dismissedMap = loadDismissedWarnings()

    // Detect new warnings
    const result = detectPatternWarnings(entries, blueprint, existingWarnings)

    // Filter out dismissed warnings
    const activeWarnings = result.warnings.filter(w =>
      !dismissedMap.has(w.id) && !localDismissed.has(w.id)
    )

    // Save to storage for persistence
    if (result.warnings.length > 0) {
      saveStoredWarnings(result.warnings)
    }

    return {
      ...result,
      warnings: activeWarnings
    }
  }, [entries, localDismissed])

  // Handle dismissal
  const handleDismiss = useCallback((warningId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dismissWarning(warningId)
    setLocalDismissed(prev => new Set([...prev, warningId]))
  }, [])

  // Don't render if no warnings
  if (!warningsData || warningsData.warnings.length === 0) {
    return null
  }

  const { warnings, highestSeverity } = warningsData
  const primaryWarning = warnings[0]
  const hasMultiple = warnings.length > 1

  // Get styling based on highest severity
  const bannerStyle = getSeverityColor(highestSeverity === "none" ? "info" : highestSeverity as PatternWarning["severity"])
  const SeverityIcon = SEVERITY_ICONS[primaryWarning.severity]

  return (
    <div className={cn("rounded-xl border overflow-hidden", bannerStyle.bg, bannerStyle.border, className)}>
      {/* Main banner - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-start gap-3 text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        {/* Icon */}
        <div className={cn("p-2 rounded-lg bg-background/50 flex-shrink-0", bannerStyle.icon)}>
          <SeverityIcon className="h-5 w-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn("text-xs font-medium uppercase tracking-wide", bannerStyle.text)}>
              {getWarningTypeLabel(primaryWarning.type)}
            </span>
            {hasMultiple && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-background/50 text-muted-foreground">
                +{warnings.length - 1} more
              </span>
            )}
          </div>
          <h3 className="font-semibold mt-1">{primaryWarning.title}</h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {primaryWarning.description}
          </p>
        </div>

        {/* Expand/collapse indicator */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border/50">
          {/* All warnings list */}
          <div className="divide-y divide-border/30">
            {warnings.map((warning, index) => {
              const style = getSeverityColor(warning.severity)
              const Icon = SEVERITY_ICONS[warning.severity]

              return (
                <div
                  key={warning.id}
                  className={cn(
                    "p-4",
                    index > 0 && "bg-background/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn("p-1.5 rounded-lg", style.bg, style.icon)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm">{warning.title}</h4>
                        <button
                          onClick={(e) => handleDismiss(warning.id, e)}
                          className="p-1 rounded-md hover:bg-muted/50 transition-colors flex-shrink-0"
                          aria-label="Dismiss warning"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>

                      <p className="text-sm text-muted-foreground mt-1">
                        {warning.description}
                      </p>

                      {/* Related anti-vision */}
                      {warning.relatedAntiVision && (
                        <div className="mt-2 px-3 py-2 rounded-lg bg-muted/30 border border-muted">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Related to your anti-vision:</span>{" "}
                            "{warning.relatedAntiVision}"
                          </p>
                        </div>
                      )}

                      {/* Suggested action */}
                      <div className="mt-3 flex items-start gap-2">
                        <Lightbulb className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">
                          <span className="font-medium">Suggestion:</span>{" "}
                          {warning.suggestedAction}
                        </p>
                      </div>

                      {/* Entries involved */}
                      {warning.entriesInvolved.length > 0 && (
                        <button
                          onClick={() => {
                            // Navigate to logs with search for these entries
                            navigate("/logs")
                          }}
                          className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                        >
                          View {warning.entriesInvolved.length} related entries
                          <ExternalLink className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer actions */}
          <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Warnings based on your Life Blueprint
            </p>
            <button
              onClick={() => navigate("/profile")}
              className="text-xs font-medium text-primary hover:underline"
            >
              Update Blueprint
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
