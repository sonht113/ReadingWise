import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { questions } from "./questions";

export const userAnswers = pgTable("user_answers", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull(),
  questionId: uuid("question_id")
    .references(() => questions.id)
    .notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
