import { User, Settings, Bell, Shield, Download, Trash2, LogIn, LogOut } from "lucide-react"
import { useEntries } from "../hooks/useEntries"
import { useStreak } from "../hooks/useStreak"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { NotificationSettings } from "@/components/notifications/NotificationSettings"

export function Profile() {
  const { data: entries = [] } = useEntries()
  const { streak, entryDates } = useStreak(entries)
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

  // Calculate stats
  const totalEntries = entries.length
  const totalDaysJournaled = entryDates.size
  const avgEntriesPerDay = totalDaysJournaled > 0
    ? (totalEntries / totalDaysJournaled).toFixed(1)
    : "0"

  return (
    <div className="min-h-screen dashboard-glass-bg">

      <div className="container mx-auto px-4 py-8 md:px-8 max-w-4xl">
        {/* Account Section */}
        <div className="rounded-xl glass-card p-6 mb-6">
          {loading ? (
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ) : user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="h-16 w-16 rounded-full border-2 border-primary/20"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold">{user.displayName || "User"}</h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Your Profile</h1>
                  <p className="text-muted-foreground">
                    {isConfigured
                      ? "Sign in to sync your data across devices"
                      : "Running in demo mode (Firebase not configured)"}
                  </p>
                </div>
              </div>
              {isConfigured && (
                <button
                  onClick={handleSignIn}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In with Google
                </button>
              )}
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
          <div className="rounded-xl glass-card p-4 text-center">
            <p className="text-2xl font-bold">{totalEntries}</p>
            <p className="text-xs text-muted-foreground">Total Entries</p>
          </div>
          <div className="rounded-xl glass-card p-4 text-center">
            <p className="text-2xl font-bold">{totalDaysJournaled}</p>
            <p className="text-xs text-muted-foreground">Days Journaled</p>
          </div>
          <div className="rounded-xl glass-card p-4 text-center">
            <p className="text-2xl font-bold">{streak}</p>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          <div className="rounded-xl glass-card p-4 text-center">
            <p className="text-2xl font-bold">{avgEntriesPerDay}</p>
            <p className="text-xs text-muted-foreground">Avg/Day</p>
          </div>
        </div>

        {/* Settings Sections */}
        <div className="space-y-4">
          {/* Preferences */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Preferences</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Default date filter</span>
                <span className="text-sm text-muted-foreground">Last 30 days</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm">Theme</span>
                <span className="text-sm text-muted-foreground">System</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2">
                More settings coming soon
              </p>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Notifications</h2>
            </div>
            <NotificationSettings />
          </div>

          {/* Privacy */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Privacy & Security</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Your data is stored securely in Airtable. End-to-end encryption coming soon.
            </p>
          </div>

          {/* Data Management */}
          <div className="rounded-xl glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Data Management</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors">
                <Download className="h-4 w-4" />
                Export Data
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg border text-sm hover:bg-muted transition-colors text-destructive">
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
