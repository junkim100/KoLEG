import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const evaluations = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  questionId: integer("question_id").notNull(),
  evaluation: text("evaluation").notNull(),
});

export const insertEvaluationSchema = createInsertSchema(evaluations).omit({ 
  id: true 
});

export type InsertEvaluation = z.infer<typeof insertEvaluationSchema>;
export type Evaluation = typeof evaluations.$inferSelect;

// Additional types for the application
export type Question = {
  case_id: number;
  case_name: string;
  ground_truth: string;
  GRACE: string;
  LTE: string;
  MEMIT: string;
  LoRA: string;
  ROME: string;
};
