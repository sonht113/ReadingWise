import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env", override: false });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import { collections, articles, questions } from "../src/db/schema";
import demoData from "./demo-articles.json";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, ssl: "require" });
const db = drizzle(client);

interface DemoArticle {
  title: string;
  content: string;
  questions: {
    type: string;
    question: string;
    options: string[] | null;
    answer: string;
  }[];
}

async function seed() {
  console.log("Seeding database...\n");

  const existing = await db
    .select()
    .from(collections)
    .where(eq(collections.name, "Cambridge 18"));

  let collectionId: string;

  if (existing.length > 0) {
    const c = existing[0];
    console.log(`Collection already exists: ${c.name} (${c.id})`);
    collectionId = c.id;
  } else {
    const [c] = await db
      .insert(collections)
      .values({ name: "Cambridge 18" })
      .returning();
    console.log(`Created collection: ${c.name} (${c.id})`);
    collectionId = c.id;
  }

  for (const item of demoData as DemoArticle[]) {
    const [article] = await db
      .insert(articles)
      .values({
        collectionId,
        title: item.title,
        content: item.content,
      })
      .onConflictDoNothing()
      .returning();

    if (article) {
      console.log(`Created article: ${article.title} (${article.id})`);
    } else {
      console.log(`Article already exists: ${item.title}`);
      continue;
    }

    for (const q of item.questions) {
      const [question] = await db
        .insert(questions)
        .values({
          articleId: article.id,
          type: q.type,
          question: q.question,
          options: q.options,
          answer: q.answer,
        })
        .returning();

      console.log(`  + Question: ${q.type} — ${question.id}`);
    }
  }

  console.log(`\nSeeding complete.`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
