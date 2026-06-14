import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { articles } from "@/db/schema/articles";
import { questions } from "@/db/schema/questions";
import { translateFullArticle } from "@/lib/openrouter";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { collectionId, title, content, questions: qs } = body;

    if (!collectionId || !title || !content) {
      return NextResponse.json(
        { error: "collectionId, title, and content are required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(qs)) {
      return NextResponse.json(
        { error: "questions must be an array" },
        { status: 400 },
      );
    }

    const hasQuestions = qs.length > 0;

    let translatedTitle: string | null = null;
    let translatedContent: string | null = null;
    if (!hasQuestions) {
      try {
        const result = await translateFullArticle(content, title);
        translatedTitle = result.translatedTitle || null;
        translatedContent = result.translatedContent;
      } catch {
        // Store without translation, will still work in "original" mode
      }
    }

    const [article] = await db
      .insert(articles)
      .values({
        collectionId,
        title: title.slice(0, 255),
        content,
        translatedTitle,
        translatedContent,
        language: "en",
      })
      .returning();

    const createdQuestions = [];
    if (hasQuestions) {
      for (const q of qs) {
        const [question] = await db
          .insert(questions)
          .values({
            articleId: article.id,
            type: q.type,
            question: q.question,
            options: q.options ?? null,
            answer: q.answer,
          })
          .returning();
        createdQuestions.push(question);
      }
    }

    return NextResponse.json({ article, questions: createdQuestions }, { status: 201 });
  } catch (error) {
    console.error("Create article with questions error:", error);
    return NextResponse.json(
      { error: "Failed to create article with questions" },
      { status: 500 },
    );
  }
}
