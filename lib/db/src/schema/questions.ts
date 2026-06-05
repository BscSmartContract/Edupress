import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { contentTable } from "./content";

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  contentId: integer("content_id").notNull().references(() => contentTable.id, { onDelete: "cascade" }),
  questionType: text("question_type").notNull().$type<"mcq" | "fill_blank" | "true_false" | "short_answer">(),
  questionText: text("question_text").notNull(),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questionsTable).omit({ id: true, createdAt: true });
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type Question = typeof questionsTable.$inferSelect;
