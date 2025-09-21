import { GoogleVisionClient } from "@/lib/google-vision-client"
import { GeminiClient } from "@/lib/gemini-client"

const GOOGLE_API_KEY = "AIzaSyDDmK5_IIcHouK5C8D4xRBJ-aAZB6uHmws"

export async function POST(req: Request) {
  try {
    const { imageBase64, enhanceWithGemini = false } = await req.json()

    if (!imageBase64) {
      return Response.json({ error: "Image data is required" }, { status: 400 })
    }

    if (!imageBase64.includes("base64,") && !imageBase64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      return Response.json({ error: "Invalid image format. Please provide a valid base64 image." }, { status: 400 })
    }

    console.log("[v0] Starting image analysis with base64 length:", imageBase64.length)

    const visionClient = new GoogleVisionClient(GOOGLE_API_KEY)
    const visionResult = await visionClient.analyzeImage(imageBase64)

    console.log("[v0] Vision analysis completed successfully")

    let enhancedResult = visionResult

    if (enhanceWithGemini) {
      try {
        const geminiClient = new GeminiClient(GOOGLE_API_KEY)
        const enhancement = await geminiClient.enhanceImageDescription(imageBase64, visionResult.description)

        enhancedResult = {
          ...visionResult,
          enhancedTitle: enhancement.enhancedTitle,
          enhancedDescription: enhancement.enhancedDescription,
          photographyTips: enhancement.photographyTips,
          mockupSuggestions: enhancement.mockupSuggestions,
          targetAudience: enhancement.targetAudience,
        }
        console.log("[v0] Gemini enhancement completed successfully")
      } catch (geminiError) {
        console.error("[v0] Gemini enhancement failed:", geminiError)
        // Continue with just Vision API results if Gemini fails
      }
    }

    return Response.json({
      success: true,
      analysis: enhancedResult,
    })
  } catch (error) {
    console.error("[v0] Error analyzing image:", error)
    return Response.json(
      {
        error: "Failed to analyze image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
