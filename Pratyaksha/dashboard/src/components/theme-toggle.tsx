import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleToggle = () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(newTheme)
  }

  if (!mounted) {
    return (
      <button
        className="rounded-full p-2.5 hover:bg-white/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center pointer-events-auto"
        aria-label="Toggle theme"
      >
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="rounded-full p-2.5 hover:bg-white/20 dark:hover:bg-black/20 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center pointer-events-auto cursor-pointer"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700" />
      )}
    </button>
  )
}
