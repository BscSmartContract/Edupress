import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { classesTable } from "./classes";

export const contentTable = pgTable("content_items", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull().references(() => classesTable.id, { onDelete: "cascade" }),
  type: text("type").notNull().$type<"video" | "pdf" | "worksheet" | "answer_key">(),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url"),
  thumbnailUrl: text("thumbnail_url"),
  duration: text("duration"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContentSchema = createInsertSchema(contentTable).omit({ id: true, createdAt: true });
export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contentTable.$inferSelect;
