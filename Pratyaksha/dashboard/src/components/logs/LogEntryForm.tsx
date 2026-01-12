import { useState, useRef } from "react"
import { Mic, MicOff, Send, Loader2, Brain, Sparkles, Sun, Moon, Heart, CloudRain, Target, Calendar, Pencil, WifiOff, Wand2 } from "lucide-react"
import { Button } from "../ui/button"
import { useSpeechToText } from "../../hooks/useSpeechToText"
import { useStreak, STREAK_MILESTONES } from "../../hooks/useStreak"
import { useEntries } from "../../hooks/useEntries"
import { useOffline } from "../../contexts/OfflineContext"
// Note: Query invalidation is now handled by useOfflineSync
import { toast } from "sonner"
import { cn } from "../../lib/utils"
import { ERROR_MESSAGES } from "../../lib/errorMessages"
import confetti from "canvas-confetti"

// Entry templates to help users get started
interface EntryTemplate {
  id: string
  name: string
  icon: React.ReactNode
  prompt: string
}

const ENTRY_TEMPLATES: EntryTemplate[] = [
  {
    id: "morning",
    name: "Morning",
    icon: <Sun className="h-3.5 w-3.5" />,
    prompt: `How am I feeling this morning?

What's my energy level?

What am I looking forward to today?

One thing I want to accomplish:`,
  },
  {
    id: "evening",
    name: "Evening",
    icon: <Moon className="h-3.5 w-3.5" />,
    prompt: `How did today go overall?

What went well today?

What was challenging?

What did I learn?

How am I feeling now?`,
  },
  {
    id: "gratitude",
    name: "Gratitude",
    icon: <Heart className="h-3.5 w-3.5" />,
    prompt: `Three things I'm grateful for today:
1.
2.
3.

Why these matter to me:

Something I often take for granted:`,
  },
  {
    id: "stress",
    name: "Stress Dump",
    icon: <CloudRain className="h-3.5 w-3.5" />,
    prompt: `What's weighing on my mind right now?

How is this affecting me?

What's within my control?

One small step I can take:`,
  },
  {
    id: "goals",
    name: "Goals",
    icon: <Target className="h-3.5 w-3.5" />,
    prompt: `Goal I'm reflecting on:

Progress I've made:

Obstacles I'm facing:

What I need to do next:

How do I feel about my progress?`,
  },
  {
    id: "weekly",
    name: "Weekly",
    icon: <Calendar className="h-3.5 w-3.5" />,
    prompt: `Highlights of this week:

Challenges I faced:

What I learned:

What I want to focus on next week:

How am I feeling about my progress?`,
  },
]

function triggerConfetti() {
  // Center burst
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })

  // Left side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
    })
  }, 150)

  // Right side
  setTimeout(() => {
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
    })
  }, 300)
}

interface ProcessingStep {
  label: string
  icon: "brain" | "sparkles"
}

const PROCESSING_STEPS: ProcessingStep[] = [
  { label: "Classifying intent...", icon: "brain" },
  { label: "Analyzing emotions...", icon: "sparkles" },
  { label: "Extracting themes...", icon: "brain" },
  { label: "Generating insights...", icon: "sparkles" },
  { label: "Saving to database...", icon: "brain" },
]

interface LogEntryFormProps {
  onSuccess?: () => void
}

export function LogEntryForm({ onSuccess }: LogEntryFormProps) {
  const [text, setText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Get offline context
  const { isOnline, submitEntry } = useOffline()

  // Get entries for streak calculation
  const { data: entries = [] } = useEntries()
  const { streak } = useStreak(entries)

  // Track entry count before submission for first-entry detection
  const entryCountBeforeSubmit = useRef(entries.length)

  // Handle template selection
  const handleTemplateSelect = (template: EntryTemplate) => {
    if (selectedTemplate === template.id) {
      // Deselect template
      setSelectedTemplate(null)
      setText("")
    } else {
      // Select template and pre-fill
      setSelectedTemplate(template.id)
      setText(template.prompt)
      toast.success(`${template.name} template loaded`, { duration: 2000 })
    }
  }

  // Groq Whisper speech-to-text
  const [aiSuggestions, setAiSuggestions] = useState<{
    type: string
    tags: string[]
    confidence: number
  } | null>(null)

  const {
    isRecording,
    isProcessing: isSpeechProcessing,
    duration: recordingDuration,
    startRecording,
    stopRecording,
  } = useSpeechToText({
    processIntent: true, // Use intent LLM for smart suggestions
    onTranscript: (result) => {
      // Append cleaned transcript to text
      setText((prev) => {
        const newText = result.cleanedText || result.rawText
        if (prev && !prev.endsWith(" ") && !prev.endsWith("\n")) {
          return prev + " " + newText
        }
        return prev + newText
      })
      // Store AI suggestions
      if (result.confidence > 0.5) {
        setAiSuggestions({
          type: result.suggestedType,
          tags: result.suggestedTags,
          confidence: result.confidence,
        })
        toast.success("Voice transcribed!", {
          description: `Suggested type: ${result.suggestedType}`,
          duration: 3000,
        })
      }
    },
    onError: (error) => {
      toast.error("Voice Recording Issue", {
        description: error || ERROR_MESSAGES.VOICE_ERROR,
      })
    },
  })

  // Check if voice is supported (MediaRecorder API)
  const isVoiceSupported = typeof MediaRecorder !== "undefined"

  const isTogglingRef = useRef(false)

  const handleToggleMic = () => {
    // Debounce rapid clicks
    if (isTogglingRef.current) return
    isTogglingRef.current = true

    if (isRecording) {
      stopRecording()
    } else {
      setAiSuggestions(null) // Clear previous suggestions
      startRecording()
    }

    // Reset after a short delay
    setTimeout(() => {
      isTogglingRef.current = false
    }, 300)
  }

  // Format recording duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Empty Entry", {
        description: ERROR_MESSAGES.EMPTY_ENTRY,
      })
      return
    }

    setIsProcessing(true)
    setProcessingStep(0)

    // Simulate step progression (the actual processing happens server-side)
    // Skip steps animation for offline mode
    const stepInterval = isOnline
      ? setInterval(() => {
          setProcessingStep((prev) => {
            if (prev < PROCESSING_STEPS.length - 1) return prev + 1
            return prev
          })
        }, 1500)
      : null

    try {
      // Use offline-aware submitEntry
      const { success, offline } = await submitEntry(text.trim())

      if (success) {
        if (offline) {
          // Entry was queued for later sync
          toast.success("Entry saved offline!", {
            description: "Your entry will sync when you're back online.",
            icon: <WifiOff className="h-4 w-4" />,
          })
        } else {
          // Entry was synced successfully
          // Check if this is a first entry (had no entries before)
          const isFirstEntry = entryCountBeforeSubmit.current === 0

          // Calculate new streak (current streak + 1 if not logged today yet)
          const newStreak = streak + 1

          // Check if hitting a milestone
          const hitMilestone = STREAK_MILESTONES.includes(newStreak as typeof STREAK_MILESTONES[number])
            ? newStreak
            : null

          // Trigger confetti for first entry or milestones
          if (isFirstEntry) {
            triggerConfetti()
            toast.success("Welcome to Pratyaksha!", {
              description: "Your first entry has been logged. Your journey begins now!",
              duration: 5000,
            })
          } else if (hitMilestone) {
            // Milestone celebration!
            triggerConfetti()
            const milestoneMessages: Record<number, string> = {
              7: "One week of journaling! You're building a habit.",
              14: "Two weeks strong! Consistency is key.",
              30: "One month champion! You're on fire.",
              60: "Two months incredible! This is dedication.",
              100: "100 day legend! You've achieved something special.",
              365: "One year unstoppable! You're an inspiration.",
            }
            toast.success(`${hitMilestone} Day Milestone!`, {
              description: milestoneMessages[hitMilestone] || `Amazing! ${hitMilestone} days of journaling!`,
              duration: 6000,
            })
          } else {
            // Show streak toast
            toast.success("Entry saved!", {
              description: newStreak > 1
                ? `Day ${newStreak} streak! Keep the momentum going.`
                : "Your entry has been logged and analyzed.",
            })
          }
        }

        setText("")
        setSelectedTemplate(null)
        setAiSuggestions(null)
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to process entry:", error)
      toast.error("Entry Not Saved", {
        description: ERROR_MESSAGES.PROCESS_ENTRY,
      })
    } finally {
      if (stepInterval) clearInterval(stepInterval)
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length
  const charCount = text.length
  const MAX_CHARS = 5000

  return (
    <div className="rounded-xl glass-card p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Log New Entry</h2>
          {!isOnline && (
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
              <WifiOff className="h-3.5 w-3.5" />
              Offline Mode
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isOnline
            ? "AI will automatically classify your entry"
            : "Entry will sync when you're back online"}
        </p>
      </div>

      {/* Template selector */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-muted-foreground">Quick templates:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible scrollbar-hide">
          {ENTRY_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template)}
              disabled={isProcessing}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                selectedTemplate === template.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
              )}
            >
              {template.icon}
              {template.name}
            </button>
          ))}
          {/* Create Your Own - highlighted style */}
          <button
            onClick={() => {
              setSelectedTemplate("free")
              setText("")
              toast.success("Free write mode - express yourself!", { duration: 2000 })
            }}
            disabled={isProcessing}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border-2 border-dashed",
              selectedTemplate === "free"
                ? "border-primary bg-primary/10 text-primary"
                : "border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Create Your Own
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim() && !isProcessing) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={
            isRecording
              ? "Recording... speak now (tap mic to stop)"
              : isSpeechProcessing
              ? "Transcribing your voice..."
              : "What's on your mind? Type or tap the mic to speak..."
          }
          className={cn(
            "min-h-[150px] w-full resize-none rounded-lg border bg-background p-4 pr-14 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
            isRecording && "border-red-500 ring-2 ring-red-500/20",
            isSpeechProcessing && "border-primary ring-2 ring-primary/20"
          )}
          disabled={isProcessing || isSpeechProcessing}
          readOnly={isRecording}
        />

        {/* Mic button */}
        {isVoiceSupported && (
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isProcessing || isSpeechProcessing}
            className={cn(
              "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full transition-all",
              isRecording
                ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                : isSpeechProcessing
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isSpeechProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isRecording ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        )}

        {/* Recording duration indicator */}
        {isRecording && (
          <div className="absolute right-16 top-4 flex items-center gap-2 text-sm text-red-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {formatDuration(recordingDuration)}
          </div>
        )}
      </div>

      {/* AI Suggestions from voice */}
      {aiSuggestions && aiSuggestions.confidence > 0.6 && (
        <div className="mt-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-center gap-2 text-sm">
            <Wand2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">AI Suggestions</span>
            <span className="text-xs text-muted-foreground">
              ({Math.round(aiSuggestions.confidence * 100)}% confidence)
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Type: {aiSuggestions.type}
            </span>
            {aiSuggestions.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
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
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <span className={cn(
            "text-xs",
            charCount > MAX_CHARS * 0.9 ? "text-destructive" : "text-muted-foreground"
          )}>
            {charCount.toLocaleString()}/{MAX_CHARS.toLocaleString()}
          </span>
          {isRecording && (
            <span className="flex items-center gap-2 text-sm text-red-500">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              Recording...
            </span>
          )}
          {isSpeechProcessing && (
            <span className="flex items-center gap-2 text-sm text-primary">
              <Loader2 className="h-3 w-3 animate-spin" />
              Transcribing...
            </span>
          )}
          {!isVoiceSupported && (
            <span className="text-xs text-muted-foreground">
              Voice input not supported
            </span>
          )}
          {!isRecording && !isSpeechProcessing && (
            <span className="hidden sm:inline text-xs text-muted-foreground">
              Ctrl+Enter to submit
            </span>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={!text.trim() || isProcessing}
          className="min-w-[100px]"
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
