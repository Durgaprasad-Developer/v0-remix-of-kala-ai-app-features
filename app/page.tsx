"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProductListingGenerator } from "@/components/product-listing-generator"
import { ImageEnhancementStudio } from "@/components/image-enhancement-studio"
import { MarketInsightsDashboard } from "@/components/market-insights-dashboard"
import { Sparkles, Wand2, BarChart3, Camera, TrendingUp, Globe, Heart, Menu, X } from "lucide-react"

export default function KalaAIHomePage() {
  const [activeTab, setActiveTab] = useState("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const features = [
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "AI Product Listing Generator",
      description:
        "Upload photos and record voice descriptions to generate professional marketplace listings in multiple languages.",
      benefits: [
        "Voice-to-text in Hindi & Telugu",
        "Professional descriptions",
        "Social media captions",
        "SEO-optimized content",
      ],
    },
    {
      icon: <Wand2 className="h-8 w-8 text-accent" />,
      title: "Image Enhancement Studio",
      description:
        "Transform your product photos into professional, marketplace-ready images with AI-powered enhancements.",
      benefits: ["Auto background removal", "Professional mockups", "Lighting optimization", "Multiple formats"],
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-chart-1" />,
      title: "Market Insights Dashboard",
      description:
        "Get AI-powered market analysis, competitive pricing, and trend insights to stay ahead in the market.",
      benefits: ["Price recommendations", "Trending categories", "Seasonal insights", "Competition analysis"],
    },
    {
      icon: <Globe className="h-8 w-8 text-chart-2" />,
      title: "Multilingual Support",
      description: "Reach global audiences with content generated in English, Hindi, and Telugu languages.",
      benefits: ["Voice input support", "Auto-translation", "Cultural context", "Local market focus"],
    },
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      craft: "Textile Artisan",
      location: "Jaipur, Rajasthan",
      quote:
        "KalaAI helped me create professional listings for my handwoven sarees. My online sales increased by 300% in just 2 months!",
      rating: 5,
    },
    {
      name: "Ravi Kumar",
      craft: "Wood Carver",
      location: "Mysore, Karnataka",
      quote:
        "The voice feature is amazing! I can describe my carvings in Kannada and get perfect English descriptions for international buyers.",
      rating: 5,
    },
    {
      name: "Meera Devi",
      craft: "Pottery Artist",
      location: "Khurja, Uttar Pradesh",
      quote:
        "The market insights helped me price my pottery correctly. I now know which designs are trending and when to launch new collections.",
      rating: 5,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">KalaAI</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="p-4 border-b bg-card">
            <div className="space-y-2">
              <Button
                variant={activeTab === "home" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("home")
                  setMobileMenuOpen(false)
                }}
              >
                Home
              </Button>
              <Button
                variant={activeTab === "listing" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("listing")
                  setMobileMenuOpen(false)
                }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Product Listing
              </Button>
              <Button
                variant={activeTab === "enhance" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("enhance")
                  setMobileMenuOpen(false)
                }}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Image Enhancement
              </Button>
              <Button
                variant={activeTab === "insights" ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveTab("insights")
                  setMobileMenuOpen(false)
                }}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Market Insights
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <div className="border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="font-bold text-2xl">KalaAI</span>
                <Badge variant="secondary" className="ml-2">
                  Beta
                </Badge>
              </div>

              <div className="flex items-center gap-1">
                <Button variant={activeTab === "home" ? "default" : "ghost"} onClick={() => setActiveTab("home")}>
                  Home
                </Button>
                <Button variant={activeTab === "listing" ? "default" : "ghost"} onClick={() => setActiveTab("listing")}>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Product Listing
                </Button>
                <Button variant={activeTab === "enhance" ? "default" : "ghost"} onClick={() => setActiveTab("enhance")}>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Image Enhancement
                </Button>
                <Button
                  variant={activeTab === "insights" ? "default" : "ghost"}
                  onClick={() => setActiveTab("insights")}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Market Insights
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {activeTab === "home" && (
          <div className="space-y-12 py-8">
            {/* Hero Section */}
            <section className="max-w-7xl mx-auto px-4 text-center space-y-6">
              <div className="space-y-4">
                <Badge variant="secondary" className="text-sm">
                  Empowering Indian Artisans with AI
                </Badge>
                <h1 className="text-4xl md:text-6xl font-bold text-balance">
                  Transform Your Craft into
                  <span className="text-primary"> Digital Success</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
                  KalaAI helps local artisans market their crafts, tell their stories, and expand their reach to new
                  digital audiences with AI-powered tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setActiveTab("listing")}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Start Creating Listings
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab("insights")}>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Explore Market Insights
                </Button>
              </div>
            </section>

            {/* Features Section */}
            <section className="max-w-7xl mx-auto px-4 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Everything You Need to Succeed Online</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Our AI-powered platform provides all the tools you need to showcase your crafts professionally and
                  reach global markets.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {feature.icon}
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <div key={benefitIndex} className="flex items-center gap-2 text-sm">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            {/* How It Works */}
            <section className="max-w-7xl mx-auto px-4 space-y-8">
              <div className="text-center space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Simple Steps to Digital Success</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get started in minutes with our intuitive, artisan-friendly interface designed for creators, not tech
                  experts.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">1. Upload & Record</h3>
                  <p className="text-muted-foreground">
                    Take a photo of your product and record a voice description in your preferred language.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                    <Wand2 className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold">2. AI Enhancement</h3>
                  <p className="text-muted-foreground">
                    Our AI enhances your images and generates professional listings with pricing recommendations.
                  </p>
                </div>

                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="h-8 w-8 text-chart-1" />
                  </div>
                  <h3 className="text-xl font-semibold">3. Publish & Grow</h3>
                  <p className="text-muted-foreground">
                    Use generated content across marketplaces and social media to reach more customers.
                  </p>
                </div>
              </div>
            </section>

            {/* Testimonials */}
            <section className="bg-muted/50 py-12">
              <div className="max-w-7xl mx-auto px-4 space-y-8">
                <div className="text-center space-y-4">
                  <h2 className="text-3xl md:text-4xl font-bold">Loved by Artisans Across India</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    See how KalaAI is helping traditional craftspeople thrive in the digital marketplace.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  {testimonials.map((testimonial, index) => (
                    <Card key={index}>
                      <CardContent className="p-6 space-y-4">
                        <div className="flex gap-1">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Heart key={i} className="h-4 w-4 fill-red-500 text-red-500" />
                          ))}
                        </div>
                        <p className="text-sm leading-relaxed italic">"{testimonial.quote}"</p>
                        <div>
                          <p className="font-semibold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {testimonial.craft} • {testimonial.location}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="max-w-7xl mx-auto px-4 text-center space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Craft Business?</h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of artisans who are already using KalaAI to grow their digital presence and increase
                  sales.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" onClick={() => setActiveTab("listing")}>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Get Started Free
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab("insights")}>
                  <BarChart3 className="h-5 w-5 mr-2" />
                  View Market Insights
                </Button>
              </div>
            </section>
          </div>
        )}

        {activeTab === "listing" && <ProductListingGenerator />}
        {activeTab === "enhance" && <ImageEnhancementStudio />}
        {activeTab === "insights" && <MarketInsightsDashboard />}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">KalaAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Empowering Indian artisans with AI-powered tools for digital success.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for preserving and promoting traditional Indian crafts.
          </p>
        </div>
      </footer>
    </div>
  )
}
