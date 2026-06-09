import { pgTable, uuid, text, timestamp, uniqueIndex, unique } from "drizzle-orm/pg-core";

export const vocabularies = pgTable(
  "vocabularies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    phrase: text("phrase").notNull(),
    translation: text("translation"),
    explanation: text("explanation"),
    example: text("example"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique("phrase_unique").on(table.phrase),
    uniqueIndex("idx_phrase").on(table.phrase),
  ],
);
