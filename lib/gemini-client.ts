export class GeminiClient {
  private apiKey: string
  private baseUrl = "https://generativelanguage.googleapis.com/v1beta"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async enhanceImageDescription(imageBase64: string, currentDescription: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this product image and enhance the description for marketplace listing. Current description: "${currentDescription}". 
                  
                  Please provide:
                  1. Enhanced product title (compelling and SEO-friendly)
                  2. Detailed description highlighting craftsmanship, materials, and unique features
                  3. Suggested improvements for photography (lighting, angles, background)
                  4. Mockup suggestions for better presentation
                  5. Target audience and use cases
                  
                  Focus on artisanal and handcrafted aspects. Make it marketplace-ready for platforms like Etsy, Amazon Handmade, etc.`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates[0]?.content?.parts[0]?.text || ""

      return this.parseEnhancementResponse(content)
    } catch (error) {
      console.error("Error enhancing image with Gemini:", error)
      throw error
    }
  }

  async generateMockupSuggestions(productType: string, imageBase64: string): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Based on this ${productType} product image, suggest 5 professional mockup scenarios that would showcase this item effectively for online marketplace sales. Consider:
                  
                  1. Lifestyle settings where this product would be used
                  2. Professional photography setups
                  3. Background and prop suggestions
                  4. Lighting recommendations
                  5. Multiple angle presentations
                  
                  Provide specific, actionable mockup ideas that an artisan can easily implement.`,
                },
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.candidates[0]?.content?.parts[0]?.text || ""

      return this.parseMockupSuggestions(content)
    } catch (error) {
      console.error("Error generating mockup suggestions:", error)
      throw error
    }
  }

  private parseEnhancementResponse(content: string) {
    // Parse the structured response from Gemini
    const sections = content.split(/\d+\./)

    return {
      enhancedTitle: this.extractSection(content, "title") || "Enhanced Product Title",
      enhancedDescription:
        this.extractSection(content, "description") || "Enhanced product description with craftsmanship details.",
      photographyTips:
        this.extractSection(content, "improvements|photography") ||
        "Improve lighting and background for better presentation.",
      mockupSuggestions: this.extractSection(content, "mockup") || "Create lifestyle mockups showing product in use.",
      targetAudience:
        this.extractSection(content, "audience|target") || "Art enthusiasts and collectors of handmade items.",
    }
  }

  private extractSection(content: string, keywords: string): string {
    const keywordRegex = new RegExp(`(${keywords}).*?(?=\\d+\\.|$)`, "is")
    const match = content.match(keywordRegex)
    return match ? match[0].replace(/^\d+\.\s*/, "").trim() : ""
  }

  private parseMockupSuggestions(content: string): string[] {
    const suggestions = content.split(/\d+\./).filter((s) => s.trim().length > 10)
    return suggestions.slice(0, 5).map((s) => s.trim())
  }
}
