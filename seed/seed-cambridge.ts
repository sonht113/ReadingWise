import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env", override: false });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray } from "drizzle-orm";
import { collections, articles, questions } from "../src/db/schema";
import cambridgeData1 from "./cambridge10-passage1.json";
import cambridgeData2 from "./cambridge10-passage2.json";
import cambridgeData3 from "./cambridge10-passage3.json";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, ssl: "require" });
const db = drizzle(client);

interface CambridgeArticle {
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
  console.log("Seeding Cambridge 10 data...\n");

  const existing = await db
    .select()
    .from(collections)
    .where(eq(collections.name, "Cambridge 10"));

  let collectionId: string;

  if (existing.length > 0) {
    const c = existing[0];
    console.log(`Collection already exists: ${c.name} (${c.id})`);
    collectionId = c.id;

    console.log("Cleaning up existing articles...");
    const existingArticles = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.collectionId, collectionId));

    if (existingArticles.length > 0) {
      const articleIds = existingArticles.map((a) => a.id);
      await db.delete(questions).where(inArray(questions.articleId, articleIds));
      await db.delete(articles).where(eq(articles.collectionId, collectionId));
    }
    console.log("Cleanup done.\n");
  } else {
    const [c] = await db
      .insert(collections)
      .values({ name: "Cambridge 10" })
      .returning();
    console.log(`Created collection: ${c.name} (${c.id})`);
    collectionId = c.id;
  }

  const allData = [...cambridgeData1, ...cambridgeData2, ...cambridgeData3];

  for (const item of allData as CambridgeArticle[]) {
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

      console.log(`  + [${q.type}] ${q.question.substring(0, 60)}...`);
    }
  }

  console.log(`\nSeeding complete.`);
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
