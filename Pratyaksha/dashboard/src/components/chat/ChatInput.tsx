import { useState, useRef, useEffect } from "react"
import { Send, Loader2, Sparkles } from "lucide-react"
import { cn } from "../../lib/utils"

interface ChatInputProps {
  onSend: (message: string) => void
  isLoading?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, isLoading, placeholder = "Ask about your journal patterns..." }: ChatInputProps) {
  const [input, setInput] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = "auto"
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`
    }
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (trimmed && !isLoading) {
      onSend(trimmed)
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="border-t bg-gradient-to-t from-background via-background to-transparent pt-2">
      <div className={cn(
        "flex gap-2 items-end p-3 mx-4 mb-4 rounded-2xl border-2 transition-all duration-300",
        "bg-background/80 backdrop-blur-sm",
        isFocused
          ? "border-violet-400 dark:border-violet-500 shadow-lg shadow-violet-500/10"
          : "border-border hover:border-violet-300 dark:hover:border-violet-700"
      )}>
        {/* AI indicator */}
        <div className={cn(
          "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
          isFocused
            ? "bg-gradient-to-br from-violet-500 to-purple-600"
            : "bg-muted"
        )}>
          <Sparkles className={cn(
            "h-4 w-4 transition-colors duration-300",
            isFocused ? "text-white" : "text-muted-foreground"
          )} />
        </div>

        {/* Input field */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          disabled={isLoading}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent px-2 py-2 text-sm",
            "placeholder:text-muted-foreground focus:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[36px] max-h-[150px]"
          )}
        />

        {/* Send button */}
        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className={cn(
            "flex-shrink-0 h-9 w-9 rounded-xl flex items-center justify-center transition-all duration-300",
            input.trim() && !isLoading
              ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 hover:scale-105"
              : "bg-muted text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-[10px] text-muted-foreground text-center pb-2">
        Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Shift + Enter</kbd> for new line
      </p>
    </div>
  )
}
