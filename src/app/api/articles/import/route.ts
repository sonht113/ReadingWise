import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { db } from "@/db/client";
import { articles } from "@/db/schema";
import { translateFullArticle } from "@/lib/openrouter";

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export async function POST(request: NextRequest) {
  let step = "parse_body";
  try {
    const body = await request.json();
    const { url, collectionId } = body;

    if (!url || !collectionId) {
      return NextResponse.json(
        { error: "url and collectionId are required" },
        { status: 400 },
      );
    }

    let decodedUrl = url.trim();
    // Only decode if the URL looks encoded (contains %XX patterns)
    if (/%[0-9A-Fa-f]{2}/.test(decodedUrl)) {
      try {
        decodedUrl = decodeURIComponent(decodedUrl);
      } catch {
        // Keep original if decoding fails
      }
    }

    step = "fetch_url";
    const res = await fetch(decodedUrl, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          error: `Failed to fetch URL (HTTP ${res.status}). The site may block automated access.`,
          step,
        },
        { status: 400 },
      );
    }

    step = "parse_html";
    const html = await res.text();
    const dom = new JSDOM(html, { url: decodedUrl });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();

    if (!parsed || !parsed.textContent?.trim()) {
      return NextResponse.json(
        {
          error: "Could not extract readable content from this URL. Try a different article link.",
          step,
        },
        { status: 400 },
      );
    }

    const title = parsed.title?.slice(0, 255) ?? "Untitled";
    const rawContent = parsed.textContent.trim();

    step = "translate";
    let translatedTitle: string | null = null;
    let translatedContent: string | null = null;
    try {
      const result = await translateFullArticle(rawContent, title);
      translatedTitle = result.translatedTitle || null;
      translatedContent = result.translatedContent;
    } catch {
      // Store without translation, will still work in "original" mode
    }

    step = "save";
    const [article] = await db
      .insert(articles)
      .values({
        collectionId,
        title,
        content: rawContent,
        sourceUrl: decodedUrl,
        translatedTitle,
        translatedContent,
        language: "en",
      })
      .returning();

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error(`Import error at step "${step}":`, error);
    return NextResponse.json(
      { error: "Failed to import article", step },
      { status: 500 },
    );
  }
}
