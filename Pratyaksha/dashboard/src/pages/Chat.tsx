import { useEffect, useRef, useState, useMemo } from "react"
import { AlertCircle, Sparkles, RotateCcw } from "lucide-react"
import { useChat } from "../hooks/useChat"
import { useKarma } from "../contexts/KarmaContext"
import { ChatMessage } from "../components/chat/ChatMessage"
import { ChatInput } from "../components/chat/ChatInput"
import { ChatEmptyState } from "../components/chat/ChatEmptyState"
import { TypingIndicator } from "../components/chat/TypingIndicator"
import { FollowUpSuggestions } from "../components/chat/FollowUpSuggestions"
import { InsufficientKarmaDialog } from "../components/gamification/InsufficientKarmaDialog"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { DemoBanner } from "../components/layout/DemoBanner"

export function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showKarmaDialog, setShowKarmaDialog] = useState(false)

  const { canAfford, spendKarma, karma } = useKarma()

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({
    onError: (err) => {
      toast.error(err.message || "Failed to get response")
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show follow-up suggestions after AI responds
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === "assistant" && !isLoading) {
      const timer = setTimeout(() => setShowFollowUp(true), 500)
      return () => clearTimeout(timer)
    }
    setShowFollowUp(false)
  }, [messages, isLoading])

  // Determine follow-up context based on conversation
  const followUpContext = useMemo(() => {
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage || lastMessage.role !== "assistant") return "general"

    const content = lastMessage.content.toLowerCase()
    if (content.includes("pattern") || content.includes("recurring")) return "patterns"
    if (content.includes("emotion") || content.includes("feel") || content.includes("mood")) return "emotions"
    if (content.includes("insight") || content.includes("notice")) return "insights"
    return "general"
  }, [messages])

  const handleSend = (message: string) => {
    // Check if user can afford the AI chat message
    if (!canAfford("AI_CHAT_MESSAGE")) {
      setShowKarmaDialog(true)
      return
    }

    // Deduct Karma
    spendKarma("AI_CHAT_MESSAGE")

    setShowFollowUp(false)
    sendMessage(message)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Demo Mode Banner */}
      <DemoBanner compact />

      <div className="container mx-auto max-w-4xl flex-1 flex flex-col bg-gradient-to-b from-violet-50/30 to-transparent dark:from-violet-950/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              Becoming AI
            </h1>
            <p className="text-xs text-muted-foreground">
              Your personal journal companion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* XP cost badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Sparkles className="h-3 w-3 text-amber-500 flex-shrink-0" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              {karma} XP
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· 50/msg</span>
          </div>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              className="text-muted-foreground hover:text-destructive gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState onSelect={handleSend} disabled={isLoading} />
        ) : (
          <>
            {/* Conversation start indicator */}
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground py-2">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
              <span>Conversation started</span>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {messages.map((message, index) => (
              <ChatMessage
                key={message.id}
                message={message}
                isLatest={index === messages.length - 1}
              />
            ))}

            {/* Typing Indicator */}
            {isLoading && <TypingIndicator />}

            {/* Follow-up Suggestions */}
            {showFollowUp && !isLoading && (
              <FollowUpSuggestions
                onSelect={handleSend}
                disabled={isLoading}
                context={followUpContext as "patterns" | "emotions" | "insights" | "general"}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-2xl",
                "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
                "border border-red-200 dark:border-red-800",
                "animate-in fade-in slide-in-from-bottom-2 duration-300"
              )}>
                <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">Something went wrong</p>
                  <p className="text-xs text-red-600 dark:text-red-500">{error.message}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => sendMessage(messages[messages.length - 2]?.content || "")}
                  className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  Retry
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* XP cost notice */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 border-t bg-amber-500/5 text-xs text-amber-600 dark:text-amber-400">
        <Sparkles className="h-3 w-3" />
        <span>Each message costs <strong>50 XP</strong> · You have <strong>{karma} XP</strong></span>
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />

      {/* Insufficient Karma Dialog */}
      <InsufficientKarmaDialog
        open={showKarmaDialog}
        onOpenChange={setShowKarmaDialog}
        requiredCost="AI_CHAT_MESSAGE"
        action="AI Chat"
      />
      </div>
    </div>
  )
}
