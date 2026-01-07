import { Eye, Calendar, Tag, Zap, Star, Pencil, Trash2 } from "lucide-react"
import { cn } from "../../lib/utils"
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
  onEdit?: (entry: Entry) => void
  onDelete?: (entry: Entry) => void
  onToggleBookmark?: (entry: Entry) => void
}

export function EntryCard({ entry, onView, onEdit, onDelete, onToggleBookmark }: EntryCardProps) {
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
