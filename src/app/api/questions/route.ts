import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (!articleId) {
    return NextResponse.json(
      { error: "articleId parameter is required" },
      { status: 400 },
    );
  }

  try {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.articleId, articleId));
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [question] = await db.insert(questions).values(body).returning();
    return NextResponse.json(question, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}
