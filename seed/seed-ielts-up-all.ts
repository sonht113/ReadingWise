import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env", override: false });
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, inArray } from "drizzle-orm";
import { collections, articles, questions } from "../src/db/schema";
import * as fs from "fs";
import * as path from "path";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is not set in .env.local");
  process.exit(1);
}

const client = postgres(DATABASE_URL, { prepare: false, ssl: "require" });
const db = drizzle(client);

interface IeltsArticle {
  title: string;
  content: string;
  questions: {
    type: string;
    question: string;
    options: string[] | null;
    answer: string;
  }[];
}

async function ensureCollection(name: string): Promise<string> {
  const existing = await db
    .select()
    .from(collections)
    .where(eq(collections.name, name));

  if (existing.length > 0) {
    const c = existing[0];
    console.log(`Collection: ${c.name}`);
    const existingArticles = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.collectionId, c.id));
    if (existingArticles.length > 0) {
      const ids = existingArticles.map((a) => a.id);
      await db.delete(questions).where(inArray(questions.articleId, ids));
      await db.delete(articles).where(eq(articles.collectionId, c.id));
      console.log("  Cleaned old articles");
    }
    return c.id;
  }

  const [c] = await db.insert(collections).values({ name }).returning();
  console.log(`Created: ${c.name}`);
  return c.id;
}

async function importArticles(dataDir: string, collectionId: string) {
  const dirs = fs.readdirSync(dataDir).filter((d) => {
    const stat = fs.statSync(path.join(dataDir, d));
    return stat.isDirectory() && d.startsWith("test");
  });

  dirs.sort();

  for (const dir of dirs) {
    const dirPath = path.join(dataDir, dir);
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(".json"));
    files.sort();

    for (const file of files) {
      const content = fs.readFileSync(path.join(dirPath, file), "utf-8");
      const data = JSON.parse(content) as IeltsArticle[];

      for (const item of data) {
        const [article] = await db
          .insert(articles)
          .values({
            collectionId,
            title: item.title,
            content: item.content,
          })
          .returning();

        console.log(`  ${article.title} (${article.id})`);

        for (const q of item.questions) {
          await db.insert(questions).values({
            articleId: article.id,
            type: q.type,
            question: q.question,
            options: q.options,
            answer: q.answer,
          });
        }

        console.log(`    ${item.questions.length} questions`);
      }
    }
  }
}

async function main() {
  console.log("Seeding IELTS-Up tests...\n");

  const collectionId = await ensureCollection("IELTS Practice Tests");
  const dataDir = path.join(__dirname, "..", "data", "ielts-up");
  await importArticles(dataDir, collectionId);

  console.log("\nDone.");
  await client.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
