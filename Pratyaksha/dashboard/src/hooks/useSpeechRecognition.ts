import { useState, useCallback, useEffect, useRef } from "react"

interface SpeechRecognitionHook {
  transcript: string
  interimTranscript: string
  isListening: boolean
  isSupported: boolean
  error: string | null
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  isFinal: boolean
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: Event & { error?: string }) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const isActiveRef = useRef(false)

  // Check browser support
  const isSupported = typeof window !== "undefined" &&
    ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)

  // Initialize recognition once
  useEffect(() => {
    if (!isSupported) return

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognitionAPI()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      let currentInterim = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          currentInterim += result[0].transcript
        }
      }

      // Always update interim transcript for real-time feedback
      setInterimTranscript(currentInterim)

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript)
        setInterimTranscript("")
      }
    }

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event)
      const errorType = event.error || "unknown"

      // Provide user-friendly error messages
      const errorMessages: Record<string, string> = {
        "not-allowed": "Microphone access denied. Please allow microphone permissions in your browser.",
        "no-speech": "No speech detected. Please try speaking again.",
        "audio-capture": "No microphone found. Please check your microphone connection.",
        "network": "Network error. Please check your internet connection.",
        "aborted": "Recording was cancelled.",
        "service-not-allowed": "Speech recognition service not available.",
      }

      const message = errorMessages[errorType] || `Speech recognition error: ${errorType}`
      setError(message)
      setIsListening(false)
      isActiveRef.current = false
    }

    recognition.onend = () => {
      // Only restart if we're supposed to be active
      if (isActiveRef.current) {
        // Try to restart after a brief delay
        setTimeout(() => {
          if (isActiveRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              // If restart fails, stop completely
              isActiveRef.current = false
              setIsListening(false)
            }
          }
        }, 100)
      } else {
        setIsListening(false)
      }
    }

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognitionRef.current = recognition

    return () => {
      isActiveRef.current = false
      try {
        recognition.abort()
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  }, [isSupported])

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isActiveRef.current) return

    setError(null)
    isActiveRef.current = true

    try {
      recognitionRef.current.start()
    } catch (error) {
      // Handle "already started" error gracefully
      if (error instanceof Error && error.name === "InvalidStateError") {
        // Already running, just update state
        setIsListening(true)
      } else {
        console.error("Failed to start speech recognition:", error)
        setError("Failed to start voice recording. Please try again.")
        isActiveRef.current = false
      }
    }
  }, [])

  const stopListening = useCallback(() => {
    isActiveRef.current = false
    setInterimTranscript("")

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {
        // Ignore stop errors
      }
    }
    setIsListening(false)
  }, [])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  return {
    transcript,
    interimTranscript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}
