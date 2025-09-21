"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import {
  Upload,
  Download,
  Wand2,
  Loader2,
  ImageIcon,
  Palette,
  Sun,
  Contrast,
  Crop,
  RotateCw,
  Sparkles,
  Camera,
} from "lucide-react"
import { AIClient } from "@/lib/ai-client"
import { copyToClipboard } from "@/utils/copy-to-clipboard"

interface EnhancementSettings {
  brightness: number
  contrast: number
  saturation: number
  backgroundType: string
  cropRatio: string
  rotation: number
}

interface EnhancementResult {
  enhancedImageUrl: string
  suggestions: string
  enhancementType: string
  processingTime: string
}

interface ImageAnalysis {
  description: string
  category: string
  hashtags: string[]
  enhancedTitle?: string
  enhancedDescription?: string
  photographyTips?: string
  mockupSuggestions?: string
  targetAudience?: string
}

export function ImageEnhancementStudio() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isGeneratingMockups, setIsGeneratingMockups] = useState(false)
  const [enhancementResult, setEnhancementResult] = useState<EnhancementResult | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<ImageAnalysis | null>(null)
  const [mockupSuggestions, setMockupSuggestions] = useState<string[]>([])
  const [settings, setSettings] = useState<EnhancementSettings>({
    brightness: 50,
    contrast: 50,
    saturation: 50,
    backgroundType: "clean-white",
    cropRatio: "1:1",
    rotation: 0,
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setOriginalImage(result)
        setEnhancedImage(null)
        setEnhancementResult(null)
        setImageAnalysis(null)
        setMockupSuggestions([])

        setIsAnalyzing(true)
        try {
          const base64Data = result.split(",")[1]
          const response = await AIClient.analyzeImage({
            imageBase64: base64Data,
            enhanceWithGemini: true,
          })

          if (response.success) {
            setImageAnalysis(response.analysis)
          }
        } catch (error) {
          console.error("Error analyzing image:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const generateMockupSuggestions = async () => {
    if (!originalImage || !imageAnalysis) return

    setIsGeneratingMockups(true)
    try {
      const base64Data = originalImage.split(",")[1]
      const response = await AIClient.generateMockups({
        imageBase64: base64Data,
        productType: imageAnalysis.category,
      })

      if (response.success) {
        setMockupSuggestions(response.mockupSuggestions)
      }
    } catch (error) {
      console.error("Error generating mockup suggestions:", error)
    } finally {
      setIsGeneratingMockups(false)
    }
  }

  const applyEnhancements = async () => {
    if (!originalImage) return

    setIsProcessing(true)
    try {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext("2d")

      if (canvas && ctx) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height

          ctx.filter = `
            brightness(${settings.brightness}%) 
            contrast(${settings.contrast}%) 
            saturate(${settings.saturation}%)
          `

          ctx.drawImage(img, 0, 0)

          const processedImageUrl = canvas.toDataURL("image/jpeg", 0.9)
          setEnhancedImage(processedImageUrl)
        }
        img.src = originalImage
      }

      const response = await AIClient.enhanceImage({
        imageUrl: originalImage,
        enhancementType: "marketplace-ready",
      })

      setEnhancementResult(response)
    } catch (error) {
      console.error("Error enhancing image:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const downloadEnhancedImage = () => {
    if (enhancedImage) {
      const link = document.createElement("a")
      link.download = "enhanced-product-image.jpg"
      link.href = enhancedImage
      link.click()
    }
  }

  const backgroundOptions = [
    { value: "clean-white", label: "Clean White", description: "Professional white background" },
    { value: "natural-wood", label: "Natural Wood", description: "Warm wooden surface" },
    { value: "fabric-texture", label: "Fabric Texture", description: "Soft fabric backdrop" },
    { value: "marble-surface", label: "Marble Surface", description: "Elegant marble background" },
    { value: "lifestyle-scene", label: "Lifestyle Scene", description: "Contextual lifestyle setting" },
  ]

  const cropRatios = [
    { value: "1:1", label: "Square (1:1)" },
    { value: "4:3", label: "Standard (4:3)" },
    { value: "16:9", label: "Wide (16:9)" },
    { value: "3:4", label: "Portrait (3:4)" },
  ]

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Image Enhancement Studio
          </CardTitle>
          <CardDescription>
            Transform your product photos into professional marketplace-ready images with Google AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!originalImage ? (
            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload Product Image</h3>
              <p className="text-muted-foreground mb-4">
                Choose a clear photo of your handcrafted product for AI analysis and enhancement
              </p>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose Image
              </Button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Original Image</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={originalImage || "/placeholder.svg"}
                      alt="Original product"
                      className="w-full h-64 object-cover"
                    />
                  </div>
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing with Google Vision AI...
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Enhanced Image</h3>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    {enhancedImage ? (
                      <img
                        src={enhancedImage || "/placeholder.svg"}
                        alt="Enhanced product"
                        className="w-full h-64 object-cover"
                      />
                    ) : (
                      <div className="w-full h-64 flex items-center justify-center text-muted-foreground">
                        Enhanced image will appear here
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {imageAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Google Vision AI Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Product Description</label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{imageAnalysis.description}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Detected Category</label>
                        <Badge variant="secondary" className="text-sm">
                          {imageAnalysis.category}
                        </Badge>
                      </div>
                    </div>

                    {imageAnalysis.enhancedTitle && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Enhanced Title Suggestion</label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="font-semibold">{imageAnalysis.enhancedTitle}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(imageAnalysis.enhancedTitle!)}
                            className="mt-2"
                          >
                            Copy Title
                          </Button>
                        </div>
                      </div>
                    )}

                    {imageAnalysis.photographyTips && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Photography Improvement Tips</label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm leading-relaxed">{imageAnalysis.photographyTips}</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-sm font-medium">AI-Generated Hashtags</label>
                      <div className="flex flex-wrap gap-1">
                        {imageAnalysis.hashtags?.slice(0, 10).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(imageAnalysis.hashtags?.map((tag) => `#${tag}`).join(" ") || "")}
                      >
                        Copy All Hashtags
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Adjustments</TabsTrigger>
                  <TabsTrigger value="background">Background</TabsTrigger>
                  <TabsTrigger value="crop">Crop & Rotate</TabsTrigger>
                  <TabsTrigger value="mockups">Mockups</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Sun className="h-4 w-4" />
                        Brightness
                      </label>
                      <Slider
                        value={[settings.brightness]}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, brightness: value[0] }))}
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{settings.brightness}%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Contrast className="h-4 w-4" />
                        Contrast
                      </label>
                      <Slider
                        value={[settings.contrast]}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, contrast: value[0] }))}
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{settings.contrast}%</span>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Saturation
                      </label>
                      <Slider
                        value={[settings.saturation]}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, saturation: value[0] }))}
                        max={200}
                        min={0}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{settings.saturation}%</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="background" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Background Style</label>
                    <Select
                      value={settings.backgroundType}
                      onValueChange={(value) => setSettings((prev) => ({ ...prev, backgroundType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose background style" />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {backgroundOptions.map((option) => (
                      <Button
                        key={option.value}
                        variant={settings.backgroundType === option.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSettings((prev) => ({ ...prev, backgroundType: option.value }))}
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="crop" className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Crop className="h-4 w-4" />
                        Aspect Ratio
                      </label>
                      <Select
                        value={settings.cropRatio}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, cropRatio: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose aspect ratio" />
                        </SelectTrigger>
                        <SelectContent>
                          {cropRatios.map((ratio) => (
                            <SelectItem key={ratio.value} value={ratio.value}>
                              {ratio.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <RotateCw className="h-4 w-4" />
                        Rotation
                      </label>
                      <Slider
                        value={[settings.rotation]}
                        onValueChange={(value) => setSettings((prev) => ({ ...prev, rotation: value[0] }))}
                        max={360}
                        min={0}
                        step={90}
                        className="w-full"
                      />
                      <span className="text-xs text-muted-foreground">{settings.rotation}°</span>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="mockups" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Professional Mockup Suggestions</h3>
                        <p className="text-sm text-muted-foreground">
                          AI-generated ideas for showcasing your product professionally
                        </p>
                      </div>
                      <Button
                        onClick={generateMockupSuggestions}
                        disabled={isGeneratingMockups || !imageAnalysis}
                        variant="outline"
                      >
                        {isGeneratingMockups ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Generate Mockup Ideas
                          </>
                        )}
                      </Button>
                    </div>

                    {mockupSuggestions.length > 0 && (
                      <div className="space-y-3">
                        {mockupSuggestions.map((suggestion, index) => (
                          <div key={index} className="p-4 bg-muted rounded-lg">
                            <div className="flex items-start gap-3">
                              <Badge variant="outline" className="mt-1">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm leading-relaxed">{suggestion}</p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(suggestion)}
                                  className="mt-2"
                                >
                                  Copy Suggestion
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(mockupSuggestions.join("\n\n"))}
                          className="w-full"
                        >
                          Copy All Mockup Suggestions
                        </Button>
                      </div>
                    )}

                    {imageAnalysis?.mockupSuggestions && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quick Mockup Tips</label>
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm leading-relaxed">{imageAnalysis.mockupSuggestions}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-4">
                <Button onClick={applyEnhancements} disabled={isProcessing} className="flex-1">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4 mr-2" />
                      Enhance Image
                    </>
                  )}
                </Button>

                {enhancedImage && (
                  <Button onClick={downloadEnhancedImage} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}

                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  New Image
                </Button>
              </div>

              {enhancementResult && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">AI Enhancement Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed">{enhancementResult.suggestions}</p>
                      <div className="flex gap-2">
                        <Badge variant="secondary">Processing Time: {enhancementResult.processingTime}</Badge>
                        <Badge variant="outline">Type: {enhancementResult.enhancementType}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
