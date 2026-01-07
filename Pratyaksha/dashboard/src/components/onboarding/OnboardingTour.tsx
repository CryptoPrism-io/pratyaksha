import { useEffect, useCallback } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { driver, type DriveStep, type Driver } from "driver.js"
import "driver.js/dist/driver.css"

const STORAGE_KEY = "pratyaksha-onboarding-completed"
const TOUR_PHASE_KEY = "pratyaksha-tour-phase"

// Phase 1: Welcome Intro - Big picture explanation (starts on Logs page)
const welcomeSteps: DriveStep[] = [
  {
    popover: {
      title: "Welcome to Pratyaksha",
      description:
        "Pratyaksha is your personal cognitive journaling companion. It helps you understand your thoughts, emotions, and mental patterns through AI-powered analysis.",
      side: "over",
      align: "center",
    },
  },
  {
    popover: {
      title: "How It Works",
      description:
        "1. Write journal entries about your thoughts and feelings\n2. AI analyzes your entries for mood, themes, and patterns\n3. View beautiful visualizations of your cognitive journey\n\nLet's start by showing you how to create your first entry!",
      side: "over",
      align: "center",
    },
  },
]

// Phase 2: Logs Page Tour - Entry creation journey
const logsSteps: DriveStep[] = [
  {
    element: "[data-tour='log-entry-form']",
    popover: {
      title: "Create Your Entry",
      description:
        "This is where you write your thoughts. Just type naturally - the AI will analyze your entry for mood, themes, energy levels, and inner contradictions.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-tour='logs-filters']",
    popover: {
      title: "Filter & Search",
      description:
        "Once you have entries, use these filters to search by type, mood, sentiment, or date. Great for finding patterns in your past reflections.",
      side: "bottom",
      align: "center",
    },
  },
  {
    element: "[data-tour='entries-table']",
    popover: {
      title: "Your Entry History",
      description:
        "All your past entries appear here with AI-generated insights. Click any entry to expand and see the full analysis including themes, contradictions, and recommendations.",
      side: "top",
      align: "center",
    },
  },
  {
    popover: {
      title: "Now Let's See the Dashboard",
      description:
        "Your entries power beautiful visualizations that reveal your cognitive patterns. Click 'Next' to explore the Dashboard!",
      side: "over",
      align: "center",
    },
  },
]

// Phase 3: Dashboard Tour - All charts explained
const dashboardSteps: DriveStep[] = [
  {
    popover: {
      title: "Your Analytics Dashboard",
      description:
        "This is where your journal entries come to life! Each chart reveals different patterns in your thoughts and emotions. Let me show you around.",
      side: "over",
      align: "center",
    },
  },
  {
    element: "[data-tour='stats-bar']",
    popover: {
      title: "Quick Stats",
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
      title: "Contradiction Flow",
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
    popover: {
      title: "You're All Set!",
      description:
        "Start logging your thoughts and watch your cognitive patterns emerge. The more you write, the better the insights!\n\nYou can restart this tour anytime from the menu (three dots icon).",
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

  // Phase 3: Dashboard tour (defined first - no dependencies on other tour functions)
  const startDashboardTour = useCallback(() => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "#2B2E3A",
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "pratyaksha-tour-popover",
      steps: dashboardSteps,
      onDestroyStarted: () => {
        localStorage.setItem(STORAGE_KEY, "true")
        localStorage.removeItem(TOUR_PHASE_KEY)
        onComplete?.()
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [onComplete])

  // Phase 2: Logs page tour (defined second - no dependencies on other tour functions)
  const startLogsTour = useCallback(() => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "#2B2E3A",
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "pratyaksha-tour-popover",
      steps: logsSteps,
      onNextClick: (_element, _step, options) => {
        const currentIndex = options.state?.activeIndex ?? 0
        if (currentIndex === logsSteps.length - 1) {
          // Move to dashboard phase
          localStorage.setItem(TOUR_PHASE_KEY, "dashboard")
          driverObj.destroy()
          navigate("/dashboard")
          return
        }
        driverObj.moveNext()
      },
      onDestroyStarted: () => {
        const phase = localStorage.getItem(TOUR_PHASE_KEY)
        if (phase !== "dashboard") {
          localStorage.setItem(STORAGE_KEY, "true")
          localStorage.removeItem(TOUR_PHASE_KEY)
          onComplete?.()
        }
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [navigate, onComplete])

  // Phase 1: Welcome intro on Logs page (defined last - depends on startLogsTour)
  const startWelcomeTour = useCallback(() => {
    const driverObj: Driver = driver({
      showProgress: true,
      animate: true,
      allowClose: true,
      overlayColor: "#2B2E3A",
      stagePadding: 10,
      stageRadius: 8,
      popoverClass: "pratyaksha-tour-popover",
      steps: welcomeSteps,
      onNextClick: (_element, _step, options) => {
        const currentIndex = options.state?.activeIndex ?? 0
        if (currentIndex === welcomeSteps.length - 1) {
          // Move to logs tour phase
          localStorage.setItem(TOUR_PHASE_KEY, "logs")
          driverObj.destroy()
          // Small delay then start logs tour
          setTimeout(() => {
            startLogsTour()
          }, 300)
          return
        }
        driverObj.moveNext()
      },
      onDestroyStarted: () => {
        const phase = localStorage.getItem(TOUR_PHASE_KEY)
        if (phase !== "logs") {
          // User closed early, mark as completed
          localStorage.setItem(STORAGE_KEY, "true")
          localStorage.removeItem(TOUR_PHASE_KEY)
          onComplete?.()
        }
        driverObj.destroy()
      },
    })

    driverObj.drive()
  }, [onComplete, startLogsTour])

  useEffect(() => {
    const hasCompleted = localStorage.getItem(STORAGE_KEY) === "true"
    const tourPhase = localStorage.getItem(TOUR_PHASE_KEY)

    // Phase 3: Continue on Dashboard page
    if (tourPhase === "dashboard" && location.pathname === "/dashboard") {
      const timer = setTimeout(() => {
        startDashboardTour()
      }, 500)
      return () => clearTimeout(timer)
    }

    // Phase 2: Continue logs tour
    if (tourPhase === "logs" && location.pathname === "/logs") {
      const timer = setTimeout(() => {
        startLogsTour()
      }, 500)
      return () => clearTimeout(timer)
    }

    // Phase 1: Start welcome tour on Logs page (for new users)
    if ((forceShow || !hasCompleted) && location.pathname === "/logs") {
      // Clear any stale phase
      localStorage.removeItem(TOUR_PHASE_KEY)
      const timer = setTimeout(() => {
        startWelcomeTour()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [forceShow, location.pathname, startWelcomeTour, startLogsTour, startDashboardTour])

  return null
}

export function resetOnboardingTour() {
  localStorage.removeItem(STORAGE_KEY)
  localStorage.removeItem(TOUR_PHASE_KEY)
}

export function hasCompletedOnboarding(): boolean {
  return localStorage.getItem(STORAGE_KEY) === "true"
}
