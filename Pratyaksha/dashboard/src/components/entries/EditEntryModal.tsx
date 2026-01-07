import { useState, useEffect } from "react"
import { Loader2, Save, Brain, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { useUpdateEntry } from "../../hooks/useEntries"
import { toast } from "sonner"
import { cn } from "../../lib/utils"
import type { Entry } from "../../lib/airtable"

interface EditEntryModalProps {
  entry: Entry | null
  onClose: () => void
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
  { label: "Saving changes...", icon: "brain" },
]

export function EditEntryModal({ entry, onClose }: EditEntryModalProps) {
  const [text, setText] = useState("")
  const [processingStep, setProcessingStep] = useState(0)
  const updateEntry = useUpdateEntry()

  // Reset text when entry changes
  useEffect(() => {
    if (entry) {
      setText(entry.text)
      setProcessingStep(0)
    }
  }, [entry])

  const handleSave = async () => {
    if (!entry || !text.trim()) return

    // Start processing animation
    setProcessingStep(0)
    const stepInterval = setInterval(() => {
      setProcessingStep((prev) => Math.min(prev + 1, PROCESSING_STEPS.length - 1))
    }, 1500)

    try {
      const result = await updateEntry.mutateAsync({
        recordId: entry.id,
        text: text.trim(),
      })

      clearInterval(stepInterval)

      if (result.success) {
        toast.success("Entry updated!", {
          description: "AI has re-analyzed your entry.",
        })
        onClose()
      } else {
        toast.error("Update failed", {
          description: result.error || "Please try again.",
        })
      }
    } catch (error) {
      clearInterval(stepInterval)
      toast.error("Update failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      })
    }
  }

  if (!entry) return null

  const isProcessing = updateEntry.isPending
  const currentStep = PROCESSING_STEPS[processingStep]

  return (
    <Dialog open={!!entry} onOpenChange={() => !isProcessing && onClose()}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogDescription>
            Original: {new Date(entry.date).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Text editor */}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className={cn(
              "min-h-[200px] w-full rounded-lg border bg-background p-4 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary",
              "resize-none",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
            placeholder="Edit your journal entry..."
            disabled={isProcessing}
          />

          {/* Character/word count */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
            <span>{text.length} / 5000 characters</span>
          </div>

          {/* Processing indicator */}
          {isProcessing && currentStep && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                {currentStep.icon === "brain" ? (
                  <Brain className="h-5 w-5 animate-pulse text-primary" />
                ) : (
                  <Sparkles className="h-5 w-5 animate-pulse text-primary" />
                )}
                <div>
                  <p className="text-sm font-medium">{currentStep.label}</p>
                  <p className="text-xs text-muted-foreground">
                    Re-analyzing with AI...
                  </p>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex gap-1.5 mt-3">
                {PROCESSING_STEPS.map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition-colors",
                      i <= processingStep ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isProcessing || !text.trim() || text === entry.text}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save & Re-analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
