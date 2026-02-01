import { useState, useRef, useCallback, useEffect } from "react"

export interface SpeechResult {
  rawText: string
  cleanedText: string
  suggestedType: string
  suggestedTags: string[]
  confidence: number
  duration?: number
}

interface UseSpeechToTextOptions {
  onTranscript?: (result: SpeechResult) => void
  onError?: (error: string) => void
  processIntent?: boolean // If true, uses /process endpoint (slower but smarter)
}

// Keep a module-level stream reference to persist across hook instances
let sharedStreamRef: MediaStream | null = null
let streamAcquirePromise: Promise<MediaStream> | null = null

/**
 * Get or create a shared microphone stream.
 * This prevents repeated permission prompts by reusing the same stream.
 */
async function getSharedMicrophoneStream(): Promise<MediaStream> {
  // If we already have an active stream, return it
  if (sharedStreamRef && sharedStreamRef.active) {
    return sharedStreamRef
  }

  // If we're already acquiring a stream, wait for it
  if (streamAcquirePromise) {
    return streamAcquirePromise
  }

  // Acquire a new stream
  streamAcquirePromise = navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      sampleRate: 16000,
    },
  })

  try {
    sharedStreamRef = await streamAcquirePromise
    console.log("[SpeechToText] Microphone stream acquired")
    return sharedStreamRef
  } finally {
    streamAcquirePromise = null
  }
}

/**
 * Release the shared microphone stream.
 * Call this when the app is backgrounded or user navigates away.
 */
export function releaseMicrophoneStream(): void {
  if (sharedStreamRef) {
    sharedStreamRef.getTracks().forEach(track => track.stop())
    sharedStreamRef = null
    console.log("[SpeechToText] Microphone stream released")
  }
}

export function useSpeechToText(options: UseSpeechToTextOptions = {}) {
  const { onTranscript, onError, processIntent = true } = options

  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState<SpeechResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const localStreamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Clean up stream when component unmounts (but keep shared stream alive)
  useEffect(() => {
    return () => {
      // Stop any active recording
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop()
      }
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Release stream when page is hidden (battery optimization)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isRecording) {
        // Release stream when app goes to background and not recording
        releaseMicrophoneStream()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isRecording])

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscript("")
      setResult(null)
      setDuration(0)
      chunksRef.current = []

      // Get shared microphone stream (reuses existing permission)
      const stream = await getSharedMicrophoneStream()
      localStreamRef.current = stream

      // Create MediaRecorder with webm format (supported by Groq)
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      })
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        // DON'T stop the tracks here - keep the stream alive for next recording
        // The stream will be released when the page is hidden or explicitly released

        // Create audio blob
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" })

        // Check file size (max 25MB for free tier)
        if (audioBlob.size > 25 * 1024 * 1024) {
          const errMsg = "Recording too long (max 25MB). Please try a shorter recording."
          setError(errMsg)
          onError?.(errMsg)
          return
        }

        // Process audio
        await processAudio(audioBlob)
      }

      // Start recording with 1-second chunks
      mediaRecorder.start(1000)
      setIsRecording(true)

      // Start duration timer
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1)
      }, 1000)

    } catch (err) {
      const errMsg = err instanceof Error
        ? (err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone in browser settings."
          : err.message)
        : "Failed to access microphone"
      setError(errMsg)
      onError?.(errMsg)
    }
  }, [onError])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isRecording])

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, "recording.webm")

      const endpoint = processIntent ? "/api/speech/process" : "/api/speech/transcribe"

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (processIntent) {
        const speechResult: SpeechResult = {
          rawText: data.rawText || "",
          cleanedText: data.cleanedText || data.rawText || "",
          suggestedType: data.suggestedType || "Reflection",
          suggestedTags: data.suggestedTags || [],
          confidence: data.confidence || 0.5,
          duration: data.duration,
        }
        setResult(speechResult)
        setTranscript(speechResult.cleanedText)
        onTranscript?.(speechResult)
      } else {
        const speechResult: SpeechResult = {
          rawText: data.text || "",
          cleanedText: data.text || "",
          suggestedType: "Reflection",
          suggestedTags: [],
          confidence: 1,
          duration: data.duration,
        }
        setResult(speechResult)
        setTranscript(speechResult.rawText)
        onTranscript?.(speechResult)
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Failed to process audio"
      setError(errMsg)
      onError?.(errMsg)
    } finally {
      setIsProcessing(false)
    }
  }

  const reset = useCallback(() => {
    setTranscript("")
    setResult(null)
    setError(null)
    setDuration(0)
  }, [])

  return {
    isRecording,
    isProcessing,
    transcript,
    result,
    error,
    duration,
    startRecording,
    stopRecording,
    reset,
  }
}
