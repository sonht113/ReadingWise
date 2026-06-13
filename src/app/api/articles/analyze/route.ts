import { NextRequest, NextResponse } from "next/server";
import { parseArticleFromRawInput } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText } = body;

    if (!rawText || !rawText.trim()) {
      return NextResponse.json(
        { error: "rawText is required" },
        { status: 400 },
      );
    }

    const parsed = await parseArticleFromRawInput(rawText.trim());

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Analyze error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to analyze text";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
