import { NextResponse } from "next/server";
import { chromium } from "playwright";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    // Validate URL
    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Launch a headless browser
    const browser = await chromium.launch();
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: "networkidle" }); // Wait until all requests are finished

    // Extract the full HTML content after JavaScript execution
    const html = await page.content();
    await browser.close();

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error crawling website:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
