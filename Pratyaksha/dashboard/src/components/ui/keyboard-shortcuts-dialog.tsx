import { X, Keyboard } from "lucide-react"
import { Button } from "./button"

interface KeyboardShortcutsDialogProps {
  isOpen: boolean
  onClose: () => void
}

// Expanded keyboard shortcuts (#10 Quick Win)
const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["G", "D"], description: "Go to Dashboard" },
      { keys: ["G", "L"], description: "Go to Logs" },
      { keys: ["G", "I"], description: "Go to Insights" },
      { keys: ["G", "P"], description: "Go to Profile" },
      { keys: ["J"], description: "Select next entry" },
      { keys: ["K"], description: "Select previous entry" },
      { keys: ["Enter"], description: "View selected entry" },
    ]
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: ["N"], description: "New entry" },
      { keys: ["Ctrl", "E"], description: "Export data (CSV)" },
      { keys: ["Ctrl", "Shift", "E"], description: "Export data (JSON)" },
      { keys: ["R"], description: "Refresh data" },
      { keys: ["B"], description: "Toggle bookmark on entry" },
    ]
  },
  {
    title: "Filters & Search",
    shortcuts: [
      { keys: ["/"], description: "Focus search input" },
      { keys: ["Ctrl", "K"], description: "Open command palette" },
      { keys: ["F"], description: "Open filter panel" },
      { keys: ["C"], description: "Clear all filters" },
    ]
  },
  {
    title: "Interface",
    shortcuts: [
      { keys: ["T"], description: "Toggle dark/light mode" },
      { keys: ["Shift", "?"], description: "Show keyboard shortcuts" },
      { keys: ["Esc"], description: "Close dialogs / Clear focus" },
    ]
  },
]

// Flat list for backwards compatibility
const _shortcuts = shortcutGroups.flatMap(g => g.shortcuts)
void _shortcuts // Keep for potential future use

function KeyboardKey({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[24px] items-center justify-center rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground shadow-sm">
      {children}
    </kbd>
  )
}

export function KeyboardShortcutsDialog({ isOpen, onClose }: KeyboardShortcutsDialogProps) {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-primary" />
            <h2 id="shortcuts-title" className="text-lg font-semibold">
              Keyboard Shortcuts
            </h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
            aria-label="Close shortcuts dialog"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">
                {group.title}
              </h3>
              <div className="space-y-1">
                {group.shortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted/50"
                  >
                    <span className="text-sm text-foreground">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <KeyboardKey>{key}</KeyboardKey>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg bg-muted/50 p-3 text-center text-xs text-muted-foreground">
          Press <KeyboardKey>Esc</KeyboardKey> to close
        </div>
      </div>
    </div>
  )
}
