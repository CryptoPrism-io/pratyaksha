import { useEffect, useRef, useState, useMemo } from "react"
import { AlertCircle, Sparkles, Plus, RotateCcw } from "lucide-react"
import { useChat } from "../hooks/useChat"
import { useKarma } from "../contexts/KarmaContext"
import { ChatMessage } from "../components/chat/ChatMessage"
import { ChatInput } from "../components/chat/ChatInput"
import { ChatEmptyState } from "../components/chat/ChatEmptyState"
import { TypingIndicator } from "../components/chat/TypingIndicator"
import { FollowUpSuggestions } from "../components/chat/FollowUpSuggestions"
import { ModePicker } from "../components/chat/ModePicker"
import { ThreadHistory } from "../components/chat/ThreadHistory"
import { InsufficientKarmaDialog } from "../components/gamification/InsufficientKarmaDialog"
import { Button } from "../components/ui/button"
import { toast } from "sonner"
import { cn } from "../lib/utils"
import { DemoBanner } from "../components/layout/DemoBanner"
import { getModeMeta } from "../config/chatModes"
import { KARMA_COSTS } from "../lib/gamificationStorage"

export function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showFollowUp, setShowFollowUp] = useState(false)
  const [showKarmaDialog, setShowKarmaDialog] = useState(false)

  const { canAfford, spendKarma, karma, isUnlimited } = useKarma()
  const karmaDisplay = isUnlimited ? "∞" : `${karma}`

  const {
    messages,
    isLoading,
    isStreaming,
    error,
    mode,
    setMode,
    sendMessage,
    stop,
    newChat,
    setReaction,
    followups,
    threads,
    activeThreadId,
    loadThread,
    deleteThread,
  } = useChat({
    onError: (err) => {
      toast.error(err.message || "Failed to get response")
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Show follow-up suggestions after AI finishes responding
  useEffect(() => {
    const last = messages[messages.length - 1]
    if (last && last.role === "assistant" && last.content.trim() && !isLoading && !isStreaming) {
      const timer = setTimeout(() => setShowFollowUp(true), 500)
      return () => clearTimeout(timer)
    }
    setShowFollowUp(false)
  }, [messages, isLoading, isStreaming])

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

  // Active persona's cost (Shiva > Krishna > Rama)
  const activeMeta = getModeMeta(mode)
  const costKey = activeMeta.costKey
  const messageCost = KARMA_COSTS[costKey]

  const handleSend = (message: string) => {
    // Check if user can afford this persona's message cost
    if (!canAfford(costKey)) {
      setShowKarmaDialog(true)
      return
    }

    // Deduct Karma for the active persona
    spendKarma(costKey)

    setShowFollowUp(false)
    sendMessage(message)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Demo Mode Banner */}
      <DemoBanner compact />

      <div className="container mx-auto max-w-4xl flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-11 w-11 rounded-2xl bg-violet-600 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-teal-500 border-2 border-background" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Becoming AI
            </h1>
            <p className="text-xs text-muted-foreground">
              Your personal journal companion
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Mode picker */}
          <ModePicker value={mode} onChange={setMode} disabled={isLoading || isStreaming} />

          {/* Conversation history */}
          <ThreadHistory
            threads={threads}
            activeThreadId={activeThreadId}
            onSelect={loadThread}
            onDelete={deleteThread}
            onNew={newChat}
          />

          {/* XP badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20">
            <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <span className="text-xs font-medium text-teal-600 dark:text-teal-400 signal-data">
              {karmaDisplay} XP
            </span>
          </div>

          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={newChat}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <ChatEmptyState onSelect={handleSend} disabled={isLoading} starters={activeMeta.starters} />
        ) : (
          <>
            {/* Conversation start indicator */}
            <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground py-2">
              <div className="h-px flex-1 bg-border" />
              <span>Conversation started</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {messages
              // Hide the assistant placeholder until its first token arrives
              .filter((m) => m.role === "user" || m.content.trim().length > 0)
              .map((message, index, arr) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLatest={index === arr.length - 1}
                  onReact={
                    message.role === "assistant"
                      ? (reaction) => setReaction(message.id, reaction)
                      : undefined
                  }
                />
              ))}

            {/* Typing Indicator — only before the first token streams in */}
            {isLoading && !isStreaming && <TypingIndicator />}

            {/* Follow-up Suggestions */}
            {showFollowUp && !isLoading && (
              <FollowUpSuggestions
                onSelect={handleSend}
                disabled={isLoading}
                context={followUpContext as "patterns" | "emotions" | "insights" | "general"}
                suggestions={followups}
              />
            )}

            {/* Error Display */}
            {error && (
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-2xl",
                "bg-red-500/10 border border-red-500/30",
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

      {/* XP cost notice — per active persona */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 border-t bg-teal-500/5 text-xs text-teal-600 dark:text-teal-400">
        <Sparkles className="h-3 w-3" />
        <span>{isUnlimited ? (
          <><strong>{activeMeta.label}</strong> · Unlimited access <strong>∞</strong></>
        ) : (
          <><strong>{activeMeta.label}</strong> costs <strong>{messageCost} XP</strong>/message · You have <strong>{karma} XP</strong></>
        )}</span>
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isLoading={isLoading}
        isStreaming={isStreaming}
        onStop={stop}
      />

      {/* Insufficient Karma Dialog */}
      <InsufficientKarmaDialog
        open={showKarmaDialog}
        onOpenChange={setShowKarmaDialog}
        requiredCost={costKey}
        action={`${activeMeta.label} chat`}
      />
      </div>
    </div>
  )
}
