export class GoogleSpeechClient {
  private apiKey: string
  private sttBaseUrl = "https://speech.googleapis.com/v1"
  private ttsBaseUrl = "https://texttospeech.googleapis.com/v1"

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async speechToText(audioBase64: string, languageCode = "en-US"): Promise<string> {
    try {
      const response = await fetch(`${this.sttBaseUrl}/speech:recognize?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          config: {
            encoding: "WEBM_OPUS",
            sampleRateHertz: 48000,
            languageCode: languageCode,
            alternativeLanguageCodes: ["hi-IN", "te-IN", "en-IN"],
            enableAutomaticPunctuation: true,
            model: "latest_long",
          },
          audio: {
            content: audioBase64,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google Speech-to-Text API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        return data.results[0].alternatives[0].transcript
      }

      return ""
    } catch (error) {
      console.error("Error converting speech to text:", error)
      throw error
    }
  }

  async textToSpeech(text: string, languageCode = "en-US"): Promise<string> {
    try {
      const voiceConfig = this.getVoiceConfig(languageCode)

      const response = await fetch(`${this.ttsBaseUrl}/text:synthesize?key=${this.apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text },
          voice: voiceConfig,
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate: 1.0,
            pitch: 0.0,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Google Text-to-Speech API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.audioContent
    } catch (error) {
      console.error("Error converting text to speech:", error)
      throw error
    }
  }

  private getVoiceConfig(languageCode: string) {
    const voiceConfigs = {
      "en-US": { languageCode: "en-US", name: "en-US-Wavenet-F", ssmlGender: "FEMALE" },
      "hi-IN": { languageCode: "hi-IN", name: "hi-IN-Wavenet-A", ssmlGender: "FEMALE" },
      "te-IN": { languageCode: "te-IN", name: "te-IN-Standard-A", ssmlGender: "FEMALE" },
      "en-IN": { languageCode: "en-IN", name: "en-IN-Wavenet-A", ssmlGender: "FEMALE" },
    }

    return voiceConfigs[languageCode as keyof typeof voiceConfigs] || voiceConfigs["en-US"]
  }

  getLanguageCode(language: string): string {
    const languageCodes = {
      en: "en-US",
      hi: "hi-IN",
      te: "te-IN",
    }
    return languageCodes[language as keyof typeof languageCodes] || "en-US"
  }
}
