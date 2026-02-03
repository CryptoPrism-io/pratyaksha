import { useLocation } from "react-router-dom"
import { Header } from "./Header"
import { BackgroundOrbs } from "../landing/BackgroundOrbs"

interface AppLayoutProps {
  children: React.ReactNode
}

// Routes that use their own layout (no main Header)
// "/" = marketing home with animated scroll, has its own StepNavbar
const standaloneRoutes = ['/', '/blog', '/research']

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
    // BackgroundOrbs is added in their respective layouts
    return <>{children}</>
  }

  // Regular app pages with main Header
  return (
    <>
      <BackgroundOrbs intensity="normal" />
      <div className="min-h-screen bg-background/80 text-foreground backdrop-blur-[1px] relative z-10">
        <Header />
        <main>{children}</main>
      </div>
    </>
  )
}
