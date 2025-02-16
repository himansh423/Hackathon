import { GoogleGenerativeAI } from "@google/generative-ai";
import connectToDatabase from "@/library/database/db";
import Scheme from "@/library/modal/SchemeSchema";
import { NextResponse } from "next/server";

interface UserData {
  age: string;
  income: string;
  location: string;
  occupation: string;
  description: string;
}

interface Schemes {
  SchemeTitle: string;
  SchemeProviderState: string;
  SchemeDescription: string;
  benefits: string;
  details: string;
  eligibility: string;
  schemeLink: string;
  _id: string;
}

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

export async function getSchemeRecommendation(
  userData: UserData,
  schemes: Schemes[]
) {
  console.log("Checking schemes:", schemes);

  const schemesList = schemes
    .map(
      (scheme: Schemes) =>
        `Name: ${scheme.SchemeTitle}, Scheme-provider-State: ${scheme.SchemeProviderState}, Scheme-Description: ${scheme.SchemeDescription}, Scheme-Details:${scheme.details}, Benefits:${scheme.benefits}, Eligibility:${scheme.eligibility}, Scheme-Id:${scheme._id}`
    )
    .join("\n\n");

  const prompt = `Given the following user details:
  - Age: ${userData.age}
  - Income: ${userData.income}
  - Location: ${userData.location}
  - Occupation: ${userData.occupation}
  - Description: ${userData.description}
  
  Based on these details, recommend the best government schemes from the list below and some Schemes By yourself in you knowledge.
  
  **Schemes List:**  
  ${schemesList}

  **Response Format (Always Follow This Structure):**  
  Return the result in **JSON format** with the following structure:

  \`\`\`json
  {
    "recommended_schemes": [
      {
        "name": "Scheme Name",
        "category": "Scheme Category",
        "eligibility": "Eligibility Criteria",
        "reason": "Why this scheme is suitable for the user.",
        "Trust-Score": "Give Score based on Scheme in the scale of 1-5",
        "_id": "Send ID of scheme"
      }
    ]
  }
  \`\`\`

  Ensure that the response **strictly follows this JSON format** without additional text or explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const rawText = await response.text();
    console.log("Raw Response from Gemini:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : "{}";

    return JSON.parse(cleanedText || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { recommended_schemes: [] };
  }
}