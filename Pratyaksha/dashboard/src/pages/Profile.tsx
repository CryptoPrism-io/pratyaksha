import { useState } from "react"
import { User, Settings, Bell, Shield, Download, Trash2, LogIn, LogOut, Compass, RotateCcw, UserCircle, MapPin, Briefcase, Brain, Target } from "lucide-react"
import { useEntries } from "../hooks/useEntries"
import { useStreak } from "../hooks/useStreak"
import { useAuth } from "../contexts/AuthContext"
import { toast } from "sonner"
import { NotificationSettings } from "@/components/notifications/NotificationSettings"
import { FirstTimeOnboarding } from "@/components/onboarding/FirstTimeOnboarding"
import { KarmaDisplayExpanded } from "@/components/gamification/KarmaDisplay"
import { SoulMappingProgress } from "@/components/gamification/SoulMappingProgress"
import { LevelProgressCard } from "@/components/gamification/LevelProgressCard"
import { LifeBlueprintGuided } from "@/components/gamification/LifeBlueprintGuided"
import {
  hasCompletedFirstTimeOnboarding,
  loadOnboardingProfile,
  BADGES,
  type BadgeId
} from "@/lib/onboardingStorage"
import { DemoBanner } from "../components/layout/DemoBanner"

export function Profile() {
  const { data: entries = [] } = useEntries()
  const { streak, entryDates } = useStreak(entries)
  const { user, loading, isConfigured, signIn, signOut } = useAuth()
  const [showOnboarding, setShowOnboarding] = useState(false)

  const onboardingProfile = loadOnboardingProfile()
  const hasCompletedOnboarding = hasCompletedFirstTimeOnboarding()
  const earnedBadges = onboardingProfile.badges as BadgeId[]

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
      {/* Demo Mode Banner */}
      <DemoBanner compact />

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

        {/* Gamification Section */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {/* Karma Display */}
          <KarmaDisplayExpanded />

          {/* Level Progress */}
          <LevelProgressCard />
        </div>

        {/* Soul Mapping Progress */}
        <div className="rounded-xl glass-card p-6 mb-6">
          <SoulMappingProgress />
        </div>

        {/* Life Blueprint - Guided Reflection */}
        <LifeBlueprintGuided className="mb-6" />

        {/* Build Your Profile Section */}
        <div className="rounded-xl glass-card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <UserCircle className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Your Profile</h2>
            </div>
            {!hasCompletedOnboarding && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs hover:bg-primary/90 transition-colors"
              >
                <Compass className="h-3 w-3" />
                Build Your Profile
              </button>
            )}
            {hasCompletedOnboarding && (
              <button
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs hover:bg-muted transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Edit Profile
              </button>
            )}
          </div>

          {hasCompletedOnboarding ? (
            <div className="space-y-4">
              {/* Demographics Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {onboardingProfile.ageRange && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Age</p>
                    <p className="text-sm font-medium">{onboardingProfile.ageRange}</p>
                  </div>
                )}
                {onboardingProfile.sex && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Gender</p>
                    <p className="text-sm font-medium capitalize">{onboardingProfile.sex.replace("-", " ")}</p>
                  </div>
                )}
                {onboardingProfile.location && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Location</p>
                    </div>
                    <p className="text-sm font-medium">{onboardingProfile.location}</p>
                  </div>
                )}
                {onboardingProfile.profession && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center gap-1 mb-1">
                      <Briefcase className="h-2.5 w-2.5 text-muted-foreground" />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Profession</p>
                    </div>
                    <p className="text-sm font-medium">{onboardingProfile.profession}</p>
                  </div>
                )}
              </div>

              {/* Psychological Context */}
              {(onboardingProfile.stressLevel || onboardingProfile.emotionalOpenness || onboardingProfile.reflectionFrequency || onboardingProfile.lifeSatisfaction) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Psychological Profile</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {onboardingProfile.stressLevel && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Stress Level</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded-sm ${level <= (onboardingProfile.stressLevel || 0) ? "bg-orange-500" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {onboardingProfile.emotionalOpenness && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Emotional Openness</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded-sm ${level <= (onboardingProfile.emotionalOpenness || 0) ? "bg-blue-500" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {onboardingProfile.reflectionFrequency && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Reflection</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded-sm ${level <= (onboardingProfile.reflectionFrequency || 0) ? "bg-purple-500" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {onboardingProfile.lifeSatisfaction && (
                      <div className="rounded-lg bg-muted/50 p-3">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Life Satisfaction</p>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 w-4 rounded-sm ${level <= (onboardingProfile.lifeSatisfaction || 0) ? "bg-green-500" : "bg-muted"}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Personal Goal */}
              {onboardingProfile.personalGoal && (
                <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="h-3.5 w-3.5 text-primary" />
                    <p className="text-[10px] text-primary uppercase tracking-wide font-medium">Personal Goal</p>
                  </div>
                  <p className="text-sm">{onboardingProfile.personalGoal}</p>
                </div>
              )}

              {/* Memory Topics */}
              {onboardingProfile.selectedMemoryTopics.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Topics to Explore</p>
                  <div className="flex flex-wrap gap-2">
                    {onboardingProfile.selectedMemoryTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2.5 py-1 rounded-full bg-muted text-xs font-medium capitalize"
                      >
                        {topic.replace("-", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <UserCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-sm text-muted-foreground mb-2">
                Complete your profile to personalize your journaling experience
              </p>
              <p className="text-xs text-muted-foreground">
                We'll ask about your goals, stress levels, and topics you want to explore
              </p>
            </div>
          )}
        </div>

        {/* Badges Section */}
        {hasCompletedOnboarding && earnedBadges.length > 0 && (
          <div className="rounded-xl glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Compass className="h-5 w-5 text-muted-foreground" />
              <h2 className="font-semibold">Earned Badges</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {earnedBadges.map((badgeId) => {
                const badge = BADGES[badgeId]
                return (
                  <div
                    key={badgeId}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30"
                  >
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                      <Compass className="w-3 h-3 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {badge.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

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

      {/* Onboarding Modal (for revisit) */}
      {showOnboarding && (
        <FirstTimeOnboarding
          forceShow={true}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  )
}
