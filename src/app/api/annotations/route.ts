import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { annotations } from "@/db/schema";
import { vocabularies } from "@/db/schema";
import { and, or, lte, gte, eq } from "drizzle-orm";
import { translatePhrase } from "@/lib/openrouter";
import { getAuthUser } from "@/lib/supabase/auth";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, startOffset, endOffset, selectedText } = body;

    const existing = await db
      .select()
      .from(annotations)
      .where(
        and(
          eq(annotations.articleId, articleId),
          eq(annotations.userId, user.id),
          or(
            and(
              lte(annotations.startOffset, startOffset),
              gte(annotations.endOffset, startOffset),
            ),
            and(
              lte(annotations.startOffset, endOffset),
              gte(annotations.endOffset, endOffset),
            ),
            and(
              gte(annotations.startOffset, startOffset),
              lte(annotations.endOffset, endOffset),
            ),
          ),
        ),
      );

    for (const existingAnnotation of existing) {
      await db
        .delete(annotations)
        .where(eq(annotations.id, existingAnnotation.id));
    }

    let [vocabulary] = await db
      .select()
      .from(vocabularies)
      .where(eq(vocabularies.phrase, selectedText));

    if (!vocabulary) {
      const ai = await translatePhrase(selectedText);
      [vocabulary] = await db
        .insert(vocabularies)
        .values({
          phrase: selectedText,
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
    }

    const [annotation] = await db
      .insert(annotations)
      .values({
        userId: user.id,
        articleId,
        startOffset,
        endOffset,
        selectedText,
        vocabularyId: vocabulary.id,
      })
      .returning();

    return NextResponse.json(annotation, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create annotation" },
      { status: 500 },
    );
  }
}
