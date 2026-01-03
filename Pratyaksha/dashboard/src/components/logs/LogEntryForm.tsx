import { useState, useEffect, useRef } from "react"
import { Mic, MicOff, Send, Loader2, Brain, Sparkles } from "lucide-react"
import { Button } from "../ui/button"
import { useSpeechRecognition } from "../../hooks/useSpeechRecognition"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { cn } from "../../lib/utils"

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
      toast.error("Voice Recording Error", {
        description: speechError,
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
      toast.error("Please enter some text for your entry")
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
        toast.success("Entry logged with AI analysis!", {
          description: `"${result.entry?.fields?.Name || "New Entry"}" has been saved.`,
        })
        setText("")
        onSuccess?.()
      }
    } catch (error) {
      console.error("Failed to process entry:", error)
      toast.error("Failed to log entry", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      clearInterval(stepInterval)
      setIsProcessing(false)
      setProcessingStep(0)
    }
  }

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

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
          {isListening && (
            <span className="flex items-center gap-2 text-sm text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              {interimTranscript ? "Hearing you..." : "Recording..."}
            </span>
          )}
          {!isSupported && (
            <span className="text-xs text-muted-foreground">
              Voice input not supported in this browser
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
