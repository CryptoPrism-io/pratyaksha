import { useState, useCallback, useMemo } from "react"
import type { Message } from "../components/chat/ChatMessage"
import { loadLifeBlueprint, getBlueprintForAI, hasBlueprintForAI } from "../lib/lifeBlueprintStorage"
import { loadGamificationState, getCurrentUnlockLevel } from "../lib/gamificationStorage"
import { loadOnboardingProfile } from "../lib/onboardingStorage"

// UserContext type that matches server's expected format
interface UserContext {
  soulMapping: {
    completedTopics: string[];
    totalCompleted: number;
    currentTier: "surface" | "deep" | "core";
  };
  blueprint: {
    vision: Array<{ text: string; category: string }>;
    antiVision: Array<{ text: string; category: string }>;
    levers: Array<{ name: string; description: string; pushesToward: string }>;
    timeHorizonGoals: {
      sixMonths: string[];
      oneYear: string[];
      threeYears: string[];
      fiveYears: string[];
      tenYears: string[];
    };
    keyReflections: Record<string, string>;
    completedSections: string[];
  };
  profile: {
    displayName: string;
    ageRange: string | null;
    profession: string | null;
    stressLevel: number | null;
    emotionalOpenness: number | null;
    personalGoal: string | null;
    selectedMemoryTopics: string[];
  };
  stats: {
    totalEntries: number;
    streakDays: number;
    karmaPoints: number;
  };
}

/**
 * Build user context from localStorage data for personalized AI chat
 */
function buildUserContext(): UserContext | null {
  try {
    // Load all sources
    const blueprint = loadLifeBlueprint();
    const gamification = loadGamificationState();
    const profile = loadOnboardingProfile();

    // Check if there's any meaningful context to send
    const hasBlueprint = hasBlueprintForAI(blueprint);
    const hasSoulMapping = gamification.completedSoulMappingTopics.length > 0;
    const hasProfile = profile.displayName || profile.personalGoal || profile.stressLevel;

    if (!hasBlueprint && !hasSoulMapping && !hasProfile) {
      return null; // No meaningful context
    }

    // Build the context object
    const blueprintData = getBlueprintForAI(blueprint);

    return {
      soulMapping: {
        completedTopics: gamification.completedSoulMappingTopics,
        totalCompleted: gamification.completedSoulMappingTopics.length,
        currentTier: getCurrentUnlockLevel(gamification.totalEntriesLogged),
      },
      blueprint: blueprintData,
      profile: {
        displayName: profile.displayName || "",
        ageRange: profile.ageRange,
        profession: profile.profession,
        stressLevel: profile.stressLevel,
        emotionalOpenness: profile.emotionalOpenness,
        personalGoal: profile.personalGoal,
        selectedMemoryTopics: profile.selectedMemoryTopics,
      },
      stats: {
        totalEntries: gamification.totalEntriesLogged,
        streakDays: gamification.streakDays,
        karmaPoints: gamification.karma,
      },
    };
  } catch (error) {
    console.error("[useChat] Failed to build user context:", error);
    return null;
  }
}

interface UseChatOptions {
  onError?: (error: Error) => void
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Build user context once per hook instance (refreshes on new chat sessions)
  const userContext = useMemo(() => buildUserContext(), [])

  const sendMessage = useCallback(async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: content,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content,
          })),
          // Include user context for personalization
          userContext: userContext,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Chat request failed: ${response.status}`)
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error")
      setError(error)
      options.onError?.(error)
    } finally {
      setIsLoading(false)
    }
  }, [messages, options])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  }
}
