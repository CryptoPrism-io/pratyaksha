import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import { LogIn, LogOut, User as UserIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface UserMenuProps {
  compact?: boolean
}

export function UserMenu({ compact = false }: UserMenuProps) {
  const { user, loading, isConfigured, signIn, signOut } = useAuth()

  const handleSignIn = async () => {
    try {
      const result = await signIn()
      if (result) {
        toast.success(`Welcome, ${result.displayName || result.email}!`)
      }
    } catch {
      toast.error("Sign in failed. Please try again.")
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success("Signed out successfully")
    } catch {
      toast.error("Sign out failed. Please try again.")
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex h-11 w-11 items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Not configured - show demo mode indicator
  if (!isConfigured) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted/50">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        {!compact && (
          <span className="text-xs text-muted-foreground">Demo Mode</span>
        )}
      </div>
    )
  }

  // User is signed in
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="h-8 w-8 rounded-full border"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
              {(user.displayName || user.email || "U")[0].toUpperCase()}
            </div>
          )}
          {!compact && (
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-none">
                {user.displayName || user.email?.split("@")[0]}
              </p>
              <p className="text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          )}
        </Link>
        <button
          onClick={handleSignOut}
          className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors"
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    )
  }

  // User is not signed in
  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 h-10 px-3 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
    >
      <LogIn className="h-4 w-4" />
      {!compact && <span className="hidden sm:inline">Sign In</span>}
    </button>
  )
}
