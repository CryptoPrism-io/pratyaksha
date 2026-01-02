import { Eye, Calendar, Tag, Zap } from "lucide-react"
import type { Entry } from "../../lib/airtable"

const SENTIMENT_BADGE = {
  positive: "bg-positive/20 text-positive border-positive/30",
  negative: "bg-negative/20 text-negative border-negative/30",
  neutral: "bg-neutral/20 text-neutral border-neutral/30",
  mixed: "bg-secondary/20 text-secondary border-secondary/30",
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
}

export function EntryCard({ entry, onView }: EntryCardProps) {
  const sentimentType = getSentimentType(entry.sentimentAI)

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
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${SENTIMENT_BADGE[sentimentType]}`}
        >
          {entry.sentimentAI?.split(" ")[0] || "—"}
        </span>
      </div>

      {/* Preview Text */}
      <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-foreground">
        {entry.text || "No content"}
      </p>

      {/* Tags */}
      <div className="mb-3 flex flex-wrap gap-2">
        {entry.type && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
            <Tag className="h-3 w-3" />
            {entry.type}
          </span>
        )}
        {entry.inferredMode && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            <Zap className="h-3 w-3" />
            {entry.inferredMode}
          </span>
        )}
      </div>

      {/* Action */}
      <button
        onClick={() => onView(entry)}
        aria-label={`View entry from ${new Date(entry.date).toLocaleDateString()}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-muted py-2.5 text-sm font-medium transition-colors hover:bg-muted/80 min-h-[44px]"
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>
    </div>
  )
}

interface EntryCardsProps {
  entries: Entry[]
  onView: (entry: Entry) => void
}

export function EntryCards({ entries, onView }: EntryCardsProps) {
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
        <EntryCard key={entry.id} entry={entry} onView={onView} />
      ))}
    </div>
  )
}
