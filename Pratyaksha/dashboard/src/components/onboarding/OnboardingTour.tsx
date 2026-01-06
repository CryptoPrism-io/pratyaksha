import { useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { driver, type DriveStep, type Driver } from "driver.js"
import "driver.js/dist/driver.css"

const STORAGE_KEY = "pratyaksha-onboarding-completed"
const TOUR_PHASE_KEY = "pratyaksha-tour-phase"

// Phase 1: Dashboard Tour - All charts explained
const dashboardSteps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Pratyaksha! 🧠",
      description:
        "Your cognitive analytics dashboard that transforms journal entries into visual insights. Let me give you a comprehensive tour!",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='stats-bar']",
    popover: {
      title: "Quick Stats Overview",
      description:
        "Your key metrics at a glance: total entries, recent activity, average word count, and positive sentiment percentage.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: "[data-tour='date-filter']",
    popover: {
      title: "Time Range Filter",
      description:
        "Filter all charts by date range. Choose from presets or select a custom range to focus your analysis.",
      side: "bottom",
      align: "end",
    },
  },
  {
    element: "[data-tour='mode-distribution']",
    popover: {
      title: "Mode Distribution",
      description:
        "This pie chart shows your cognitive mode breakdown - Reflective, Hopeful, Calm, Anxious, etc. Understand which mental states dominate your entries.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-tour='contradiction-flow']",
    popover: {
      title: "Contradiction Flow (Sankey)",
      description:
        "A flow diagram showing how Entry Types connect to Inner Contradictions and resolve into Cognitive Modes. Click any node to filter related logs!",
      side: "left",
      align: "start",
    },
  },
  {
    element: "[data-tour='energy-patterns']",
    popover: {
      title: "Energy Patterns",
      description:
        "Radar charts comparing your energy distribution (Growth, Stability, Challenge) against optimal benchmarks. Green = healthy, Orange = needs attention.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='energy-matrix']",
    popover: {
      title: "Energy-Mode Matrix",
      description:
        "A heatmap showing the relationship between your energy levels and cognitive modes. Click any cell to see those specific entries!",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-tour='activity-calendar']",
    popover: {
      title: "Activity Calendar",
      description:
        "GitHub-style calendar showing your journaling consistency. Each day shows entry types - hover for details. Build your streak!",
      side: "left",
      align: "start",
    },
  },
  {
    element: "[data-tour='emotional-timeline']",
    popover: {
      title: "Emotional Timeline",
      description:
        "Track sentiment trends over time with this line chart. Spot emotional patterns, cycles, and see how your mood evolves.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='contradiction-tracker']",
    popover: {
      title: "Contradiction Tracker",
      description:
        "Monitor your recurring inner conflicts: Hope vs. Hopelessness, Control vs. Surrender, etc. High counts may indicate areas to explore.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "[data-tour='theme-tags']",
    popover: {
      title: "Theme Tags Cloud",
      description:
        "AI extracts themes from your entries and displays them as a word cloud. Larger words = more frequent themes in your thoughts.",
      side: "right",
      align: "start",
    },
  },
  {
    element: "[data-tour='insights-actions']",
    popover: {
      title: "AI Insights & Actions",
      description:
        "Personalized recommendations powered by AI. Get suggestions based on your patterns - streaks, sentiment trends, and actionable next steps.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='daily-rhythm']",
    popover: {
      title: "Daily Rhythm",
      description:
        "Discover when you journal most. This chart shows entry patterns by day of week, helping you identify optimal reflection times.",
      side: "left",
      align: "start",
    },
  },
  {
    element: "[data-tour='shortcuts-fab']",
    popover: {
      title: "Keyboard Shortcuts",
      description:
        "Power user? Press Shift+? anytime to see all keyboard shortcuts. Use 'T' for theme, 'R' to refresh, 'N' for new entry.",
      side: "left",
      align: "center",
    },
  },
  {
    element: "[data-tour='add-entry-fab']",
    popover: {
      title: "Ready to Log? ✨",
      description:
        "Now let's create your first entry! Click 'Next' to go to the Logs page where I'll show you how to add entries.",
      side: "left",
      align: "center",
    },
  },
]

// Phase 2: Logs Page Tour - Entry creation journey
const logsSteps: DriveStep[] = [
  {
    popover: {
      title: "The Logs Page 📝",
      description:
        "This is where you create and view all your journal entries. Let me show you around!",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='log-entry-form']",
    popover: {
      title: "Log Entry Form",
      description:
        "Type your thoughts, feelings, or reflections here. The AI will automatically analyze your entry for mood, themes, energy levels, and contradictions.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-tour='logs-filters']",
    popover: {
      title: "Filter Your Entries",
      description:
        "Search and filter your entries by type, mode, sentiment, energy level, or date range. Find patterns in your past reflections.",
      side: "top",
      align: "center",
    },
  },
  {
    element: "[data-tour='entries-table']",
    popover: {
      title: "Your Entry History",
      description:
        "All your past entries appear here with AI-generated insights. Click any entry to expand and see the full analysis.",
      side: "top",
      align: "center",
    },
  },
  {
    popover: {
      title: "You're All Set! 🎉",
      description:
        "Start logging your thoughts and watch your cognitive patterns emerge. The more you write, the better the insights! You can restart this tour anytime from the menu.",
      side: "over",
      align: "center",
    },
  },
]

interface OnboardingTourProps {
  forceShow?: boolean
  onComplete?: () => void
}

export function OnboardingTour({ forceShow, onComplete }: OnboardingTourProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const startDashboardTour = useCallback(() => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0, 0, 0, 0.75)",
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "pratyaksha-tour-popover",
      steps: dashboardSteps,
      onNextClick: (_element, _step, options) => {
        // Check if this is the last step (Add Entry button)
        const currentIndex = options.state?.activeIndex ?? 0
        if (currentIndex === dashboardSteps.length - 1) {
          // Save phase and navigate to logs
          localStorage.setItem(TOUR_PHASE_KEY, "logs")
          driverObj.destroy()
          navigate("/logs")
          return
        }
        // Otherwise continue normally
        driverObj.moveNext()
      },
      onDestroyStarted: () => {
        const phase = localStorage.getItem(TOUR_PHASE_KEY)
        // Only mark as completed if we're not transitioning to logs
        if (phase !== "logs") {
          localStorage.setItem(STORAGE_KEY, "true")
          localStorage.removeItem(TOUR_PHASE_KEY)
          onComplete?.()
        }
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [navigate, onComplete])

  const startLogsTour = useCallback(() => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "rgba(0, 0, 0, 0.75)",
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "pratyaksha-tour-popover",
      steps: logsSteps,
      onDestroyStarted: () => {
        localStorage.setItem(STORAGE_KEY, "true")
        localStorage.removeItem(TOUR_PHASE_KEY)
        onComplete?.()
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [onComplete])

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY) === "true"
    const tourPhase = localStorage.getItem(TOUR_PHASE_KEY)

    // Phase 2: Continue on Logs page
    if (tourPhase === "logs" && location.pathname === "/logs") {
      const timer = setTimeout(() => {
        startLogsTour()
      }, 500)
      return () => clearTimeout(timer)
    }

    // Phase 1: Start Dashboard tour
    if ((forceShow || !hasCompleted) && location.pathname === "/dashboard") {
      // Clear any stale phase
      localStorage.removeItem(TOUR_PHASE_KEY)
      const timer = setTimeout(() => {
        startDashboardTour()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [forceShow, location.pathname, startDashboardTour, startLogsTour])

  return null
}

export function resetOnboardingTour() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(TOUR_PHASE_KEY)
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true"
}
