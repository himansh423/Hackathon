import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);

export async function getSchemeRecommendation(userData: any, schemes: any[]) {
  console.log("checking",schemes)
  const schemesList = schemes
    .map(
      (scheme) =>
        `Name: ${scheme.SchemeTitle}, Scheme-provider-State: ${scheme.SchemeProviderState}, Scheme-Description: ${scheme.SchemeDescription}, Scheme-Details:${scheme.details}, Benefits:${scheme.benefits}, eligibility:${scheme}`
    )
    .join("\n\n");

  const prompt = `Given the following user details:
  - Age: ${userData.age}
  - Income: ${userData.income}
  - Location: ${userData.location}
  - Occupation: ${userData.occupation}
  - Description: ${userData.description}
  
  Based on these details(Description is Optional), recommend the best government schemes from the list below.  

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
        "reason": "Why this scheme is suitable for the user."
      }
    ]
  }
  \`\`\`

  Ensure that the response **always follows this JSON format** without additional text or explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const rawText = await response.text();
    const cleanedText = rawText.replace(/```json|```/g, "").trim();

    return JSON.parse(cleanedText || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { recommended_schemes: [] };
  }
}
