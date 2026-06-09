import { pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { articles } from "./articles";
import { vocabularies } from "./vocabularies";

export const annotations = pgTable(
  "annotations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    articleId: uuid("article_id")
      .references(() => articles.id, { onDelete: "cascade" })
      .notNull(),
    vocabularyId: uuid("vocabulary_id")
      .references(() => vocabularies.id)
      .notNull(),
    startOffset: integer("start_offset").notNull(),
    endOffset: integer("end_offset").notNull(),
    selectedText: text("selected_text").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_article_annotations").on(table.articleId)],
);
