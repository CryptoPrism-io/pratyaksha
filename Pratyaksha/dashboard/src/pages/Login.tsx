import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { MothLogo } from "../components/brand/MothLogo"
import { BrandWordmark } from "../components/brand/BrandWordmark"
import { useAuth } from "../contexts/AuthContext"
import { getAuthErrorMessage } from "../lib/firebase"
import { toast } from "sonner"

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, isConfigured } = useAuth()

  const [isLoading, setIsLoading] = useState(false)

  // Get redirect path from location state or default to dashboard
  const from = (location.state as { from?: string })?.from || "/logs"

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      const user = await signIn()
      if (user) {
        toast.success(`Welcome, ${user.displayName || user.email}!`)
        navigate(from, { replace: true })
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 dashboard-glass-bg">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto mb-4"><MothLogo size="xl" animated /></div>
          <h1 className="text-2xl font-bold mb-2">Firebase Not Configured</h1>
          <p className="text-muted-foreground mb-6">
            Authentication is not available. The app is running in demo mode.
          </p>
          <Link
            to="/logs"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Continue to Demo
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 dashboard-glass-bg">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 justify-center">
            <MothLogo size="lg" animated />
            <BrandWordmark size="xl" variant="default" animated />
          </Link>
          <p className="mt-3 text-muted-foreground font-light tracking-wide">Sign in to your journal</p>
        </div>

        {/* Login Card */}
        <div className="glass-card rounded-xl p-6 sm:p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-foreground">Welcome</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in with your Google account to continue
            </p>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full h-12 rounded-lg border bg-background font-medium hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
          </button>

          <p className="mt-4 text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </div>

        {/* Demo Link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Just exploring?{" "}
          <Link to="/logs" className="text-primary hover:underline">
            Continue as demo user
          </Link>
        </p>
      </div>
    </div>
  )
}
