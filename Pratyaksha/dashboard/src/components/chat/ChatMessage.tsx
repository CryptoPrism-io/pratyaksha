import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { cn } from "../../lib/utils"
import { User, Bot, Copy, Check, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react"
import { toast } from "sonner"

export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatMessageProps {
  message: Message
  isLatest?: boolean
}

export function ChatMessage({ message, isLatest = false }: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)
  const [reaction, setReaction] = useState<"up" | "down" | null>(null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy")
    }
  }

  const handleReaction = (type: "up" | "down") => {
    setReaction(reaction === type ? null : type)
    if (reaction !== type) {
      toast.success(type === "up" ? "Thanks for the feedback!" : "We'll try to improve")
    }
  }

  return (
    <div
      className={cn(
        "group relative flex gap-3 p-4 rounded-2xl transition-all duration-300",
        isUser
          ? "bg-gradient-to-r from-primary/10 to-primary/5 ml-8"
          : "bg-gradient-to-r from-violet-500/5 to-purple-500/5 mr-8 border border-violet-200/20",
        isLatest && !isUser && "animate-in fade-in slide-in-from-bottom-2 duration-500"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 h-10 w-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/80"
            : "bg-gradient-to-br from-violet-500 to-purple-600"
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-semibold",
            isUser ? "text-primary" : "text-violet-600 dark:text-violet-400"
          )}>
            {isUser ? "You" : "Pratyaksha AI"}
          </span>
          {!isUser && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-[10px] font-medium text-violet-600 dark:text-violet-400">
              <Sparkles className="h-2.5 w-2.5" />
              AI
            </span>
          )}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {/* Message Content */}
        <div className={cn(
          "text-sm leading-relaxed",
          isUser ? "text-foreground" : "prose prose-sm dark:prose-invert max-w-none"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <ReactMarkdown
              components={{
                // Style headings
                h1: ({ children }) => <h1 className="text-lg font-bold mt-4 mb-2 text-violet-700 dark:text-violet-300">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-semibold mt-3 mb-2 text-violet-600 dark:text-violet-400">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>,
                // Style paragraphs
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                // Style lists
                ul: ({ children }) => <ul className="list-none space-y-1 my-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="text-violet-500 mt-1">•</span>
                    <span>{children}</span>
                  </li>
                ),
                // Style emphasis
                strong: ({ children }) => <strong className="font-semibold text-violet-700 dark:text-violet-300">{children}</strong>,
                em: ({ children }) => <em className="italic text-muted-foreground">{children}</em>,
                // Style code
                code: ({ children }) => (
                  <code className="px-1.5 py-0.5 rounded bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-mono">
                    {children}
                  </code>
                ),
                // Style blockquotes for insights
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-violet-400 pl-4 py-2 my-3 bg-violet-50 dark:bg-violet-900/20 rounded-r-lg italic">
                    {children}
                  </blockquote>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Actions for AI messages */}
        {!isUser && (
          <div className="flex items-center gap-1 pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs",
                "text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              )}
            >
              {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <div className="w-px h-4 bg-border mx-1" />
            <button
              onClick={() => handleReaction("up")}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors",
                reaction === "up"
                  ? "text-green-600 bg-green-50 dark:bg-green-900/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <ThumbsUp className="h-3 w-3" />
            </button>
            <button
              onClick={() => handleReaction("down")}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors",
                reaction === "down"
                  ? "text-red-600 bg-red-50 dark:bg-red-900/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <ThumbsDown className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
