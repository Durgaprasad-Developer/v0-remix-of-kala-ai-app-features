import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const productListingSchema = z.object({
  title: z.string().describe("Compelling product title"),
  description: z.string().describe("Detailed product description highlighting craftsmanship"),
  englishCaption: z.string().describe("Social media caption in English"),
  localCaption: z.string().describe("Social media caption in local language (Hindi/Telugu)"),
  hashtags: z.array(z.string()).describe("Relevant hashtags for social media"),
  keyFeatures: z.array(z.string()).describe("Key product features and benefits"),
  suggestedPrice: z
    .object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("INR"),
    })
    .describe("Suggested price range"),
  category: z.string().describe("Product category"),
  tags: z.array(z.string()).describe("Product tags for searchability"),
})

export async function POST(req: Request) {
  try {
    const { imageDescription, voiceTranscript, language = "en", imageBase64 } = await req.json()

    if (!imageDescription && !voiceTranscript && !imageBase64) {
      return Response.json(
        { error: "Either image description, voice transcript, or image data is required" },
        { status: 400 },
      )
    }

    let enhancedImageDescription = imageDescription

    if (imageBase64) {
      try {
        const analysisResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/ai/analyze-image`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64, enhanceWithGemini: true }),
          },
        )

        if (analysisResponse.ok) {
          const analysisData = await analysisResponse.json()
          enhancedImageDescription = analysisData.analysis.enhancedDescription || analysisData.analysis.description
        }
      } catch (error) {
        console.error("Error analyzing image:", error)
        // Continue with original description if analysis fails
      }
    }

    const prompt = `
    You are an AI assistant helping Indian artisans create compelling product listings for their handcrafted items.
    
    Based on the following information, generate a complete product listing:
    ${enhancedImageDescription ? `Product Image Analysis: ${enhancedImageDescription}` : ""}
    ${voiceTranscript ? `Artisan's Voice Description: ${voiceTranscript}` : ""}
    
    Guidelines:
    - Emphasize traditional craftsmanship and cultural heritage
    - Use warm, authentic language that tells the artisan's story
    - Include relevant keywords for online marketplaces
    - Suggest competitive pricing for Indian market
    - Create hashtags that blend traditional and modern appeal
    - Make descriptions marketplace-ready for platforms like Etsy, Amazon, etc.
    - If language is specified as Hindi or Telugu, provide local language content
    - Focus on unique selling points and artisanal value
    `

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: productListingSchema,
      prompt,
      temperature: 0.7,
    })

    return Response.json({ listing: object })
  } catch (error) {
    console.error("Error generating listing:", error)
    return Response.json({ error: "Failed to generate listing" }, { status: 500 })
  }
}
