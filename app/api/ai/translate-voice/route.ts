import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { text, sourceLanguage, targetLanguage = "en" } = await req.json()

    if (!text) {
      return Response.json({ error: "Text is required for translation" }, { status: 400 })
    }

    const { text: translatedText } = await generateText({
      model: openai("gpt-4o"),
      prompt: `
      Translate the following text from ${sourceLanguage} to ${targetLanguage}.
      Maintain the original meaning and cultural context, especially for craft-related terms.
      
      Original text: ${text}
      
      Provide only the translation without any additional commentary.
      `,
      maxTokens: 1000,
      temperature: 0.3,
    })

    return Response.json({
      translatedText: translatedText.trim(),
      sourceLanguage,
      targetLanguage,
    })
  } catch (error) {
    console.error("Error translating text:", error)
    return Response.json({ error: "Failed to translate text" }, { status: 500 })
  }
}
