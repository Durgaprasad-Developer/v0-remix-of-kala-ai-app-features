import { GoogleSpeechClient } from "@/lib/google-speech-client"

const GOOGLE_API_KEY = "AIzaSyDDmK5_IIcHouK5C8D4xRBJ-aAZB6uHmws"

export async function POST(req: Request) {
  try {
    const { audioBase64, language = "en" } = await req.json()

    if (!audioBase64) {
      return Response.json({ error: "Audio data is required" }, { status: 400 })
    }

    const speechClient = new GoogleSpeechClient(GOOGLE_API_KEY)
    const languageCode = speechClient.getLanguageCode(language)

    const transcript = await speechClient.speechToText(audioBase64, languageCode)

    return Response.json({
      success: true,
      transcript,
      language: languageCode,
    })
  } catch (error) {
    console.error("Error converting speech to text:", error)
    return Response.json({ error: "Failed to convert speech to text" }, { status: 500 })
  }
}
