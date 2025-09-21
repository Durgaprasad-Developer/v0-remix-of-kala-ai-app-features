import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import { z } from "zod"

const marketInsightsSchema = z.object({
  priceAnalysis: z.object({
    suggestedRange: z.object({
      min: z.number(),
      max: z.number(),
      currency: z.string().default("INR"),
    }),
    competitorPrices: z.array(
      z.object({
        price: z.number(),
        source: z.string(),
        description: z.string(),
      }),
    ),
    pricingStrategy: z.string(),
  }),
  trendingCategories: z.array(
    z.object({
      category: z.string(),
      growthRate: z.string(),
      demand: z.enum(["High", "Medium", "Low"]),
      description: z.string(),
    }),
  ),
  designTrends: z.array(
    z.object({
      trend: z.string(),
      popularity: z.enum(["Rising", "Stable", "Declining"]),
      description: z.string(),
      examples: z.array(z.string()),
    }),
  ),
  recommendations: z.array(
    z.object({
      type: z.enum(["pricing", "design", "marketing", "category"]),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["High", "Medium", "Low"]),
    }),
  ),
  seasonalInsights: z.array(
    z.object({
      season: z.string(),
      demand: z.enum(["High", "Medium", "Low"]),
      suggestedProducts: z.array(z.string()),
      marketingTips: z.array(z.string()),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { productCategory, productType, region = "India" } = await req.json()

    if (!productCategory) {
      return Response.json({ error: "Product category is required" }, { status: 400 })
    }

    const prompt = `
    Provide comprehensive market insights for Indian artisans selling ${productCategory} ${productType ? `(specifically ${productType})` : ""} in ${region}.
    
    Focus on:
    1. Current pricing trends and competitive analysis
    2. Popular categories and emerging trends
    3. Design preferences and style trends
    4. Actionable recommendations for artisans
    5. Seasonal demand patterns
    
    Consider the Indian handicraft market, online marketplaces like Amazon, Flipkart, Etsy, and local e-commerce platforms.
    Provide practical, actionable insights that help artisans make informed business decisions.
    `

    const { object } = await generateObject({
      model: openai("gpt-4o"),
      schema: marketInsightsSchema,
      prompt,
      temperature: 0.4,
    })

    return Response.json({ insights: object })
  } catch (error) {
    console.error("Error generating market insights:", error)
    return Response.json({ error: "Failed to generate market insights" }, { status: 500 })
  }
}
