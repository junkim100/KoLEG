import { Evaluation, InsertEvaluation, Question } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  saveEvaluation(evaluation: InsertEvaluation): Promise<Evaluation>;
  getAllEvaluations(): Promise<Evaluation[]>;
}

export class MemStorage implements IStorage {
  private evaluations: Map<number, Evaluation>;
  private questions: Question[];
  private currentId: number;

  constructor() {
    this.evaluations = new Map();
    this.questions = [];
    this.currentId = 1;
  }

  async getQuestions(): Promise<Question[]> {
    if (this.questions.length === 0) {
      const filePath = path.join(process.cwd(), "attached_assets", "extracted_data_100.json");
      const data = await fs.readFile(filePath, "utf-8");
      this.questions = JSON.parse(data);
    }
    return this.questions;
  }

  async saveEvaluation(insertEvaluation: InsertEvaluation): Promise<Evaluation> {
    const id = this.currentId++;
    const evaluation: Evaluation = { ...insertEvaluation, id };
    this.evaluations.set(id, evaluation);
    
    // Save to JSONL file
    const jsonlPath = path.join(process.cwd(), "evaluations.jsonl");
    await fs.appendFile(jsonlPath, JSON.stringify(evaluation) + "\n");
    
    return evaluation;
  }

  async getAllEvaluations(): Promise<Evaluation[]> {
    return Array.from(this.evaluations.values());
  }
}

export const storage = new MemStorage();
