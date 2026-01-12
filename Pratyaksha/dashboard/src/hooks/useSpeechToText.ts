import { useState, useRef, useCallback } from "react"

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
  const streamRef = useRef<MediaStream | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      setTranscript("")
      setResult(null)
      setDuration(0)
      chunksRef.current = []

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000,
        },
      })
      streamRef.current = stream

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
        // Stop all tracks
        streamRef.current?.getTracks().forEach((track) => track.stop())

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
      const errMsg = err instanceof Error ? err.message : "Failed to access microphone"
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
