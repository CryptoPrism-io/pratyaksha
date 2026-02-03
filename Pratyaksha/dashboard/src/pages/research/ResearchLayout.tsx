import { Link, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { BlogHeader, BlogFooter } from '../../components/blog'
import { BackgroundOrbs } from '../../components/landing/BackgroundOrbs'
import { cn } from '../../lib/utils'
import {
  Beaker,
  Bot,
  Brain,
  FlaskConical,
  ChevronRight
} from 'lucide-react'

interface ResearchLayoutProps {
  children: ReactNode
}

const navItems = [
  {
    title: 'Overview',
    href: '/research',
    icon: Beaker,
    description: 'Foundation & key findings'
  },
  {
    title: 'Science & Evidence',
    href: '/research/science',
    icon: FlaskConical,
    description: 'Data visualizations'
  },
  {
    title: 'Agent Pipeline',
    href: '/research/agents',
    icon: Bot,
    description: '8-agent AI system'
  },
  {
    title: 'CBT Methodology',
    href: '/research/methodology',
    icon: Brain,
    description: 'Cognitive techniques'
  },
]

export function ResearchLayout({ children }: ResearchLayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      {/* Background orbs for consistent styling with homepage */}
      <BackgroundOrbs intensity="normal" />

      <BlogHeader />

      <div className="flex-1 flex relative z-10">
        {/* Sidebar Navigation - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-border/50 bg-background/80 backdrop-blur-xl fixed top-16 left-0 h-[calc(100vh-4rem)] overflow-y-auto z-30">
          <nav className="flex flex-col gap-1 p-4">
            <div className="px-3 py-2 mb-2">
              <h2 className="font-space font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Research Hub
              </h2>
            </div>

            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                    isActive
                      ? "bg-teal-500/10 text-teal-600 dark:text-teal-400"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn(
                    "w-5 h-5 flex-shrink-0",
                    isActive ? "text-teal-500" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <ChevronRight className="w-4 h-4 text-teal-500" />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Bottom CTA */}
          <div className="mt-auto p-4 border-t">
            <Link
              to="/logs"
              className="block w-full text-center px-4 py-2.5 rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-medium hover:scale-[1.02] hover:shadow-lg hover:shadow-teal-500/25 transition-all"
            >
              Start Journaling
            </Link>
          </div>
        </aside>

        {/* Mobile Navigation - Tab bar at top */}
        <div className="lg:hidden sticky top-16 z-40 w-full border-b bg-background/95 backdrop-blur">
          <div className="flex overflow-x-auto scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                    isActive
                      ? "border-teal-500 text-teal-600 dark:text-teal-400"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.title}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 min-w-0 lg:ml-64">
          {children}
        </main>
      </div>

      <BlogFooter />
    </div>
  )
}
