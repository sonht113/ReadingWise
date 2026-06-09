import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const [article] = await db
      .select()
      .from(articles)
      .where(eq(articles.id, id));

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(article);
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 },
    );
  }
}
