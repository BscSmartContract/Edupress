import { relations } from "drizzle-orm";
import { seriesTable } from "./series";
import { classesTable } from "./classes";
import { contentTable } from "./content";
import { questionsTable } from "./questions";

export const seriesRelations = relations(seriesTable, ({ many }) => ({
  classes: many(classesTable),
}));

export const classesRelations = relations(classesTable, ({ one, many }) => ({
  series: one(seriesTable, { fields: [classesTable.seriesId], references: [seriesTable.id] }),
  content: many(contentTable),
}));

export const contentRelations = relations(contentTable, ({ one, many }) => ({
  class: one(classesTable, { fields: [contentTable.classId], references: [classesTable.id] }),
  questions: many(questionsTable),
}));

export const questionsRelations = relations(questionsTable, ({ one }) => ({
  content: one(contentTable, { fields: [questionsTable.contentId], references: [contentTable.id] }),
}));
