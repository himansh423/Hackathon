"use client"

import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Check, MessageSquare, Save } from "lucide-react"

export default function HomePage() {
  const [formData, setFormData] = useState({ age: "", income: "", location: "", occupation: "" })
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedScheme, setSavedScheme] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [comparisonList, setComparisonList] = useState<string[]>([])

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
    <div className="p-6 space-y-8">
      <Card className="bg-gradient-to-br from-blue-50 to-gray-100 border-blue-200">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-blue-800 text-center">Find Your Government Schemes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <Input
              type="text"
              placeholder="Enter Age"
              className="bg-white"
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Monthly Income"
              className="bg-white"
              onChange={(e) => setFormData({ ...formData, income: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Location"
              className="bg-white"
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
            <Input
              type="text"
              placeholder="Enter Occupation"
              className="bg-white"
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
          <Button
            onClick={handleSubmit}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Fetching..." : "Get Recommendations"}
          </Button>
        </CardContent>
      </Card>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {recommendations.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-blue-800">Recommended Schemes:</h3>
          {recommendations.map((scheme, index) => (
            <Card key={index} className="bg-white border-blue-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-blue-700">{scheme.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  <strong>Category:</strong> {scheme.category}
                </p>
                <p className="text-gray-600">
                  <strong>Eligibility:</strong> {scheme.eligibility}
                </p>
                <p className="text-gray-800">
                  <strong>Why Recommended:</strong> {scheme.reason}
                </p>
                <div className="mt-4 flex space-x-2">
                  <Button onClick={() => handleSaveScheme(scheme.name)} className="bg-green-500 hover:bg-green-600">
                    <Save className="mr-2 h-4 w-4" /> Save Scheme
                  </Button>
                  <Button className="bg-purple-500 hover:bg-purple-600">
                    <MessageSquare className="mr-2 h-4 w-4" /> ASK AI
                  </Button>
                  <Button
                    onClick={() => handleAddToComparison(scheme.name)}
                    className="bg-orange-500 hover:bg-orange-600"
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
            <DialogTitle>Scheme Saved</DialogTitle>
          </DialogHeader>
          <p>You have successfully saved the scheme: {savedScheme}</p>
        </DialogContent>
      </Dialog>

      {comparisonList.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-800">Schemes for Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {comparisonList.map((scheme, index) => (
                <li key={index} className="text-blue-700">
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

