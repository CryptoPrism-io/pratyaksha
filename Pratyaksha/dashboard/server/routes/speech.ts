import { Router } from "express"
import Groq from "groq-sdk"
import multer from "multer"

const router = Router()

// Configure multer for audio file uploads (max 25MB for free tier)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
})

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Intent LLM prompt for cleaning transcripts
const INTENT_PROMPT = `You are processing a voice journal entry. The raw transcript may contain:
- Filler words ("um", "like", "you know")
- Incomplete sentences
- Corrections ("I mean", "actually")
- Background noise artifacts

Your task:
1. Clean the transcript into coherent sentences
2. Preserve the user's emotional tone and meaning
3. Suggest an entry type from: Emotional, Cognitive, Work, Health, Reflection, Creative, Social, Spiritual, Goal, Gratitude, Problem, Decision, Memory, Learning, Observation
4. Extract 3-5 theme tags
5. Rate your confidence in the suggestions (0-1)

Respond in JSON format only.`

interface IntentResponse {
  cleanedText: string
  suggestedType: string
  suggestedTags: string[]
  confidence: number
}

// POST /api/speech/transcribe - Transcribe audio using Groq Whisper
router.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" })
    }

    console.log("[Speech] Received audio file:", {
      mimetype: req.file.mimetype,
      size: req.file.size,
    })

    // Create a File object from the buffer for Groq
    const audioFile = new File([req.file.buffer], "audio.webm", {
      type: req.file.mimetype,
    })

    // Step 1: Transcribe with Groq Whisper
    console.log("[Speech] Transcribing with Groq Whisper...")
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
    })

    console.log("[Speech] Transcription complete:", transcription.text?.substring(0, 100))

    // Return raw transcription
    res.json({
      text: transcription.text,
      duration: transcription.duration,
      language: transcription.language,
    })
  } catch (error) {
    console.error("[Speech] Transcription error:", error)
    res.status(500).json({
      error: "Transcription failed",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
})

// POST /api/speech/process - Transcribe + Intent understanding
router.post("/process", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" })
    }

    console.log("[Speech] Processing audio file:", {
      mimetype: req.file.mimetype,
      size: req.file.size,
    })

    // Create a File object from the buffer
    const audioFile = new File([req.file.buffer], "audio.webm", {
      type: req.file.mimetype,
    })

    // Step 1: Transcribe with Groq Whisper
    console.log("[Speech] Step 1: Transcribing with Groq Whisper...")
    const transcription = await groq.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-large-v3-turbo",
      temperature: 0,
      response_format: "verbose_json",
    })

    const rawText = transcription.text || ""
    console.log("[Speech] Raw transcript:", rawText.substring(0, 100))

    if (!rawText.trim()) {
      return res.json({
        rawText: "",
        cleanedText: "",
        suggestedType: "Reflection",
        suggestedTags: [],
        confidence: 0,
        duration: transcription.duration,
      })
    }

    // Step 2: Intent understanding with Groq LLM
    console.log("[Speech] Step 2: Understanding intent...")
    const intentResponse = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: INTENT_PROMPT },
        { role: "user", content: rawText },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    })

    const intentContent = intentResponse.choices[0]?.message?.content || "{}"
    let intent: IntentResponse

    try {
      intent = JSON.parse(intentContent)
    } catch {
      console.warn("[Speech] Failed to parse intent response, using defaults")
      intent = {
        cleanedText: rawText,
        suggestedType: "Reflection",
        suggestedTags: [],
        confidence: 0.5,
      }
    }

    console.log("[Speech] Processing complete:", {
      type: intent.suggestedType,
      tags: intent.suggestedTags,
      confidence: intent.confidence,
    })

    res.json({
      rawText,
      cleanedText: intent.cleanedText || rawText,
      suggestedType: intent.suggestedType || "Reflection",
      suggestedTags: intent.suggestedTags || [],
      confidence: intent.confidence || 0.5,
      duration: transcription.duration,
      language: transcription.language,
    })
  } catch (error) {
    console.error("[Speech] Processing error:", error)
    res.status(500).json({
      error: "Speech processing failed",
      details: error instanceof Error ? error.message : "Unknown error"
    })
  }
})

export default router
