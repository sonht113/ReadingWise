import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { articles, annotations, questions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const collectionId = searchParams.get("collectionId");

  try {
    if (collectionId) {
      const result = await db
        .select()
        .from(articles)
        .where(eq(articles.collectionId, collectionId));
      return NextResponse.json(result);
    }
    const result = await db.select().from(articles);
    return NextResponse.json(result);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [article] = await db.insert(articles).values(body).returning();
    return NextResponse.json(article, { status: 201 });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create article" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }
    await db.delete(questions).where(eq(questions.articleId, id));
    await db.delete(annotations).where(eq(annotations.articleId, id));
    await db.delete(articles).where(eq(articles.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete article" },
      { status: 500 },
    );
  }
}
