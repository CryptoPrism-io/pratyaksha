import { useLocation } from "react-router-dom"
import { Header } from "./Header"
import { ScatteredWordsBackground } from "../ui/ScatteredWordsBackground"

interface AppLayoutProps {
  children: React.ReactNode
}

// Routes that use their own layout (no main Header)
// "/" = marketing home with animated scroll, has its own StepNavbar
const standaloneRoutes = ['/', '/blog', '/research']

// Global background component - teal, rose & amber ambient glow
function GlobalBackground() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-background to-rose-400/5" />

      {/* Teal glow - top left */}
      <div
        className="absolute top-0 left-0 w-[600px] h-[600px] bg-teal-400 rounded-full blur-[180px] opacity-[0.12] animate-glow-teal"
        style={{ transform: 'translate(-30%, -30%)' }}
      />

      {/* Rose glow - bottom right */}
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-rose-400 rounded-full blur-[180px] opacity-[0.10] animate-glow-rose"
        style={{ transform: 'translate(30%, 30%)' }}
      />

      {/* Amber glow - top right */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-400 rounded-full blur-[180px] opacity-[0.08]"
        style={{ transform: 'translate(20%, -40%)' }}
      />

      {/* Amber glow - bottom left */}
      <div
        className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500 rounded-full blur-[150px] opacity-[0.06]"
        style={{ transform: 'translate(-30%, 40%)' }}
      />

      {/* Subtle center glow - now includes amber */}
      <div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-to-br from-teal-400/20 via-amber-400/15 to-rose-400/20 rounded-full blur-[200px] opacity-[0.08]"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  )
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()

  // Check if current route is a standalone route (uses its own layout)
  // Special handling: "/" is exact match, others can be prefix match
  const isStandaloneRoute = standaloneRoutes.some(route => {
    if (route === '/') {
      return location.pathname === '/'
    }
    return location.pathname === route || location.pathname.startsWith(route + '/')
  })

  if (isStandaloneRoute) {
    // Blog/Research pages have their own header via BlogLayout
    return (
      <>
        <GlobalBackground />
        {children}
      </>
    )
  }

  // Regular app pages with main Header
  return (
    <>
      <GlobalBackground />
      <ScatteredWordsBackground wordCount={120} />
      <div className="min-h-screen bg-background/80 text-foreground backdrop-blur-[1px]">
        <Header />
        <main>{children}</main>
      </div>
    </>
  )
}
