import { useEffect, useRef } from "react"
import { MessageSquare, Trash2, AlertCircle } from "lucide-react"
import { useChat } from "../hooks/useChat"
import { ChatMessage } from "../components/chat/ChatMessage"
import { ChatInput } from "../components/chat/ChatInput"
import { QuickPrompts } from "../components/chat/QuickPrompts"
import { Button } from "../components/ui/button"
import { toast } from "sonner"

export function Chat() {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { messages, isLoading, error, sendMessage, clearMessages } = useChat({
    onError: (err) => {
      toast.error(err.message || "Failed to get response")
    },
  })

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = (message: string) => {
    sendMessage(message)
  }

  return (
    <div className="container mx-auto max-w-4xl h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Pratyaksha AI</h1>
            <p className="text-xs text-muted-foreground">
              Chat about your journal insights
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-8">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center mb-4">
              <MessageSquare className="h-8 w-8 text-violet-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Ask me anything</h2>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              I have access to all your journal entries and can help you discover patterns,
              understand your emotions, and provide personalized insights.
            </p>
            <QuickPrompts onSelect={handleSend} disabled={isLoading} />
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 rounded-lg bg-card border">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium">Pratyaksha AI</span>
                  <p className="text-sm text-muted-foreground">Thinking...</p>
                </div>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                {error.message}
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </div>
  )
}
