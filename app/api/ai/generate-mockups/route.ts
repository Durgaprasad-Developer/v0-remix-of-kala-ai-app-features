import { GeminiClient } from "@/lib/gemini-client"

const GOOGLE_API_KEY = "AIzaSyDDmK5_IIcHouK5C8D4xRBJ-aAZB6uHmws"

export async function POST(req: Request) {
  try {
    const { imageBase64, productType = "handcrafted item" } = await req.json()

    if (!imageBase64) {
      return Response.json({ error: "Image data is required" }, { status: 400 })
    }

    const geminiClient = new GeminiClient(GOOGLE_API_KEY)
    const mockupSuggestions = await geminiClient.generateMockupSuggestions(productType, imageBase64)

    return Response.json({
      success: true,
      mockupSuggestions,
      productType,
    })
  } catch (error) {
    console.error("Error generating mockups:", error)
    return Response.json({ error: "Failed to generate mockup suggestions" }, { status: 500 })
  }
}
