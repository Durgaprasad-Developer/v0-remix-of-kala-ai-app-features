import { GoogleSpeechClient } from "@/lib/google-speech-client"

const GOOGLE_API_KEY = "AIzaSyDDmK5_IIcHouK5C8D4xRBJ-aAZB6uHmws"

export async function POST(req: Request) {
  try {
    const { text, language = "en" } = await req.json()

    if (!text) {
      return Response.json({ error: "Text is required" }, { status: 400 })
    }

    const speechClient = new GoogleSpeechClient(GOOGLE_API_KEY)
    const languageCode = speechClient.getLanguageCode(language)

    const audioContent = await speechClient.textToSpeech(text, languageCode)

    return Response.json({
      success: true,
      audioContent,
      language: languageCode,
    })
  } catch (error) {
    console.error("Error converting text to speech:", error)
    return Response.json({ error: "Failed to convert text to speech" }, { status: 500 })
  }
}
