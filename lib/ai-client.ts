// Client-side utilities for AI API calls
export class AIClient {
  private static baseUrl = "/api/ai"

  static async generateListing(data: {
    imageDescription?: string
    voiceTranscript?: string
    language?: string
    imageBase64?: string // Added imageBase64 parameter for direct image analysis
  }) {
    const response = await fetch(`${this.baseUrl}/generate-listing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to generate listing")
    }

    return response.json()
  }

  static async analyzeImage(data: {
    imageBase64: string
    enhanceWithGemini?: boolean
  }) {
    const response = await fetch(`${this.baseUrl}/analyze-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to analyze image")
    }

    return response.json()
  }

  static async speechToText(data: {
    audioBase64: string
    language?: string
  }) {
    const response = await fetch(`${this.baseUrl}/speech-to-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to convert speech to text")
    }

    return response.json()
  }

  static async textToSpeech(data: {
    text: string
    language?: string
  }) {
    const response = await fetch(`${this.baseUrl}/text-to-speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to convert text to speech")
    }

    return response.json()
  }

  static async generateMockups(data: {
    imageBase64: string
    productType?: string
  }) {
    const response = await fetch(`${this.baseUrl}/generate-mockups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to generate mockup suggestions")
    }

    return response.json()
  }

  static async translateVoice(data: {
    text: string
    sourceLanguage: string
    targetLanguage?: string
  }) {
    const response = await fetch(`${this.baseUrl}/translate-voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to translate voice")
    }

    return response.json()
  }

  static async getMarketInsights(data: {
    productCategory: string
    productType?: string
    region?: string
  }) {
    const response = await fetch(`${this.baseUrl}/market-insights`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to get market insights")
    }

    return response.json()
  }

  static async enhanceImage(data: {
    imageUrl: string
    enhancementType?: string
  }) {
    const response = await fetch(`${this.baseUrl}/enhance-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Failed to enhance image")
    }

    return response.json()
  }
}
