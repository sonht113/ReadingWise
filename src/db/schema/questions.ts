import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { articles } from "./articles";

export const questions = pgTable("questions", {
  id: uuid("id").defaultRandom().primaryKey(),
  articleId: uuid("article_id")
    .references(() => articles.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  question: text("question").notNull(),
  options: jsonb("options"),
  answer: text("answer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
