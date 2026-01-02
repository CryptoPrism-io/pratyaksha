import { Link, useLocation } from "react-router-dom"
import { Brain, LayoutDashboard, Home, PlusCircle } from "lucide-react"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "../theme-toggle"

export function Header() {
  const location = useLocation()
  const isHome = location.pathname === "/"
  const isDashboard = location.pathname === "/dashboard"
  const isLogs = location.pathname === "/logs"

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
          </Link>
          <div className="ml-2 border-l pl-2 md:ml-4 md:pl-4">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}
