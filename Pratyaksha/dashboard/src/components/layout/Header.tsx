import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Brain, LayoutDashboard, Home, PlusCircle, HelpCircle, MoreVertical } from "lucide-react"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "../theme-toggle"
import { Badge } from "../ui/badge"
import { resetOnboardingTour } from "../onboarding/OnboardingTour"
import { useEntriesRaw } from "../../hooks/useEntries"
import { toast } from "sonner"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const { data: entries } = useEntriesRaw()
  const entryCount = entries?.length ?? 0

  const isHome = location.pathname === "/"
  const isDashboard = location.pathname === "/dashboard"
  const isLogs = location.pathname === "/logs"

  const handleRestartTour = () => {
    resetOnboardingTour()
    setShowMenu(false)
    toast.success("Tour reset! Navigating to dashboard...")
    // Navigate to dashboard and refresh to trigger tour
    navigate("/dashboard")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Brain className="h-8 w-8 text-primary" />
          <span className="text-xl font-semibold tracking-tight">Pratyaksha</span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-4 md:gap-6">
          <Link
            to="/"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isHome ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isDashboard ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            to="/logs"
            className={cn(
              "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
              isLogs ? "text-primary" : "text-muted-foreground"
            )}
          >
            <PlusCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
            {entryCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {entryCount}
              </Badge>
            )}
          </Link>
          <div className="ml-2 border-l pl-2 md:ml-4 md:pl-4 flex items-center gap-2">
            <ThemeToggle />

            {/* Menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] rounded-lg border bg-card shadow-lg py-1">
                    <button
                      onClick={handleRestartTour}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Restart Tour
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  )
}
