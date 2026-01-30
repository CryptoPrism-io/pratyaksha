import { useState, useRef } from "react"
import { Mic, MicOff, Send, Loader2, Brain, Sparkles, Sun, Moon, Heart, CloudRain, Target, Pencil, WifiOff, ChevronRight, X, User, Baby, Users, Smile, Flame, ChevronDown, Lock } from "lucide-react"
import { Button } from "../ui/button"
import { useSpeechToText } from "../../hooks/useSpeechToText"
import { useStreak, STREAK_MILESTONES } from "../../hooks/useStreak"
import { useEntries } from "../../hooks/useEntries"
import { useOffline } from "../../contexts/OfflineContext"
import { useKarma } from "../../contexts/KarmaContext"
import { toast } from "sonner"
import { cn } from "../../lib/utils"
import { ERROR_MESSAGES } from "../../lib/errorMessages"
import { UNLOCK_THRESHOLDS, getTopicTier } from "../../lib/gamificationStorage"
import confetti from "canvas-confetti"

// Entry modes with their prompts/nudges
interface EntryMode {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  nudges: string[]
  description: string
}

// Quick daily logging modes
const ENTRY_MODES: EntryMode[] = [
  {
    id: "morning",
    name: "Morning Check-in",
    icon: <Sun className="h-6 w-6" />,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    description: "Start your day with intention",
    nudges: [
      "How am I feeling this morning?",
      "What's my energy level right now?",
      "What am I looking forward to today?",
      "One thing I want to accomplish...",
    ],
  },
  {
    id: "evening",
    name: "End of Day",
    icon: <Moon className="h-6 w-6" />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30 hover:border-indigo-500/60",
    description: "Reflect on your day",
    nudges: [
      "How did today go overall?",
      "What went well today?",
      "What was challenging?",
      "How am I feeling now?",
    ],
  },
  {
    id: "gratitude",
    name: "Gratitude",
    icon: <Heart className="h-6 w-6" />,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30 hover:border-rose-500/60",
    description: "Appreciate the good",
    nudges: [
      "Something I'm grateful for today...",
      "A person who made a difference...",
      "A moment that made me smile...",
      "Something I often take for granted...",
    ],
  },
  {
    id: "stress",
    name: "Stress Release",
    icon: <CloudRain className="h-6 w-6" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/10",
    borderColor: "border-cyan-500/30 hover:border-cyan-500/60",
    description: "Let it all out",
    nudges: [
      "What's weighing on my mind?",
      "How is this affecting me?",
      "What's within my control?",
      "One small step I can take...",
    ],
  },
  {
    id: "goals",
    name: "Goal Check",
    icon: <Target className="h-6 w-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    description: "Track your progress",
    nudges: [
      "What goal am I working on?",
      "Progress I've made so far...",
      "Obstacles I'm facing...",
      "My next step will be...",
    ],
  },
  {
    id: "free",
    name: "Free Write",
    icon: <Pencil className="h-6 w-6" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    description: "Express yourself freely",
    nudges: [
      "What's on your mind right now?",
      "No structure needed - just flow...",
      "Let your thoughts guide you...",
    ],
  },
]

// Profile category with depth levels
interface ProfileCategory {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  description: string
  tier: "surface" | "deep" | "core" // Progressive unlock levels
  nudges: string[]
}

// Deep self-discovery profile categories organized by depth
const PROFILE_CATEGORIES: ProfileCategory[] = [
  // === SURFACE LEVEL (Easy to start) ===
  {
    id: "childhood",
    name: "Childhood Memories",
    icon: <Baby className="h-6 w-6" />,
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    borderColor: "border-sky-500/30 hover:border-sky-500/60",
    description: "Early life experiences",
    tier: "surface",
    nudges: [
      "What's your earliest happy memory?",
      "Describe your childhood home...",
      "What games did you love playing?",
      "A smell or sound that takes you back...",
      "What did you dream of becoming?",
    ],
  },
  {
    id: "joys",
    name: "Peak Joys",
    icon: <Sparkles className="h-6 w-6" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
    borderColor: "border-yellow-500/30 hover:border-yellow-500/60",
    description: "Your happiest moments",
    tier: "surface",
    nudges: [
      "The happiest day of your life...",
      "An achievement you're most proud of...",
      "A moment of pure bliss...",
      "When did you feel most alive?",
      "A time you laughed until you cried...",
    ],
  },
  {
    id: "friendships",
    name: "Friendships",
    icon: <Smile className="h-6 w-6" />,
    color: "text-pink-400",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30 hover:border-pink-500/60",
    description: "Friends through the years",
    tier: "surface",
    nudges: [
      "Who was your first best friend?",
      "A friendship that changed you...",
      "Friends you've lost touch with...",
      "What makes you a good friend?",
      "Your deepest friendship today...",
    ],
  },
  {
    id: "interests",
    name: "Passions & Hobbies",
    icon: <Heart className="h-6 w-6" />,
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    borderColor: "border-rose-500/30 hover:border-rose-500/60",
    description: "What lights you up",
    tier: "surface",
    nudges: [
      "What activity makes you lose track of time?",
      "A hobby you've always wanted to try...",
      "What did you love doing as a kid that you stopped?",
      "What would you do if money wasn't a concern?",
      "A skill you're proud of developing...",
    ],
  },

  // === DEEP LEVEL (Requires more trust) ===
  {
    id: "parents",
    name: "Parental Bond",
    icon: <Users className="h-6 w-6" />,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30 hover:border-orange-500/60",
    description: "Your relationship with parents",
    tier: "deep",
    nudges: [
      "How would you describe your mother?",
      "How would you describe your father?",
      "What did they teach you about life?",
      "A moment you felt truly loved by them...",
      "Something you wish they understood...",
      "How has your relationship evolved?",
    ],
  },
  {
    id: "siblings",
    name: "Siblings & Family",
    icon: <Users className="h-6 w-6" />,
    color: "text-teal-400",
    bgColor: "bg-teal-500/10",
    borderColor: "border-teal-500/30 hover:border-teal-500/60",
    description: "Brothers, sisters, extended family",
    tier: "deep",
    nudges: [
      "Describe your sibling relationships...",
      "A favorite memory with your siblings...",
      "How did birth order affect you?",
      "Family traditions that shaped you...",
      "Extended family that influenced you...",
    ],
  },
  {
    id: "love",
    name: "Love & Romance",
    icon: <Heart className="h-6 w-6" />,
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30 hover:border-red-500/60",
    description: "Romantic relationships",
    tier: "deep",
    nudges: [
      "Your first love - what was it like?",
      "What do you need most in a partner?",
      "A relationship that taught you the most...",
      "What patterns do you notice in your relationships?",
      "Your definition of love has changed how?",
      "What's your attachment style?",
    ],
  },
  {
    id: "career",
    name: "Work & Purpose",
    icon: <Target className="h-6 w-6" />,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/30 hover:border-emerald-500/60",
    description: "Career and calling",
    tier: "deep",
    nudges: [
      "What work makes you feel meaningful?",
      "A career moment you're proud of...",
      "What would your ideal workday look like?",
      "How do you define success?",
      "What's holding you back professionally?",
      "If you could start over, what would you do?",
    ],
  },
  {
    id: "turning-points",
    name: "Turning Points",
    icon: <Flame className="h-6 w-6" />,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30 hover:border-amber-500/60",
    description: "Moments that changed everything",
    tier: "deep",
    nudges: [
      "A decision that altered your life path...",
      "When did you become an adult?",
      "A moment that shattered your worldview...",
      "The hardest choice you ever made...",
      "A door that closed but opened another...",
    ],
  },
  {
    id: "body",
    name: "Body & Health",
    icon: <User className="h-6 w-6" />,
    color: "text-lime-400",
    bgColor: "bg-lime-500/10",
    borderColor: "border-lime-500/30 hover:border-lime-500/60",
    description: "Physical self relationship",
    tier: "deep",
    nudges: [
      "How do you feel about your body?",
      "What does your body need that you ignore?",
      "A health scare that changed your perspective...",
      "How has your relationship with your body evolved?",
      "What would you tell your younger self about health?",
    ],
  },

  // === CORE LEVEL (Deep vulnerability) ===
  {
    id: "wounds",
    name: "Emotional Wounds",
    icon: <Flame className="h-6 w-6" />,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/30 hover:border-red-500/60",
    description: "Traumas and healing",
    tier: "core",
    nudges: [
      "A pain you've carried for years...",
      "When did you first feel truly hurt?",
      "Something you've never told anyone...",
      "A betrayal that changed you...",
      "How have you grown from pain?",
      "What still needs healing?",
    ],
  },
  {
    id: "fears",
    name: "Deepest Fears",
    icon: <CloudRain className="h-6 w-6" />,
    color: "text-slate-600 dark:text-slate-400",
    bgColor: "bg-slate-500/10",
    borderColor: "border-slate-500/30 hover:border-slate-500/60",
    description: "What haunts you",
    tier: "core",
    nudges: [
      "What fear controls your decisions?",
      "Your recurring nightmare or anxiety...",
      "What are you afraid people will find out?",
      "A fear you've overcome and how...",
      "What would you do if you weren't afraid?",
      "The fear beneath all other fears...",
    ],
  },
  {
    id: "regrets",
    name: "Regrets & What-Ifs",
    icon: <Moon className="h-6 w-6" />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-500/10",
    borderColor: "border-indigo-500/30 hover:border-indigo-500/60",
    description: "Roads not taken",
    tier: "core",
    nudges: [
      "Your biggest regret in life...",
      "A relationship you wish you'd handled differently...",
      "Something you wish you'd said to someone...",
      "A version of your life you wonder about...",
      "How do you make peace with regret?",
    ],
  },
  {
    id: "shadow",
    name: "Shadow Self",
    icon: <Moon className="h-6 w-6" />,
    color: "text-zinc-400",
    bgColor: "bg-zinc-500/10",
    borderColor: "border-zinc-500/30 hover:border-zinc-500/60",
    description: "The parts you hide",
    tier: "core",
    nudges: [
      "A part of yourself you're ashamed of...",
      "When do you act against your values?",
      "What triggers your worst behavior?",
      "A secret desire you judge yourself for...",
      "The person you are when no one's watching...",
      "What would your enemies say about you?",
    ],
  },
  {
    id: "identity",
    name: "Core Identity",
    icon: <User className="h-6 w-6" />,
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    borderColor: "border-violet-500/30 hover:border-violet-500/60",
    description: "Who you really are",
    tier: "core",
    nudges: [
      "What values define you at your core?",
      "What brings you true meaning?",
      "How do you want to be remembered?",
      "What's your biggest contradiction?",
      "What makes you uniquely you?",
      "Who are you when you strip away all roles?",
    ],
  },
  {
    id: "beliefs",
    name: "Beliefs & Spirituality",
    icon: <Sparkles className="h-6 w-6" />,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30 hover:border-purple-500/60",
    description: "What you believe in",
    tier: "core",
    nudges: [
      "What do you believe happens after death?",
      "How has your spirituality evolved?",
      "A belief you hold that others might judge...",
      "What gives your life ultimate meaning?",
      "When do you feel connected to something greater?",
      "What questions keep you up at night?",
    ],
  },
  {
    id: "mortality",
    name: "Death & Legacy",
    icon: <Moon className="h-6 w-6" />,
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    borderColor: "border-gray-500/30 hover:border-gray-500/60",
    description: "Facing the end",
    tier: "core",
    nudges: [
      "How do you feel about your mortality?",
      "What do you want your legacy to be?",
      "If you had one year left, what would you do?",
      "A death that profoundly affected you...",
      "What would you want said at your funeral?",
      "What are you leaving unfinished?",
    ],
  },
]

// Get counts by tier
const TIER_INFO = {
  surface: { label: "Surface", description: "Easy starting points", color: "text-sky-400", bgColor: "bg-sky-500/10" },
  deep: { label: "Deep", description: "Requires reflection", color: "text-amber-400", bgColor: "bg-amber-500/10" },
  core: { label: "Core", description: "Deepest vulnerability", color: "text-violet-400", bgColor: "bg-violet-500/10" },
}

function triggerConfetti() {
  confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } })
  setTimeout(() => confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } }), 150)
  setTimeout(() => confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } }), 300)
}

const PROCESSING_STEPS = [
  { label: "Classifying intent...", icon: "brain" },
  { label: "Analyzing emotions...", icon: "sparkles" },
  { label: "Extracting themes...", icon: "brain" },
  { label: "Generating insights...", icon: "sparkles" },
  { label: "Saving to database...", icon: "brain" },
]

interface GuidedEntryFormProps {
  onSuccess?: () => void
}

export function GuidedEntryForm({ onSuccess }: GuidedEntryFormProps) {
  const [activeMode, setActiveMode] = useState<EntryMode | null>(null)
  const [inputMethod, setInputMethod] = useState<"voice" | "text" | null>(null)
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [currentNudgeIndex, setCurrentNudgeIndex] = useState(0)
  const [showProfileSection, setShowProfileSection] = useState(false)
  const [activeSoulMappingTopicId, setActiveSoulMappingTopicId] = useState<string | null>(null)

  const { isOnline, submitEntry } = useOffline()
  const { data: entries = [] } = useEntries()
  const { streak } = useStreak(entries)
  const { earnKarma, recordSoulMappingCompletion, isTierUnlocked, isTopicCompleted } = useKarma()
  const entryCountBeforeSubmit = useRef(entries.length)

  const {
    isRecording,
    isProcessing: isSpeechProcessing,
    duration: recordingDuration,
    startRecording,
    stopRecording,
  } = useSpeechToText({
    processIntent: true,
    onTranscript: (result) => {
      setText((prev) => {
        const newText = result.cleanedText || result.rawText
        if (prev && !prev.endsWith(" ") && !prev.endsWith("\n")) {
          return prev + " " + newText
        }
        return prev + newText
      })
      toast.success("Voice transcribed!", { duration: 2000 })
    },
    onError: (error) => {
      toast.error("Voice Recording Issue", { description: error || ERROR_MESSAGES.VOICE_ERROR })
    },
  })

  const isVoiceSupported = typeof MediaRecorder !== "undefined"

  // Start with a mode selection
  const handleSelectMode = (mode: EntryMode, isSoulMapping = false) => {
    setActiveMode(mode)
    setCurrentNudgeIndex(0)
    setText("")
    setActiveSoulMappingTopicId(isSoulMapping ? mode.id : null)
  }

  // Start recording immediately when choosing voice
  const handleStartVoice = () => {
    setInputMethod("voice")
    if (!isRecording) {
      startRecording()
    }
  }

  // Switch to text input
  const handleStartText = () => {
    setInputMethod("text")
  }

  // Reset to mode selection
  const handleBack = () => {
    if (isRecording) stopRecording()
    if (inputMethod) {
      setInputMethod(null)
    } else {
      setActiveMode(null)
    }
    setText("")
  }

  // Cycle through nudges
  const handleNextNudge = () => {
    if (activeMode) {
      setCurrentNudgeIndex((prev) => (prev + 1) % activeMode.nudges.length)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Empty Entry", { description: ERROR_MESSAGES.EMPTY_ENTRY })
      return
    }

    setIsProcessing(true)
    setProcessingStep(0)

    const stepInterval = isOnline
      ? setInterval(() => {
          setProcessingStep((prev) => (prev < PROCESSING_STEPS.length - 1 ? prev + 1 : prev))
        }, 1500)
      : null

    try {
      const { success, offline } = await submitEntry(text.trim())

      if (success) {
        // Award Karma for journal entry
        earnKarma("JOURNAL_ENTRY")

        // If this was a Soul Mapping entry, record completion
        if (activeSoulMappingTopicId) {
          recordSoulMappingCompletion(activeSoulMappingTopicId)
        }

        if (offline) {
          toast.success("Entry saved offline!", {
            description: "Your entry will sync when you're back online.",
            icon: <WifiOff className="h-4 w-4" />,
          })
        } else {
          const isFirstEntry = entryCountBeforeSubmit.current === 0
          const newStreak = streak + 1
          const hitMilestone = STREAK_MILESTONES.includes(newStreak as typeof STREAK_MILESTONES[number]) ? newStreak : null

          if (isFirstEntry) {
            triggerConfetti()
            toast.success("Welcome to Pratyaksha!", {
              description: "Your first entry has been logged. Your journey begins now!",
              duration: 5000,
            })
          } else if (hitMilestone) {
            triggerConfetti()
            toast.success(`${hitMilestone} Day Milestone!`, { duration: 6000 })
          } else {
            toast.success("Entry saved!", {
              description: newStreak > 1 ? `Day ${newStreak} streak!` : "Your entry has been logged and analyzed.",
            })
          }
        }

        // Reset everything
        setText("")
        setActiveMode(null)
        setInputMethod(null)
        setCurrentNudgeIndex(0)
        setActiveSoulMappingTopicId(null)
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to process entry:", error)
      toast.error("Entry Not Saved", { description: ERROR_MESSAGES.PROCESS_ENTRY })
    } finally {
      if (stepInterval) clearInterval(stepInterval)
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  // ==================== RENDER ====================

  // Mode Selection View (Initial State)
  if (!activeMode) {
    return (
      <div className="space-y-4">
        {/* Quick Logging Section */}
        <div className="rounded-xl glass-card p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">What would you like to log?</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a type to get guided prompts, or free write
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ENTRY_MODES.map((mode) => (
              <button
                key={mode.id}
                onClick={() => handleSelectMode(mode)}
                className={cn(
                  "group relative p-4 rounded-xl border-2 transition-all text-left",
                  mode.borderColor,
                  mode.bgColor,
                  "hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                <div className={cn("mb-2", mode.color)}>{mode.icon}</div>
                <h3 className="font-medium text-sm">{mode.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{mode.description}</p>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Soul Mapping Section */}
        <div className="rounded-xl glass-card overflow-hidden">
          <button
            onClick={() => setShowProfileSection(!showProfileSection)}
            className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-pink-500/20">
                <User className="h-5 w-5 text-violet-400" />
              </div>
              <div className="text-left">
                <h2 className="text-lg font-semibold">Soul Mapping</h2>
                <p className="text-sm text-muted-foreground">
                  {PROFILE_CATEGORIES.length} deep self-discovery topics across 3 levels
                </p>
              </div>
            </div>
            <ChevronDown className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              showProfileSection && "rotate-180"
            )} />
          </button>

          {showProfileSection && (
            <div className="p-6 pt-2 border-t border-border/50 space-y-6">
              {/* Surface Level */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TIER_INFO.surface.bgColor, TIER_INFO.surface.color)}>
                    Level 1
                  </div>
                  <span className="font-medium text-sm">{TIER_INFO.surface.label}</span>
                  <span className="text-xs text-muted-foreground">— {TIER_INFO.surface.description}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PROFILE_CATEGORIES.filter(c => c.tier === "surface").map((mode) => {
                    const completed = isTopicCompleted(mode.id)
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleSelectMode(mode, true)}
                        className={cn(
                          "group relative p-3 rounded-xl border-2 transition-all text-left",
                          completed ? "border-emerald-500/50 bg-emerald-500/10" : mode.borderColor,
                          !completed && mode.bgColor,
                          "hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        {completed && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                        <div className={cn("mb-1.5", completed ? "text-emerald-500" : mode.color)}>{mode.icon}</div>
                        <h3 className="font-medium text-sm">{mode.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mode.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Deep Level */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TIER_INFO.deep.bgColor, TIER_INFO.deep.color)}>
                    Level 2
                  </div>
                  <span className="font-medium text-sm">{TIER_INFO.deep.label}</span>
                  <span className="text-xs text-muted-foreground">— {TIER_INFO.deep.description}</span>
                  {!isTierUnlocked("deep") && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Lock className="h-3 w-3" />
                      {UNLOCK_THRESHOLDS.DEEP} entries
                    </span>
                  )}
                </div>
                <div className={cn(
                  "grid grid-cols-2 md:grid-cols-3 gap-3",
                  !isTierUnlocked("deep") && "opacity-50 pointer-events-none"
                )}>
                  {PROFILE_CATEGORIES.filter(c => c.tier === "deep").map((mode) => {
                    const completed = isTopicCompleted(mode.id)
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleSelectMode(mode, true)}
                        disabled={!isTierUnlocked("deep")}
                        className={cn(
                          "group relative p-3 rounded-xl border-2 transition-all text-left",
                          completed ? "border-emerald-500/50 bg-emerald-500/10" : mode.borderColor,
                          !completed && mode.bgColor,
                          isTierUnlocked("deep") && "hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        {completed && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                        {!isTierUnlocked("deep") && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className={cn("mb-1.5", completed ? "text-emerald-500" : mode.color)}>{mode.icon}</div>
                        <h3 className="font-medium text-sm">{mode.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mode.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Core Level */}
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className={cn("px-2 py-0.5 rounded-full text-xs font-medium", TIER_INFO.core.bgColor, TIER_INFO.core.color)}>
                    Level 3
                  </div>
                  <span className="font-medium text-sm">{TIER_INFO.core.label}</span>
                  <span className="text-xs text-muted-foreground">— {TIER_INFO.core.description}</span>
                  {!isTierUnlocked("core") && (
                    <span className="flex items-center gap-1 text-xs text-violet-500">
                      <Lock className="h-3 w-3" />
                      {UNLOCK_THRESHOLDS.CORE} entries
                    </span>
                  )}
                </div>
                <div className={cn(
                  "grid grid-cols-2 md:grid-cols-3 gap-3",
                  !isTierUnlocked("core") && "opacity-50 pointer-events-none"
                )}>
                  {PROFILE_CATEGORIES.filter(c => c.tier === "core").map((mode) => {
                    const completed = isTopicCompleted(mode.id)
                    return (
                      <button
                        key={mode.id}
                        onClick={() => handleSelectMode(mode, true)}
                        disabled={!isTierUnlocked("core")}
                        className={cn(
                          "group relative p-3 rounded-xl border-2 transition-all text-left",
                          completed ? "border-emerald-500/50 bg-emerald-500/10" : mode.borderColor,
                          !completed && mode.bgColor,
                          isTierUnlocked("core") && "hover:scale-[1.02] active:scale-[0.98]"
                        )}
                      >
                        {completed && (
                          <div className="absolute top-2 right-2 h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                            <span className="text-white text-[10px]">✓</span>
                          </div>
                        )}
                        {!isTierUnlocked("core") && (
                          <div className="absolute top-2 right-2">
                            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <div className={cn("mb-1.5", completed ? "text-emerald-500" : mode.color)}>{mode.icon}</div>
                        <h3 className="font-medium text-sm">{mode.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{mode.description}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2 border-t border-border/50">
                Start with Surface level and progress deeper as you feel comfortable. Each entry builds your personal profile.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Input Method Selection (After mode is selected)
  if (!inputMethod) {
    return (
      <div className="rounded-xl glass-card p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <div className={cn("p-2 rounded-lg", activeMode.bgColor, activeMode.color)}>
            {activeMode.icon}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{activeMode.name}</h2>
            <p className="text-sm text-muted-foreground">{activeMode.description}</p>
          </div>
        </div>

        {/* Input method cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Voice Recording Card */}
          {isVoiceSupported && (
            <button
              onClick={handleStartVoice}
              className="group relative p-6 rounded-xl border-2 border-primary/30 hover:border-primary/60 bg-primary/5 transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 rounded-full bg-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Mic className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Speak Your Mind</h3>
                  <p className="text-sm text-muted-foreground">
                    Tap to start recording. Prompts will guide you.
                  </p>
                </div>
              </div>
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Text Writing Card */}
          <button
            onClick={handleStartText}
            className="group relative p-6 rounded-xl border-2 border-muted hover:border-muted-foreground/50 bg-muted/30 transition-all text-left hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-full bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                <Pencil className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Type It Out</h3>
                <p className="text-sm text-muted-foreground">
                  Write your thoughts with guided prompts.
                </p>
              </div>
            </div>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>
    )
  }

  // Active Recording/Writing View
  return (
    <div className="rounded-xl glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </button>
          <div className={cn("p-2 rounded-lg", activeMode.bgColor, activeMode.color)}>
            {activeMode.icon}
          </div>
          <span className="font-medium">{activeMode.name}</span>
        </div>
        {!isOnline && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
            <WifiOff className="h-3.5 w-3.5" />
            Offline
          </div>
        )}
      </div>

      {/* Nudge/Prompt Display - Large and prominent */}
      <div
        onClick={handleNextNudge}
        className={cn(
          "mb-4 p-6 rounded-xl cursor-pointer transition-all",
          activeMode.bgColor,
          "hover:scale-[1.01] active:scale-[0.99]"
        )}
      >
        <p className={cn("text-lg md:text-xl font-medium", activeMode.color)}>
          {activeMode.nudges[currentNudgeIndex]}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Tap for next prompt • {currentNudgeIndex + 1} of {activeMode.nudges.length}
        </p>
      </div>

      {/* Voice Recording UI */}
      {inputMethod === "voice" && (
        <div className="space-y-4">
          {/* Recording indicator */}
          <div className="flex items-center justify-center gap-4 py-8">
            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              disabled={isProcessing || isSpeechProcessing}
              className={cn(
                "relative p-8 rounded-full transition-all",
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : isSpeechProcessing
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary hover:bg-primary/30"
              )}
            >
              {isSpeechProcessing ? (
                <Loader2 className="h-12 w-12 animate-spin" />
              ) : isRecording ? (
                <MicOff className="h-12 w-12" />
              ) : (
                <Mic className="h-12 w-12" />
              )}
              {/* Pulse rings when recording */}
              {isRecording && (
                <>
                  <span className="absolute inset-0 rounded-full bg-red-500/50 animate-ping" />
                  <span className="absolute inset-[-8px] rounded-full border-2 border-red-500/30 animate-pulse" />
                </>
              )}
            </button>
          </div>

          {/* Recording status */}
          <div className="text-center">
            {isRecording && (
              <p className="text-lg font-medium text-red-500">
                Recording... {formatDuration(recordingDuration)}
              </p>
            )}
            {isSpeechProcessing && (
              <p className="text-lg font-medium text-primary">Transcribing...</p>
            )}
            {!isRecording && !isSpeechProcessing && (
              <p className="text-muted-foreground">
                {text ? "Tap mic to add more" : "Tap the mic to start"}
              </p>
            )}
          </div>

          {/* Transcribed text preview */}
          {text && (
            <div className="p-4 rounded-lg bg-muted/50 border max-h-40 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{text}</p>
            </div>
          )}
        </div>
      )}

      {/* Text Input UI */}
      {inputMethod === "text" && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim() && !isProcessing) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Start writing... let the prompts guide you"
          className="min-h-[200px] w-full resize-none rounded-lg border bg-background p-4 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          disabled={isProcessing}
          autoFocus
        />
      )}

      {/* Processing indicator */}
      {isProcessing && (
        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            {PROCESSING_STEPS[processingStep]?.icon === "brain" ? (
              <Brain className="h-5 w-5 animate-pulse text-primary" />
            ) : (
              <Sparkles className="h-5 w-5 animate-pulse text-primary" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">
                {PROCESSING_STEPS[processingStep]?.label || "Processing..."}
              </p>
              <div className="mt-2 flex gap-1">
                {PROCESSING_STEPS.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      index <= processingStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {wordCount} {wordCount === 1 ? "word" : "words"}
        </span>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing || isRecording}
          className="min-w-[120px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Log Entry
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
