import connectToDatabase from "@/library/database/db";
import Scheme from "@/library/modal/SchemeSchema";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    connectToDatabase();
    const newScheme = new Scheme({
      SchemeTitle: payload.SchemeTitle,
      SchemeProviderState: payload.SchemeProviderState,
      SchemeDescription: payload.SchemeDescription,
      details: payload.details,
      benefits: payload.benefits,
      eligibility: payload.eligibility,
      applicationProcess: payload.applicationProcess,
      link:payload.link
    });

    const savedSchemes = await newScheme.save();

    return NextResponse.json(
      {
        success: true,
        message: "Schema created successfully",
        teamUp: savedSchemes,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error)
      console.error("Error creating Schemes:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
