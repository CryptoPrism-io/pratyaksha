import { useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover"
import { cn } from "../../lib/utils"
import { CHAT_MODES, getModeMeta, type ChatModeId } from "../../config/chatModes"

interface ModePickerProps {
  value: ChatModeId
  onChange: (id: ChatModeId) => void
  disabled?: boolean
}

export function ModePicker({ value, onChange, disabled }: ModePickerProps) {
  const [open, setOpen] = useState(false)
  const active = getModeMeta(value)
  const ActiveIcon = active.icon

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label="Choose chat mode"
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-colors",
            "bg-background/60 hover:bg-muted/60 border-border",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <span
            className={cn(
              "h-5 w-5 rounded-md flex items-center justify-center bg-gradient-to-br text-white",
              active.gradient
            )}
          >
            <ActiveIcon className="h-3 w-3" />
          </span>
          <span className="text-xs font-medium">{active.label}</span>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-1.5">
        <p className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Conversation mode
        </p>
        <div className="space-y-0.5">
          {CHAT_MODES.map((m) => {
            const Icon = m.icon
            const selected = m.id === value
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  onChange(m.id)
                  setOpen(false)
                }}
                className={cn(
                  "w-full flex items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors",
                  selected ? "bg-muted" : "hover:bg-muted/60"
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 h-7 w-7 flex-shrink-0 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                    m.gradient
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-1.5">
                    <span className="text-sm font-medium">{m.label}</span>
                    <span className="text-[10px] text-muted-foreground">· {m.tagline}</span>
                    {selected && <Check className="h-3 w-3 text-violet-500 ml-auto" />}
                  </span>
                  <span className="block text-xs text-muted-foreground leading-snug mt-0.5">
                    {m.blurb}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
