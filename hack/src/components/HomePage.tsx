"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, MessageSquare, Mic, Save, Search } from "lucide-react"
import { GoogleGenerativeAI } from "@google/generative-ai"

// Add these type definitions at the top of your file
interface Window {
  SpeechRecognition: typeof SpeechRecognition
  webkitSpeechRecognition: typeof SpeechRecognition
}

declare interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionResult {
  isFinal: boolean
  0: SpeechRecognitionAlternative
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(apiKey as string)

export default function HomePage() {
  const [formData, setFormData] = useState({ age: "", income: "", location: "", occupation: "" })
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedScheme, setSavedScheme] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [comparisonList, setComparisonList] = useState<string[]>([])
  const [isListening, setIsListening] = useState(false)

  useEffect(() => {
    if (isListening) {
      startListening()
    }
  }, [isListening])

  const startListening = () => {
    // Use the correct type for SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "hi-IN" // Supports Hindi and English
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      console.log("Listening...")
    }

    recognition.onresult = async (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      console.log("Recognized speech:", transcript)
      await processSpeech(transcript)
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech recognition error:", event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const processSpeech = async (speechText: string) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" })
      const prompt = `Extract user details (age, income, location, occupation, description) from the given statement:
      "${speechText}" 
      Format it in JSON:
      
      {"age": "", "income": "", "location": "", "occupation": "", "description": ""}`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const jsonText = await response.text()
      const extractedData = JSON.parse(jsonText.match(/\{[\s\S]*\}/)[0] || "{}")

      setFormData({
        age: extractedData.age || "",
        income: extractedData.income || "",
        location: extractedData.location || "",
        occupation: extractedData.occupation || "",
      })

      // Automatically submit the form after processing speech
      handleSubmit()
    } catch (error) {
      console.error("Error processing speech data:", error)
      setError("Error processing speech. Please try again.")
    }
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)
    setRecommendations([])

    try {
      const res = await axios.post("/api/recommend", formData, {
        headers: { "Content-Type": "application/json" },
      })

      setRecommendations(res.data.recommendation.recommended_schemes || [])
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Something went wrong!")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveScheme = (schemeName: string) => {
    setSavedScheme(schemeName)
    setIsModalOpen(true)
  }

  const handleAddToComparison = (schemeName: string) => {
    if (!comparisonList.includes(schemeName)) {
      setComparisonList([...comparisonList, schemeName])
    }
  }

  return (
    <div className="min-h-screen bg-[#E3E3E3] p-6 space-y-8">
      <Card className="bg-white shadow-lg border-none">
        <CardHeader className="bg-gray-800 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold text-center">Find Your Government Schemes</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="Enter Age"
              className="bg-gray-100 border-gray-300"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Monthly Income"
              className="bg-gray-100 border-gray-300"
              value={formData.income}
              onChange={(e) => setFormData({ ...formData, income: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Location"
              className="bg-gray-100 border-gray-300"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Occupation"
              className="bg-gray-100 border-gray-300"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white transition-colors duration-300"
              disabled={loading}
            >
              {loading ? (
                "Fetching..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Get Recommendations
                </>
              )}
            </Button>
            <Button
              onClick={() => setIsListening(true)}
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white transition-colors duration-300"
              disabled={isListening}
            >
              <Mic className="mr-2 h-4 w-4" />
              {isListening ? "Listening..." : "Voice Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-center bg-white p-4 rounded-lg shadow">{error}</p>}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-800">Recommended Schemes:</h3>
          {recommendations.map((scheme, index) => (
            <Card key={index} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="bg-gray-100 border-b border-gray-200">
                <CardTitle className="text-xl font-semibold text-gray-800">{scheme.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-gray-600">
                  <strong>Category:</strong> {scheme.category}
                </p>
                <p className="text-gray-600">
                  <strong>Eligibility:</strong> {scheme.eligibility}
                </p>
                <p className="text-gray-800 mt-2">
                  <strong>Why Recommended:</strong> {scheme.reason}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSaveScheme(scheme.name)}
                    className="bg-gray-700 hover:bg-gray-600 text-white"
                  >
                    <Save className="mr-2 h-4 w-4" /> Save Scheme
                  </Button>
                  <Button className="bg-gray-500 hover:bg-gray-400 text-white">
                    <MessageSquare className="mr-2 h-4 w-4" /> ASK AI
                  </Button>
                  <Button
                    onClick={() => handleAddToComparison(scheme.name)}
                    className="bg-gray-600 hover:bg-gray-500 text-white"
                  >
                    <Check className="mr-2 h-4 w-4" /> Compare
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-800">Scheme Saved</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">You have successfully saved the scheme: {savedScheme}</p>
        </DialogContent>
      </Dialog>

      {comparisonList.length > 0 && (
        <Card className="bg-white shadow-md">
          <CardHeader className="bg-gray-100 border-b border-gray-200">
            <CardTitle className="text-xl font-semibold text-gray-800">Schemes for Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {comparisonList.map((scheme, index) => (
                <li key={index} className="text-gray-700">
                  {scheme}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

