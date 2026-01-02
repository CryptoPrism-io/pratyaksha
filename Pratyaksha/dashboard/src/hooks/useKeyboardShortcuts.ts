import { useEffect, useCallback } from "react"

interface ShortcutHandler {
  key: string
  ctrl?: boolean
  shift?: boolean
  alt?: boolean
  handler: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: ShortcutHandler[]) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to blur input
        if (event.key === "Escape") {
          target.blur()
        }
        return
      }

      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey
        const altMatch = shortcut.alt ? event.altKey : !event.altKey

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          shortcut.handler()
          break
        }
      }
    },
    [shortcuts]
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])
}

// Predefined shortcuts for the dashboard
export const DASHBOARD_SHORTCUTS = {
  SEARCH: { key: "/", description: "Focus search" },
  TOGGLE_THEME: { key: "t", description: "Toggle dark mode" },
  SHOW_SHORTCUTS: { key: "?", shift: true, description: "Show keyboard shortcuts" },
  ESCAPE: { key: "Escape", description: "Close dialogs / Clear focus" },
  NEXT_ENTRY: { key: "j", description: "Next entry" },
  PREV_ENTRY: { key: "k", description: "Previous entry" },
  VIEW_ENTRY: { key: "Enter", description: "View selected entry" },
  EXPORT: { key: "e", ctrl: true, description: "Export data" },
  REFRESH: { key: "r", description: "Refresh data" },
}
