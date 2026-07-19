import { useState } from "react"
import { History, Plus, Trash2, MessageSquare } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { cn } from "../../lib/utils"
import type { ChatThread } from "../../lib/chatStorage"
import { getModeMeta } from "../../config/chatModes"

interface ThreadHistoryProps {
  threads: ChatThread[]
  activeThreadId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onNew: () => void
}

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" })
}

export function ThreadHistory({
  threads,
  activeThreadId,
  onSelect,
  onDelete,
  onNew,
}: ThreadHistoryProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Conversation history"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-background/60 hover:bg-muted/60 transition-colors"
        >
          <History className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-medium hidden sm:inline">History</span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-1.5">
        <div className="flex items-center justify-between px-2.5 py-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Conversations
          </p>
          <button
            type="button"
            onClick={() => {
              onNew()
              setOpen(false)
            }}
            className="inline-flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>

        {threads.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">
            <MessageSquare className="h-5 w-5 mx-auto mb-2 opacity-40" />
            No saved conversations yet.
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto space-y-0.5">
            {threads.map((t) => {
              const meta = getModeMeta(t.modeId)
              const Icon = meta.icon
              const isActive = t.id === activeThreadId
              return (
                <div
                  key={t.id}
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors cursor-pointer",
                    isActive ? "bg-muted" : "hover:bg-muted/60"
                  )}
                  onClick={() => {
                    onSelect(t.id)
                    setOpen(false)
                  }}
                >
                  <span
                    className={cn(
                      "h-6 w-6 flex-shrink-0 rounded-md flex items-center justify-center bg-gradient-to-br text-white",
                      meta.gradient
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{t.title}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {meta.label} · {relativeTime(t.updatedAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Delete conversation"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDelete(t.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
