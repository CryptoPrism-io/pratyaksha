import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Send, Loader2, Brain, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "../../lib/utils"
import { ERROR_MESSAGES } from "../../lib/errorMessages"
import confetti from "canvas-confetti"

// Streak tracking utilities
const STREAK_KEY = "pratyaksha-streak"
const LAST_ENTRY_KEY = "pratyaksha-last-entry"

function getStreakData(): { count: number; lastDate: string | null } {
  const count = parseInt(localStorage.getItem(STREAK_KEY) || "0", 10)
  const lastDate = localStorage.getItem(LAST_ENTRY_KEY)
  return { count, lastDate }
}

function updateStreak(): { count: number; isFirst: boolean } {
  const { count, lastDate } = getStreakData()
  const today = new Date().toDateString()

  // Check if first ever entry
  const isFirst = count === 0 && !lastDate

  if (lastDate === today) {
    // Already logged today - no streak change
    return { count, isFirst: false }
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  let newCount: number
  if (lastDate === yesterday.toDateString()) {
    // Continuing streak
    newCount = count + 1
  } else {
    // Streak broken or first entry
    newCount = 1
  }

  localStorage.setItem(STREAK_KEY, String(newCount))
  localStorage.setItem(LAST_ENTRY_KEY, today)

  return { count: newCount, isFirst }
}

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

  const queryClient = useQueryClient()

  const {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  // Show speech recognition errors to user
  useEffect(() => {
    if (speechError) {
      toast.error("Voice Recording Issue", {
        description: ERROR_MESSAGES.VOICE_ERROR,
      })
    }
  }, [speechError])

  // Append transcript to text as speech is recognized
  useEffect(() => {
    if (transcript) {
      setText((prev) => {
        // Add space if there's existing text
        if (prev && !prev.endsWith(" ")) {
          return prev + " " + transcript
        }
        return prev + transcript
      })
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  const isTogglingRef = useRef(false)

  const handleToggleMic = () => {
    // Debounce rapid clicks
    if (isTogglingRef.current) return
    isTogglingRef.current = true

    if (isListening) {
      stopListening()
    } else {
      startListening()
    }

    // Reset after a short delay
    setTimeout(() => {
      isTogglingRef.current = false
    }, 300)
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
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => {
        if (prev < PROCESSING_STEPS.length - 1) return prev + 1
        return prev
      })
    }, 1500)

    try {
      const response = await fetch("/api/process-entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to process entry")
      }

      if (result.success) {
        // Invalidate entries query to refresh the list
        queryClient.invalidateQueries({ queryKey: ["entries"] })

        // Update streak and check if first entry
        const { count: streakCount, isFirst } = updateStreak()

        // Trigger confetti for first entry
        if (isFirst) {
          triggerConfetti()
          toast.success("Welcome to Pratyaksha!", {
            description: "Your first entry has been logged. Your journey begins now!",
            duration: 5000,
          })
        } else {
          // Show streak toast
          toast.success("Entry saved!", {
            description: streakCount > 1
              ? `Day ${streakCount} streak! Keep the momentum going.`
              : `"${result.entry?.fields?.Name || "New Entry"}" has been logged.`,
          })
        }

        setText("")
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to process entry:", error)
      toast.error("Entry Not Saved", {
        description: ERROR_MESSAGES.PROCESS_ENTRY,
      })
    } finally {
      clearInterval(stepInterval)
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
        <h2 className="text-xl font-semibold">Log New Entry</h2>
        <p className="text-sm text-muted-foreground mt-1">AI will automatically classify your entry</p>
      </div>

      <div className="relative">
        <textarea
          value={text + (interimTranscript ? (text && !text.endsWith(" ") ? " " : "") + interimTranscript : "")}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && text.trim() && !isProcessing) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder={
            isListening
              ? "Listening... speak now"
              : "What's on your mind? Type or tap the mic to speak..."
          }
          className={cn(
            "min-h-[150px] w-full resize-none rounded-lg border bg-background p-4 pr-14 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
            isListening && "border-primary ring-2 ring-primary/20"
          )}
          disabled={isProcessing}
          readOnly={isListening}
        />

        {/* Mic button */}
        {isSupported && (
          <button
            type="button"
            onClick={handleToggleMic}
            disabled={isProcessing}
            className={cn(
              "absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full transition-all",
              isListening
                ? "animate-pulse bg-red-500 text-white hover:bg-red-600"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            )}
            aria-label={isListening ? "Stop recording" : "Start recording"}
          >
            {isListening ? (
              <MicOff className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </button>
        )}
      </div>

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
          {isListening && (
            <span className="flex items-center gap-2 text-sm text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {interimTranscript ? "Hearing you..." : "Recording..."}
            </span>
          )}
          {!isSupported && (
            <span className="text-xs text-muted-foreground">
              Voice input not supported
            </span>
          )}
          {!isListening && (
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
