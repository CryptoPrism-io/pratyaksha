// Notification Settings Component
import { Bell, BellOff, Clock, Flame, Calendar } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    preferences,
    enableNotifications,
    disableNotifications,
    updatePreferences,
  } = useNotifications()

  // Not supported state
  if (!isSupported) {
    return (
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3 text-muted-foreground">
          <BellOff className="h-5 w-5" />
          <div>
            <p className="font-medium">Notifications Not Available</p>
            <p className="text-sm">
              Push notifications are not supported in this browser.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Permission denied state
  if (permission === "denied") {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
        <div className="flex items-center gap-3 text-destructive">
          <BellOff className="h-5 w-5" />
          <div>
            <p className="font-medium">Notifications Blocked</p>
            <p className="text-sm text-muted-foreground">
              Please enable notifications in your browser settings to receive
              reminders.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              isEnabled ? "bg-primary/10" : "bg-muted"
            )}
          >
            {isEnabled ? (
              <Bell className="h-5 w-5 text-primary" />
            ) : (
              <BellOff className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div>
            <Label htmlFor="notifications-toggle" className="text-base font-medium">
              Push Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              {isEnabled
                ? "You'll receive reminders and updates"
                : "Enable to get journaling reminders"}
            </p>
          </div>
        </div>

        {isEnabled ? (
          <Button
            variant="outline"
            size="sm"
            onClick={disableNotifications}
            disabled={isLoading}
          >
            Disable
          </Button>
        ) : (
          <Button
            size="sm"
            onClick={enableNotifications}
            disabled={isLoading}
          >
            {isLoading ? "Enabling..." : "Enable"}
          </Button>
        )}
      </div>

      {/* Notification preferences - only show when enabled */}
      {isEnabled && (
        <div className="space-y-4 rounded-lg border p-4">
          <h4 className="font-medium">Notification Types</h4>

          {/* Daily reminder */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="daily-reminder" className="font-normal">
                  Daily Reminder
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get a reminder to write your daily entry
                </p>
              </div>
            </div>
            <Switch
              id="daily-reminder"
              checked={preferences.dailyReminder}
              onCheckedChange={(checked) =>
                updatePreferences({ dailyReminder: checked })
              }
            />
          </div>

          {/* Reminder time - only show if daily reminder is on */}
          {preferences.dailyReminder && (
            <div className="ml-7 flex items-center gap-3">
              <Label htmlFor="reminder-time" className="text-sm text-muted-foreground">
                Reminder time:
              </Label>
              <input
                type="time"
                id="reminder-time"
                value={preferences.dailyReminderTime}
                onChange={(e) =>
                  updatePreferences({ dailyReminderTime: e.target.value })
                }
                className="rounded-md border bg-background px-3 py-1.5 text-sm"
              />
            </div>
          )}

          {/* Streak at risk */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Flame className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="streak-risk" className="font-normal">
                  Streak at Risk
                </Label>
                <p className="text-xs text-muted-foreground">
                  Alert when your streak might be lost
                </p>
              </div>
            </div>
            <Switch
              id="streak-risk"
              checked={preferences.streakAtRisk}
              onCheckedChange={(checked) =>
                updatePreferences({ streakAtRisk: checked })
              }
            />
          </div>

          {/* Weekly summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label htmlFor="weekly-summary" className="font-normal">
                  Weekly Summary
                </Label>
                <p className="text-xs text-muted-foreground">
                  Get your weekly insights every Sunday
                </p>
              </div>
            </div>
            <Switch
              id="weekly-summary"
              checked={preferences.weeklySummary}
              onCheckedChange={(checked) =>
                updatePreferences({ weeklySummary: checked })
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
