// Notification Settings Component
import { Bell, BellOff, Clock, Flame, Calendar, Globe, Moon, AlertCircle } from "lucide-react"
import { useNotifications } from "@/hooks/useNotifications"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  getDefaultTimesForFrequency,
  getFrequencyLabel,
  type NotificationFrequency,
} from "@/lib/notifications"

// Common timezones for selection
const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Central European (CET)" },
  { value: "Europe/Berlin", label: "Berlin (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST, UTC+4)" },
  { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST, UTC+9)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZST)" },
  { value: "UTC", label: "UTC" },
]

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    isEnabled,
    isLoading,
    error,
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

  // Handle frequency change - update custom times to defaults for the new frequency
  const handleFrequencyChange = (value: NotificationFrequency) => {
    const defaultTimes = getDefaultTimesForFrequency(value)
    updatePreferences({
      frequency: value,
      customTimes: defaultTimes,
    })
  }

  // Handle custom time change
  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...preferences.customTimes]
    newTimes[index] = value
    updatePreferences({ customTimes: newTimes })
  }

  return (
    <div className="space-y-6">
      {/* Error display */}
      {error && (
        <div className="rounded-lg border border-amber-500/50 bg-amber-500/5 p-4">
          <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-medium">Setup Issue</p>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

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
        <div className="space-y-6">
          {/* Timezone section */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Timezone</h4>
            </div>
            <Select
              value={preferences.timezone}
              onValueChange={(value) => updatePreferences({ timezone: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Auto-detected from your browser. Change if needed.
            </p>
          </div>

          {/* Frequency section */}
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Reminder Frequency</h4>
            </div>

            <RadioGroup
              value={preferences.frequency}
              onValueChange={(value) => handleFrequencyChange(value as NotificationFrequency)}
              className="space-y-3"
            >
              {(["hourly", "3x_daily", "2x_daily", "1x_daily"] as NotificationFrequency[]).map(
                (freq) => (
                  <div key={freq} className="flex items-center space-x-3">
                    <RadioGroupItem value={freq} id={freq} />
                    <Label htmlFor={freq} className="font-normal cursor-pointer">
                      {getFrequencyLabel(freq)}
                    </Label>
                  </div>
                )
              )}
            </RadioGroup>

            {/* Custom times - show for non-hourly frequencies */}
            {preferences.frequency !== "hourly" && preferences.customTimes.length > 0 && (
              <div className="mt-4 pl-7 space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Notification times:
                </Label>
                <div className="flex flex-wrap gap-3">
                  {preferences.customTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => handleTimeChange(index, e.target.value)}
                        className="rounded-md border bg-background px-3 py-1.5 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quiet hours section */}
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <h4 className="font-medium">Quiet Hours</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              No notifications during these hours
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="quiet-start" className="text-sm text-muted-foreground">
                  From:
                </Label>
                <input
                  type="time"
                  id="quiet-start"
                  value={preferences.quietHoursStart}
                  onChange={(e) =>
                    updatePreferences({ quietHoursStart: e.target.value })
                  }
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="quiet-end" className="text-sm text-muted-foreground">
                  To:
                </Label>
                <input
                  type="time"
                  id="quiet-end"
                  value={preferences.quietHoursEnd}
                  onChange={(e) =>
                    updatePreferences({ quietHoursEnd: e.target.value })
                  }
                  className="rounded-md border bg-background px-3 py-1.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Other notification types */}
          <div className="rounded-lg border p-4 space-y-4">
            <h4 className="font-medium">Other Notifications</h4>

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
        </div>
      )}
    </div>
  )
}
