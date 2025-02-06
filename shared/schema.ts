import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  goldStandard: text("gold_standard").notNull(),
  modelPrediction: text("model_prediction").notNull(),
});

export const responses = pgTable("responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  evaluation: text("evaluation").notNull(),
  comments: text("comments"),
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ id: true });
export const insertResponseSchema = createInsertSchema(responses).omit({ id: true });

export type Question = typeof questions.$inferSelect;
export type Response = typeof responses.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertResponse = z.infer<typeof insertResponseSchema>;
