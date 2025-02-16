
import connectToDatabase from "@/library/database/db";
import { getSchemeRecommendation } from "@/library/Gemini/RecommendAI";
import Scheme from "@/library/modal/SchemeSchema";


import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { age, income, location, occupation, description } = await req.json();
    await connectToDatabase();
    const schemes = await Scheme.find();

    const recommendation = await getSchemeRecommendation(
      { age, income, location, occupation, description },
      schemes
    );
    console.log(recommendation);

    return NextResponse.json({ recommendation });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
