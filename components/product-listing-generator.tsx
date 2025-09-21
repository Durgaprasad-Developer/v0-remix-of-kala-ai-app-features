"use client"

import type React from "react"
import { copyToClipboard } from "@/utils/copy-to-clipboard" // Import copyToClipboard function

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Upload, Mic, MicOff, Loader2, Camera, Sparkles } from "lucide-react"
import { AIClient } from "@/lib/ai-client"

interface ProductListing {
  title: string
  description: string
  englishCaption: string
  localCaption: string
  hashtags: string[]
  keyFeatures: string[]
  suggestedPrice: {
    min: number
    max: number
    currency: string
  }
  category: string
  tags: string[]
}

export function ProductListingGenerator() {
  const [isRecording, setIsRecording] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageAnalysis, setImageAnalysis] = useState<any>(null)
  const [generatedListing, setGeneratedListing] = useState<ProductListing | null>(null)
  const [language, setLanguage] = useState("en")
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = async (e) => {
        const result = e.target?.result as string
        setImagePreview(result)

        // Analyze image with Google Vision
        setIsAnalyzing(true)
        try {
          const base64Data = result.split(",")[1]
          const response = await fetch("/api/ai/analyze-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageBase64: base64Data, enhanceWithGemini: true }),
          })

          if (response.ok) {
            const data = await response.json()
            setImageAnalysis(data.analysis)
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder

      const chunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" })

        // Convert to base64 and send to Google Speech-to-Text
        const reader = new FileReader()
        reader.onload = async () => {
          const base64Audio = (reader.result as string).split(",")[1]

          try {
            const response = await fetch("/api/ai/speech-to-text", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ audioBase64: base64Audio, language }),
            })

            if (response.ok) {
              const data = await response.json()
              setVoiceTranscript(data.transcript)
            } else {
              // Fallback to placeholder
              setVoiceTranscript(
                "Sample voice transcript: This is a beautiful handwoven silk saree with traditional motifs...",
              )
            }
          } catch (error) {
            console.error("Error converting speech to text:", error)
            setVoiceTranscript(
              "Sample voice transcript: This is a beautiful handwoven silk saree with traditional motifs...",
            )
          }
        }
        reader.readAsDataURL(audioBlob)

        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const generateListing = async () => {
    if (!imageFile && !voiceTranscript) {
      return
    }

    setIsGenerating(true)
    try {
      let imageBase64 = null
      if (imageFile) {
        const reader = new FileReader()
        imageBase64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const result = reader.result as string
            resolve(result.split(",")[1])
          }
          reader.readAsDataURL(imageFile)
        })
      }

      const response = await AIClient.generateListing({
        imageDescription: imageAnalysis?.enhancedDescription || imageAnalysis?.description,
        voiceTranscript: voiceTranscript || undefined,
        language,
        imageBase64,
      })

      setGeneratedListing(response.listing)
    } catch (error) {
      console.error("Error generating listing:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const playTextAsAudio = async (text: string) => {
    if (isPlayingAudio) return

    setIsPlayingAudio(true)
    try {
      const response = await fetch("/api/ai/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language }),
      })

      if (response.ok) {
        const data = await response.json()
        const audioBlob = new Blob([Uint8Array.from(atob(data.audioContent), (c) => c.charCodeAt(0))], {
          type: "audio/mp3",
        })
        const audioUrl = URL.createObjectURL(audioBlob)

        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play()
          audioRef.current.onended = () => {
            setIsPlayingAudio(false)
            URL.revokeObjectURL(audioUrl)
          }
        }
      }
    } catch (error) {
      console.error("Error playing audio:", error)
      setIsPlayingAudio(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <audio ref={audioRef} style={{ display: "none" }} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Product Listing Generator
          </CardTitle>
          <CardDescription>
            Upload a product photo and record your voice description to generate professional marketplace listings with
            Google AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Product Photo</h3>
            <div className="border-2 border-dashed border-border rounded-lg p-6">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Product preview"
                    className="max-w-full h-48 object-cover rounded-lg mx-auto"
                  />
                  {isAnalyzing && (
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing image with Google Vision AI...
                    </div>
                  )}
                  {imageAnalysis && (
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">AI Analysis:</p>
                      <p className="text-muted-foreground">{imageAnalysis.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {imageAnalysis.hashtags?.slice(0, 5).map((tag: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Upload a clear photo of your product</p>
                    <Button onClick={() => fileInputRef.current?.click()}>
                      <Camera className="h-4 w-4 mr-2" />
                      Choose Photo
                    </Button>
                  </div>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </div>
          </div>

          {/* Voice Recording Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Voice Description</h3>
            <div className="flex items-center gap-4">
              <Button
                variant={isRecording ? "destructive" : "default"}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isGenerating}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Start Recording
                  </>
                )}
              </Button>
              <div className="flex gap-2">
                <Button variant={language === "en" ? "default" : "outline"} size="sm" onClick={() => setLanguage("en")}>
                  English
                </Button>
                <Button variant={language === "hi" ? "default" : "outline"} size="sm" onClick={() => setLanguage("hi")}>
                  हिंदी
                </Button>
                <Button variant={language === "te" ? "default" : "outline"} size="sm" onClick={() => setLanguage("te")}>
                  తెలుగు
                </Button>
              </div>
            </div>

            {voiceTranscript && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Voice Transcript:</label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playTextAsAudio(voiceTranscript)}
                    disabled={isPlayingAudio}
                  >
                    {isPlayingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : "🔊 Play"}
                  </Button>
                </div>
                <Textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  placeholder="Your voice description will appear here..."
                  className="min-h-20"
                />
              </div>
            )}
          </div>

          {/* Generate Button */}
          <Button
            onClick={generateListing}
            disabled={(!imageFile && !voiceTranscript) || isGenerating}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Listing with Google AI...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Professional Listing
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Listing Display */}
      {generatedListing && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Product Listing</CardTitle>
            <CardDescription>Your AI-generated professional marketplace listing powered by Google AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Title</label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold">{generatedListing.title}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedListing.title)}>
                    Copy Title
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playTextAsAudio(generatedListing.title)}
                    disabled={isPlayingAudio}
                  >
                    {isPlayingAudio ? "🔊" : "🔊 Play"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Description</label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">{generatedListing.description}</p>
                <div className="flex gap-2 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(generatedListing.description)}>
                    Copy Description
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => playTextAsAudio(generatedListing.description)}
                    disabled={isPlayingAudio}
                  >
                    {isPlayingAudio ? "🔊" : "🔊 Play"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Price Suggestion */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Suggested Price Range</label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="font-semibold text-lg">
                  ₹{generatedListing.suggestedPrice.min} - ₹{generatedListing.suggestedPrice.max}
                </p>
              </div>
            </div>

            {/* Key Features */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Key Features</label>
              <div className="flex flex-wrap gap-2">
                {generatedListing.keyFeatures.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Social Media Captions */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">English Caption</label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{generatedListing.englishCaption}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedListing.englishCaption)}
                    className="mt-2"
                  >
                    Copy Caption
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Local Language Caption</label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">{generatedListing.localCaption}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(generatedListing.localCaption)}
                    className="mt-2"
                  >
                    Copy Caption
                  </Button>
                </div>
              </div>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {generatedListing.hashtags.map((hashtag, index) => (
                  <Badge key={index} variant="outline">
                    #{hashtag}
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedListing.hashtags.map((tag) => `#${tag}`).join(" "))}
              >
                Copy All Hashtags
              </Button>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Product Tags</label>
              <div className="flex flex-wrap gap-2">
                {generatedListing.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enhanced Image Analysis Results */}
            {imageAnalysis && (
              <div className="space-y-4">
                <Separator />
                <h3 className="text-lg font-semibold">Google Vision AI Analysis</h3>

                {imageAnalysis.enhancedTitle && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Enhanced Title Suggestion</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-semibold">{imageAnalysis.enhancedTitle}</p>
                    </div>
                  </div>
                )}

                {imageAnalysis.photographyTips && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Photography Tips</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{imageAnalysis.photographyTips}</p>
                    </div>
                  </div>
                )}

                {imageAnalysis.mockupSuggestions && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mockup Suggestions</label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm">{imageAnalysis.mockupSuggestions}</p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Detected Category</label>
                    <Badge variant="secondary">{imageAnalysis.category}</Badge>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">AI-Generated Tags</label>
                    <div className="flex flex-wrap gap-1">
                      {imageAnalysis.hashtags?.slice(0, 8).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
