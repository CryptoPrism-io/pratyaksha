import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  /** If true, allows unauthenticated users (shows demo data) */
  allowDemo?: boolean
}

/**
 * Wrapper component for routes that require authentication.
 *
 * By default, redirects unauthenticated users to /login.
 * If allowDemo is true, allows access but shows demo data.
 */
export function ProtectedRoute({ children, allowDemo = false }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If Firebase is not configured, allow access (demo mode)
  if (!isConfigured) {
    return <>{children}</>
  }

  // If demo access is allowed, show content regardless of auth state
  if (allowDemo) {
    return <>{children}</>
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}

/**
 * Wrapper for routes that should only be accessible to unauthenticated users.
 * Redirects authenticated users to dashboard.
 */
export function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isConfigured } = useAuth()

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // If Firebase is not configured, show the page (demo mode)
  if (!isConfigured) {
    return <>{children}</>
  }

  // If user is authenticated, redirect to logs (home)
  if (user) {
    return <Navigate to="/logs" replace />
  }

  // User is not authenticated, show the page
  return <>{children}</>
}
