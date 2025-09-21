"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Calendar,
  Search,
  Loader2,
  BarChart3,
  Lightbulb,
  Star,
} from "lucide-react"
import { AIClient } from "@/lib/ai-client"

interface MarketInsights {
  priceAnalysis: {
    suggestedRange: {
      min: number
      max: number
      currency: string
    }
    competitorPrices: Array<{
      price: number
      source: string
      description: string
    }>
    pricingStrategy: string
  }
  trendingCategories: Array<{
    category: string
    growthRate: string
    demand: "High" | "Medium" | "Low"
    description: string
  }>
  designTrends: Array<{
    trend: string
    popularity: "Rising" | "Stable" | "Declining"
    description: string
    examples: string[]
  }>
  recommendations: Array<{
    type: "pricing" | "design" | "marketing" | "category"
    title: string
    description: string
    priority: "High" | "Medium" | "Low"
  }>
  seasonalInsights: Array<{
    season: string
    demand: "High" | "Medium" | "Low"
    suggestedProducts: string[]
    marketingTips: string[]
  }>
}

export function MarketInsightsDashboard() {
  const [insights, setInsights] = useState<MarketInsights | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [productCategory, setProductCategory] = useState("")
  const [productType, setProductType] = useState("")
  const [region, setRegion] = useState("India")

  const categories = [
    "Textiles & Fabrics",
    "Jewelry & Accessories",
    "Home Decor",
    "Pottery & Ceramics",
    "Woodwork & Furniture",
    "Metalwork",
    "Leather Goods",
    "Art & Paintings",
    "Traditional Clothing",
    "Handicrafts",
  ]

  const regions = [
    "India",
    "North India",
    "South India",
    "West India",
    "East India",
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Chennai",
    "Kolkata",
  ]

  const fetchInsights = async () => {
    if (!productCategory) return

    setIsLoading(true)
    try {
      const response = await AIClient.getMarketInsights({
        productCategory,
        productType: productType || undefined,
        region,
      })
      setInsights(response.insights)
    } catch (error) {
      console.error("Error fetching insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case "High":
        return "text-green-600 bg-green-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Low":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-100"
      case "Medium":
        return "text-yellow-600 bg-yellow-100"
      case "Low":
        return "text-green-600 bg-green-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getPopularityIcon = (popularity: string) => {
    switch (popularity) {
      case "Rising":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "Declining":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-600" />
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Market Insights Dashboard
          </CardTitle>
          <CardDescription>
            Get AI-powered market analysis and pricing recommendations for your products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Category</label>
              <Select value={productCategory} onValueChange={setProductCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Product Type (Optional)</label>
              <Input
                placeholder="e.g., Silk Saree, Wooden Bowl"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {regions.map((regionOption) => (
                    <SelectItem key={regionOption} value={regionOption}>
                      {regionOption}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">&nbsp;</label>
              <Button onClick={fetchInsights} disabled={!productCategory || isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Insights
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {insights && (
        <>
          {/* Price Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Price Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Suggested Price Range</h3>
                    <div className="text-3xl font-bold text-primary">
                      ₹{insights.priceAnalysis.suggestedRange.min} - ₹{insights.priceAnalysis.suggestedRange.max}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Pricing Strategy</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {insights.priceAnalysis.pricingStrategy}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Competitor Analysis</h4>
                  <div className="space-y-3">
                    {insights.priceAnalysis.competitorPrices.map((competitor, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">₹{competitor.price}</p>
                          <p className="text-xs text-muted-foreground">{competitor.source}</p>
                        </div>
                        <p className="text-sm text-muted-foreground max-w-48 text-right">{competitor.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trending Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Trending Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.trendingCategories.map((category, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{category.category}</h3>
                      <Badge className={getDemandColor(category.demand)}>{category.demand}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{category.growthRate}</div>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Design Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                Design Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insights.designTrends.map((trend, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getPopularityIcon(trend.popularity)}
                        <h3 className="font-semibold">{trend.trend}</h3>
                      </div>
                      <Badge variant="outline">{trend.popularity}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{trend.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {trend.examples.map((example, exampleIndex) => (
                        <Badge key={exampleIndex} variant="secondary">
                          {example}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold">{recommendation.title}</h3>
                      </div>
                      <Badge className={getPriorityColor(recommendation.priority)}>{recommendation.priority}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{recommendation.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {recommendation.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Seasonal Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                Seasonal Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {insights.seasonalInsights.map((season, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{season.season}</h3>
                      <Badge className={getDemandColor(season.demand)}>{season.demand}</Badge>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Suggested Products:</h4>
                      <div className="flex flex-wrap gap-1">
                        {season.suggestedProducts.map((product, productIndex) => (
                          <Badge key={productIndex} variant="secondary" className="text-xs">
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Marketing Tips:</h4>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {season.marketingTips.map((tip, tipIndex) => (
                          <li key={tipIndex} className="flex items-start gap-1">
                            <span className="text-primary">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!insights && !isLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Get Market Insights</h3>
            <p className="text-muted-foreground">
              Select a product category and region to get AI-powered market analysis and recommendations
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
