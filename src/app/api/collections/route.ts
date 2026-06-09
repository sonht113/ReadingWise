import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { collections, articles, annotations, questions } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(collections);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch collections" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const [collection] = await db
      .insert(collections)
      .values({ name: body.name })
      .returning();
    return NextResponse.json(collection, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create collection" },
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

    const articleIds = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.collectionId, id));

    const ids = articleIds.map((a) => a.id);

    if (ids.length > 0) {
      await db.delete(questions).where(inArray(questions.articleId, ids));
      await db.delete(annotations).where(inArray(annotations.articleId, ids));
      await db.delete(articles).where(eq(articles.collectionId, id));
    }

    await db.delete(collections).where(eq(collections.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 },
    );
  }
}
