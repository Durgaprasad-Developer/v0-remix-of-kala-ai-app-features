export class GoogleVisionClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async analyzeImage(imageBase64: string) {
    try {
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "")
      const mimeType = this.getMimeType(imageBase64)

      console.log("[v0] Making Gemini Vision API request with cleaned base64 length:", cleanBase64.length)

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this image and provide detailed information about it. Focus on:
1. What type of product or item this is
2. Key visual features, materials, colors, and design elements
3. Potential product category for marketplace listing
4. Suggested title for the product
5. Detailed description highlighting craftsmanship and unique features
6. Relevant hashtags for social media marketing
7. Any text visible in the image

Please format your response as JSON with the following structure:
{
  "title": "suggested product title",
  "description": "detailed product description",
  "category": "product category",
  "features": ["feature1", "feature2", "feature3"],
  "colors": ["color1", "color2"],
  "materials": ["material1", "material2"],
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "textContent": "any visible text",
  "marketingPoints": ["point1", "point2"]
}`,
                },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: cleanBase64,
                  },
                },
              ],
            },
          ],
        }),
      })

      console.log("[v0] Gemini Vision API response status:", response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("[v0] Gemini Vision API error response:", errorText)
        throw new Error(`Gemini Vision API error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const data = await response.json()
      console.log("[v0] Gemini Vision API response received successfully")

      return this.processGeminiResponse(data)
    } catch (error) {
      console.error("[v0] Error analyzing image:", error)
      throw error
    }
  }

  private getMimeType(imageBase64: string): string {
    if (imageBase64.startsWith("data:image/jpeg")) return "image/jpeg"
    if (imageBase64.startsWith("data:image/png")) return "image/png"
    if (imageBase64.startsWith("data:image/webp")) return "image/webp"
    if (imageBase64.startsWith("data:image/gif")) return "image/gif"
    return "image/jpeg" // default fallback
  }

  private processGeminiResponse(data: any) {
    try {
      const content = data.candidates?.[0]?.content?.parts?.[0]?.text
      if (!content) {
        throw new Error("No content received from Gemini API")
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return this.createFallbackResponse(content)
      }

      const parsedData = JSON.parse(jsonMatch[0])

      return {
        title: parsedData.title || "Handcrafted Artisan Product",
        description: parsedData.description || "Beautiful handcrafted item showcasing traditional artisanal skills.",
        category: parsedData.category || "Handcrafted Items",
        labels: parsedData.features?.map((feature: string) => ({ description: feature, score: 0.8 })) || [],
        colors:
          parsedData.colors?.map((color: string) => ({ color: { red: 0, green: 0, blue: 0 }, name: color })) || [],
        materials: parsedData.materials || [],
        hashtags: parsedData.hashtags || ["handmade", "artisan", "traditional"],
        textAnnotations: parsedData.textContent ? [parsedData.textContent] : [],
        marketingPoints: parsedData.marketingPoints || [],
        objects: parsedData.features?.map((feature: string) => ({ name: feature, score: 0.8 })) || [],
      }
    } catch (error) {
      console.error("[v0] Error processing Gemini response:", error)
      return this.createFallbackResponse(data.candidates?.[0]?.content?.parts?.[0]?.text || "")
    }
  }

  private createFallbackResponse(content: string) {
    return {
      title: "Handcrafted Artisan Product",
      description: content.slice(0, 200) + "...",
      category: "Handcrafted Items",
      labels: [
        { description: "handmade", score: 0.9 },
        { description: "artisan", score: 0.8 },
      ],
      colors: [],
      materials: [],
      hashtags: ["handmade", "artisan", "traditional", "authentic", "craft"],
      textAnnotations: [],
      marketingPoints: ["Unique handcrafted design", "Traditional craftsmanship"],
      objects: [],
    }
  }
}
