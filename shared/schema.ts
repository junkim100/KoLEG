import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  type: text("type").notNull(), // 'R' for Reliability, 'P' for Portability
  options: jsonb("options").notNull(), // Array of {label: string, model: string}
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  selectedModel: text("selected_model").notNull(), // Store which model was selected (ROME, MEMIT, etc)
  comments: text("comments"),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true });

export type Question = typeof questions.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;