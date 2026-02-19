import { Link, useLocation } from "react-router-dom"
import { Lock } from "lucide-react"
import { cn } from "../../lib/utils"

const TABS = [
  { label: "Dashboard", path: "/dashboard", premium: false },
  { label: "Insights", path: "/insights", premium: true },
  { label: "Compare", path: "/compare", premium: true },
]

export function AnalyticsTabBar() {
  const { pathname } = useLocation()

  return (
    <div className="border-b border-border/60 bg-background/50 backdrop-blur-sm sticky top-16 z-10">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <Link
              key={tab.path}
              to={tab.path}
              className={cn(
                "flex items-center gap-1.5 px-6 py-3.5 text-sm font-medium border-b-2 transition-colors",
                pathname === tab.path
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {tab.premium && (
                <Lock className="h-3 w-3 text-amber-500 flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
