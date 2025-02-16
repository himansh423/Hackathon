import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import * as cookie from "cookie";

const JWT_SECRET = process.env.NEXT_PUBLIC_JWT_SECRET;

export async function GET(req: Request) {
  try {
    // Parse cookies from the request header
    const cookies = cookie.parse(req.headers.get("cookie") || "");
    const token = cookies.token;

    // Check if token exists
    if (!token) {
      return NextResponse.json(
        { message: "No token provided" },
        { status: 401 }
      );
    }

    // Verify the token using the secret key
    const decoded = jwt.verify(token, JWT_SECRET as string);

    // Return the decoded user data if token is valid
    return NextResponse.json({ user: decoded });
  } catch (error) {
    // Handle invalid token errors
    console.log(error)
    return NextResponse.json(
      { message: "Invalid or expired token" },
      { status: 401 }
    );
  }
}
