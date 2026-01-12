import { useState } from "react"
import {
  Eye, Calendar, Tag, Zap, Star, Pencil, Trash2, Sparkles, ChevronDown,
  Battery, BatteryLow, BatteryMedium, BatteryFull, BatteryWarning,
  // Entry Type Icons (#7 Quick Win)
  Heart, Brain, Users, Briefcase, HeartHandshake, Activity, Palette,
  MessageCircle, BookOpen, GitBranch, EyeOff, AlertCircle, TrendingUp,
  MessagesSquare, Clock, type LucideIcon
} from "lucide-react"
import { cn } from "../../lib/utils"
import type { Entry } from "../../lib/airtable"

const SENTIMENT_BADGE = {
  positive: "bg-positive/20 text-positive border-positive/30",
  negative: "bg-negative/20 text-negative border-negative/30",
  neutral: "bg-neutral/20 text-neutral border-neutral/30",
  mixed: "bg-secondary/20 text-secondary border-secondary/30",
}

// Energy level color coding (#3 Quick Win)
const ENERGY_BADGE = {
  "Very Low": { color: "bg-red-500/20 text-red-600 border-red-500/30", icon: BatteryWarning },
  "Low": { color: "bg-orange-500/20 text-orange-600 border-orange-500/30", icon: BatteryLow },
  "Moderate": { color: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30", icon: BatteryMedium },
  "Balanced": { color: "bg-green-500/20 text-green-600 border-green-500/30", icon: Battery },
  "High": { color: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30", icon: BatteryFull },
  "Elevated": { color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: BatteryFull },
  "Scattered": { color: "bg-purple-500/20 text-purple-600 border-purple-500/30", icon: BatteryWarning },
  "Drained": { color: "bg-gray-500/20 text-gray-600 border-gray-500/30", icon: BatteryLow },
  "Flat": { color: "bg-slate-500/20 text-slate-600 border-slate-500/30", icon: Battery },
  "Restorative": { color: "bg-teal-500/20 text-teal-600 border-teal-500/30", icon: BatteryMedium },
} as const

// Entry Type Icons (#7 Quick Win)
const ENTRY_TYPE_ICONS: Record<string, { icon: LucideIcon; color: string }> = {
  Emotional: { icon: Heart, color: "text-pink-500" },
  Cognitive: { icon: Brain, color: "text-purple-500" },
  Family: { icon: Users, color: "text-amber-500" },
  Work: { icon: Briefcase, color: "text-blue-500" },
  Relationship: { icon: HeartHandshake, color: "text-rose-500" },
  Health: { icon: Activity, color: "text-green-500" },
  Creativity: { icon: Palette, color: "text-orange-500" },
  Social: { icon: MessageCircle, color: "text-cyan-500" },
  Reflection: { icon: BookOpen, color: "text-indigo-500" },
  Decision: { icon: GitBranch, color: "text-yellow-500" },
  Avoidance: { icon: EyeOff, color: "text-gray-500" },
  Growth: { icon: TrendingUp, color: "text-emerald-500" },
  Stress: { icon: AlertCircle, color: "text-red-500" },
  Communication: { icon: MessagesSquare, color: "text-teal-500" },
  Routine: { icon: Clock, color: "text-slate-500" },
}

function getEntryTypeIcon(type: string) {
  return ENTRY_TYPE_ICONS[type] || { icon: Tag, color: "text-muted-foreground" }
}

function getEnergyBadge(energy: string) {
  return ENERGY_BADGE[energy as keyof typeof ENERGY_BADGE] || {
    color: "bg-muted text-muted-foreground border-muted",
    icon: Battery
  }
}

function getSentimentType(sentiment: string): keyof typeof SENTIMENT_BADGE {
  const lower = sentiment?.toLowerCase() || ""
  if (lower.includes("positive")) return "positive"
  if (lower.includes("negative")) return "negative"
  if (lower.includes("mixed")) return "mixed"
  return "neutral"
}

interface EntryCardProps {
  entry: Entry
  onView: (entry: Entry) => void
  onEdit?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onToggleBookmark?: (entry: Entry) => void
}

export function EntryCard({ entry, onView, onEdit, onDelete, onToggleBookmark }: EntryCardProps) {
  const sentimentType = getSentimentType(entry.sentimentAI)
  const [isExpanded, setIsExpanded] = useState(false)
  const hasAISummary = entry.snapshot || entry.summaryAI

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bookmark button */}
          {onToggleBookmark && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleBookmark(entry)
              }}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label={entry.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-colors",
                  entry.isBookmarked
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground hover:text-yellow-400"
                )}
              />
            </button>
          )}
          <span
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_BADGE[sentimentType]}`}
          >
            {entry.sentimentAI?.split(" ")[0] || "—"}
          </span>
        </div>
      </div>

      {/* Preview Text */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-foreground">
        {entry.text || "No content"}
      </p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-2">
        {/* Entry Type with Icon (#7 Quick Win) */}
        {entry.type && (() => {
          const typeConfig = getEntryTypeIcon(entry.type)
          const TypeIcon = typeConfig.icon
          return (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              <TypeIcon className={cn("h-3 w-3", typeConfig.color)} />
              {entry.type}
            </span>
          )
        })()}
        {entry.inferredMode && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            {entry.inferredMode}
          </span>
        )}
        {/* Energy Level Badge (#3 Quick Win) */}
        {entry.inferredEnergy && (() => {
          const energyBadge = getEnergyBadge(entry.inferredEnergy)
          const EnergyIcon = energyBadge.icon
          return (
            <span className={cn("flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", energyBadge.color)}>
              <EnergyIcon className="h-3 w-3" />
              {entry.inferredEnergy}
            </span>
          )
        })()}
        {/* AI Analyzed Badge (#9 Quick Win) */}
        {(entry.summaryAI || entry.actionableInsightsAI) && (
          <span className="flex items-center gap-1 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-600 border border-violet-500/30">
            <Sparkles className="h-3 w-3" />
            AI Analyzed
          </span>
        )}
      </div>

      {/* Theme Tags (#5 Quick Win) */}
      {entry.themeTagsAI && entry.themeTagsAI.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {entry.themeTagsAI.slice(0, 4).map((tag, index) => (
            <span
              key={index}
              className="rounded-full bg-secondary/50 px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
            >
              #{tag.trim()}
            </span>
          ))}
          {entry.themeTagsAI.length > 4 && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              +{entry.themeTagsAI.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* AI Summary Section (#15 Quick Win) */}
      {hasAISummary && (
        <div className="mb-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="flex items-center gap-1.5 text-xs text-violet-600 hover:text-violet-700 font-medium w-full"
          >
            <Sparkles className="h-3 w-3" />
            <span>AI Snapshot</span>
            <ChevronDown className={cn("h-3 w-3 ml-auto transition-transform", isExpanded && "rotate-180")} />
          </button>
          {isExpanded && (
            <div className="mt-2 space-y-2 rounded-lg bg-violet-50 dark:bg-violet-950/30 p-3 text-xs">
              {entry.snapshot && (
                <div>
                  <span className="font-medium text-violet-700 dark:text-violet-400">Snapshot: </span>
                  <span className="text-foreground">{entry.snapshot}</span>
                </div>
              )}
              {entry.summaryAI && (
                <div>
                  <span className="font-medium text-violet-700 dark:text-violet-400">Summary: </span>
                  <span className="text-muted-foreground">{entry.summaryAI}</span>
                </div>
              )}
              {entry.actionableInsightsAI && (
                <div>
                  <span className="font-medium text-violet-700 dark:text-violet-400">Insight: </span>
                  <span className="text-muted-foreground">{entry.actionableInsightsAI}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(entry)}
          aria-label={`View entry from ${new Date(entry.date).toLocaleDateString()}`}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-muted py-2.5 text-sm font-medium transition-colors hover:bg-muted/80 min-h-[44px]"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(entry)
            }}
            aria-label="Edit entry"
            className="flex items-center justify-center rounded-lg bg-muted p-2.5 text-sm font-medium transition-colors hover:bg-muted/80 min-h-[44px] min-w-[44px]"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(entry)
            }}
            aria-label="Delete entry"
            className="flex items-center justify-center rounded-lg bg-destructive/10 p-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/20 min-h-[44px] min-w-[44px]"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

interface EntryCardsProps {
  entries: Entry[]
  onView: (entry: Entry) => void
  onEdit?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onToggleBookmark?: (entry: Entry) => void
}

export function EntryCards({ entries, onView, onEdit, onDelete, onToggleBookmark }: EntryCardsProps) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <p className="text-sm">No entries to display</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleBookmark={onToggleBookmark}
        />
      ))}
    </div>
  )
}
