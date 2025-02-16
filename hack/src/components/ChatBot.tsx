"use client";
import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(
  process.env.NEXT_PUBLIC_GEMINI_API_KEY as string
);

export default function Chatbot() {
  const [url, setUrl] = useState("");
  const [userQuestion, setUserQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [crawledData, setCrawledData] = useState("");

  // Function to crawl web content
  const crawlWebsite = async (url: string) => {
    try {
      const response = await fetch(url);
      const html = await response.text();
      return html;
    } catch (error) {
      console.error("Error crawling website:", error);
      return "";
    }
  };

  // Function to handle chat with Gemini
  const chat = async () => {
    try {
      setLoading(true);

      // First crawl the website if URL is provided
      if (url && !crawledData) {
        const webContent = await crawlWebsite(url);
        setCrawledData(webContent);
      }

      // Generate context-aware prompt
      const prompt = `
        Context from webpage: ${crawledData}
        
        User Question: ${userQuestion}
        
        Please provide a relevant answer based on the webpage content.
      `;

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      setResponse(response.text());
    } catch (error) {
      console.error("Error:", error);
      setResponse("Sorry, there was an error processing your request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          Web-Crawling Chatbot
        </h1>

        {/* URL Input */}
        <div className="mb-6">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter website URL to crawl..."
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chat Interface */}
        <div className="mb-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {response && (
              <div className="bg-blue-100 p-3 rounded-lg mb-2">
                <p className="text-gray-800">{response}</p>
              </div>
            )}
          </div>

          {/* Question Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              placeholder="Ask a question about the website..."
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={chat}
              disabled={loading || !url || !userQuestion}
              className={`px-6 py-3 rounded-lg text-white font-semibold ${
                loading || !url || !userQuestion
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Processing..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
