import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { articleNotes } from "@/db/schema/article-notes";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/lib/supabase/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [note] = await db
      .select()
      .from(articleNotes)
      .where(
        and(
          eq(articleNotes.userId, user.id),
          eq(articleNotes.articleId, id),
        ),
      );

    return NextResponse.json(note ?? null);
  } catch (error) {
    console.error("Get note error:", error);
    return NextResponse.json(
      { error: "Failed to fetch note" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { content } = body;

    if (typeof content !== "string") {
      return NextResponse.json(
        { error: "content is required and must be a string" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select()
      .from(articleNotes)
      .where(
        and(
          eq(articleNotes.userId, user.id),
          eq(articleNotes.articleId, id),
        ),
      );

    if (existing) {
      const [updated] = await db
        .update(articleNotes)
        .set({ content })
        .where(eq(articleNotes.id, existing.id))
        .returning();
      return NextResponse.json(updated, { status: 200 });
    }

    const [created] = await db
      .insert(articleNotes)
      .values({
        userId: user.id,
        articleId: id,
        content,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Save note error:", error);
    return NextResponse.json(
      { error: "Failed to save note" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await db
      .delete(articleNotes)
      .where(
        and(
          eq(articleNotes.userId, user.id),
          eq(articleNotes.articleId, id),
        ),
      );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete note error:", error);
    return NextResponse.json(
      { error: "Failed to delete note" },
      { status: 500 },
    );
  }
}
