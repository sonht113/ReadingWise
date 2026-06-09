import { NextRequest, NextResponse } from "next/server";
import { translatePhrase } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const { phrase, context } = await request.json();

    if (!phrase) {
      return NextResponse.json(
        { error: "Phrase is required" },
        { status: 400 },
      );
    }

    const result = await translatePhrase(phrase, context);
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Translation failed" },
      { status: 500 },
    );
  }
}
