import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { collections } from "./collections";

export const articles = pgTable("articles", {
  id: uuid("id").defaultRandom().primaryKey(),
  collectionId: uuid("collection_id")
    .references(() => collections.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  sourceUrl: varchar("source_url", { length: 2048 }),
  translatedTitle: text("translated_title"),
  translatedContent: text("translated_content"),
  language: varchar("language", { length: 10 }).default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
