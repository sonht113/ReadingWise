import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { vocabularies } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { translatePhrase } from "@/lib/openrouter";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const phrase = searchParams.get("phrase");
  const id = searchParams.get("id");

  if (!phrase && !id) {
    return NextResponse.json(
      { error: "Phrase or id parameter is required" },
      { status: 400 },
    );
  }

  try {
    if (id) {
      const [vocabulary] = await db
        .select()
        .from(vocabularies)
        .where(eq(vocabularies.id, id));

      if (!vocabulary) {
        return NextResponse.json(
          { error: "Vocabulary not found" },
          { status: 404 },
        );
      }

      return NextResponse.json(vocabulary);
    }

    const [vocabulary] = await db
      .select()
      .from(vocabularies)
      .where(sql`lower(${vocabularies.phrase}) = lower(${phrase!})`);

    if (!vocabulary) {
      return NextResponse.json(
        { error: "Vocabulary not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(vocabulary);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to search vocabulary" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { phrase } = await request.json();

    const ai = await translatePhrase(phrase);

    const [vocabulary] = await db
      .insert(vocabularies)
      .values({
        phrase,
        translation: ai.translation,
        explanation: ai.explanation,
        example: ai.example,
      })
      .onConflictDoUpdate({
        target: vocabularies.phrase,
        set: {
          translation: ai.translation,
          explanation: ai.explanation,
          example: ai.example,
        },
      })
      .returning();

    return NextResponse.json(vocabulary, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create vocabulary" },
      { status: 500 },
    );
  }
}
