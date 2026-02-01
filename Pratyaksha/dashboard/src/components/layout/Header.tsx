import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { LayoutDashboard, PlusCircle, GitCompareArrows, MessageSquare, User, MoreVertical, Download, BookOpen, FlaskConical } from "lucide-react"
import { MothLogo } from "../brand/MothLogo"
import { BrandWordmark } from "../brand/BrandWordmark"
import { cn } from "../../lib/utils"
import { ThemeToggle } from "../theme-toggle"
import { resetOnboardingTour } from "../onboarding/OnboardingTour"
import { toast } from "sonner"
import { usePWAInstall } from "@/hooks/usePWAInstall"
import { UserMenu } from "../auth/UserMenu"
import { useAuth } from "../../contexts/AuthContext"
import { KarmaDisplay } from "../gamification/KarmaDisplay"

export function Header() {
  const location = useLocation()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  const { isInstallable, isInstalled, install, setShowPrompt } = usePWAInstall()
  const { user } = useAuth()

  const isDashboard = location.pathname === "/dashboard"
  const isLogs = location.pathname === "/logs"
  const isCompare = location.pathname === "/compare"
  const isChat = location.pathname === "/chat"

  const handleInstallClick = async () => {
    setShowMenu(false)
    if (isInstallable) {
      const success = await install()
      if (success) {
        toast.success("App installed successfully!")
      }
    } else {
      // Show the custom prompt for iOS or when beforeinstallprompt hasn't fired
      setShowPrompt(true)
    }
  }

  const handleRestartTourLogs = () => {
    resetOnboardingTour()
    setShowMenu(false)
    toast.success("Tour reset! Starting from Logs page...")
    navigate("/logs")
    setTimeout(() => window.location.reload(), 100)
  }

  const handleRestartTourDashboard = () => {
    resetOnboardingTour()
    // Set phase to dashboard so it starts there
    localStorage.setItem("pratyaksha-tour-phase", "dashboard")
    setShowMenu(false)
    toast.success("Tour reset! Starting from Dashboard...")
    navigate("/dashboard")
    setTimeout(() => window.location.reload(), 100)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4 md:px-8">
        {/* Logo - Links to landing page */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3 flex-shrink-0 group">
          <MothLogo size="md" animated />
          <BrandWordmark size="md" variant="default" animated />
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-1 sm:gap-4 md:gap-6">
          <Link
            to="/logs"
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary min-w-[44px] min-h-[44px] sm:min-w-0",
              isLogs ? "text-primary" : "text-muted-foreground"
            )}
          >
            <PlusCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Logs</span>
          </Link>
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary min-w-[44px] min-h-[44px] sm:min-w-0",
              isDashboard ? "text-primary" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>
          <Link
            to="/compare"
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary min-w-[44px] min-h-[44px] sm:min-w-0",
              isCompare ? "text-primary" : "text-muted-foreground"
            )}
          >
            <GitCompareArrows className="h-5 w-5" />
            <span className="hidden sm:inline">Compare</span>
          </Link>
          <Link
            to="/chat"
            className={cn(
              "flex items-center justify-center gap-2 text-sm font-medium transition-colors hover:text-primary min-w-[44px] min-h-[44px] sm:min-w-0",
              isChat ? "text-primary" : "text-muted-foreground"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="hidden sm:inline">Chat</span>
          </Link>
          <div className="ml-1 border-l pl-1 sm:ml-2 sm:pl-2 md:ml-4 md:pl-4 flex items-center gap-1 sm:gap-2">
            <KarmaDisplay compact />
            <ThemeToggle />
            {user ? (
              <UserMenu compact />
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 h-10 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Menu dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-muted transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="h-5 w-5 text-muted-foreground" />
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-1 z-50 min-w-[180px] max-w-[calc(100vw-2rem)] rounded-lg border bg-card shadow-lg py-1">
                    {/* Install App Section - Always show for testing */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Install App
                    </div>
                    <button
                      onClick={handleInstallClick}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-primary"
                    >
                      <Download className="h-4 w-4" />
                      {isInstalled ? "Already Installed" : isInstallable ? "Install to Device" : "Add to Home Screen"}
                    </button>
                    <div className="my-1 border-t" />

                    {/* Restart Tour Section */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Restart Tour
                    </div>
                    <button
                      onClick={handleRestartTourLogs}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <PlusCircle className="h-4 w-4" />
                      From Logs Page
                    </button>
                    <button
                      onClick={handleRestartTourDashboard}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      From Dashboard
                    </button>
                    <div className="my-1 border-t" />

                    {/* Resources Section */}
                    <div className="px-3 py-1.5 text-xs font-medium text-muted-foreground">
                      Resources
                    </div>
                    <Link
                      to="/blog"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <BookOpen className="h-4 w-4" />
                      Blog
                    </Link>
                    <Link
                      to="/research"
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      <FlaskConical className="h-4 w-4" />
                      Research
                    </Link>
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
