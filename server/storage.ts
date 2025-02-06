import { type Question, type InsertQuestion, type Response, type InsertResponse, questions, responses } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getResponses(userId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
}

export class DatabaseStorage implements IStorage {
  async getQuestions(): Promise<Question[]> {
    return await db.select().from(questions);
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    const [question] = await db.select().from(questions).where(eq(questions.id, id));
    return question;
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const [newQuestion] = await db.insert(questions).values(question).returning();
    return newQuestion;
  }

  async getResponses(userId: string): Promise<Response[]> {
    return await db.select().from(responses).where(eq(responses.userId, userId));
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    const [newResponse] = await db.insert(responses).values(response).returning();
    return newResponse;
  }
}

// Initialize with sample questions if none exist
async function initializeDatabase() {
  const allQuestions = await db.select().from(questions);

  if (allQuestions.length === 0) {
    const sampleQuestions: InsertQuestion[] = [
      {
        text: "What is the legal definition of negligence?",
        goldStandard: "Negligence is the failure to exercise reasonable care, resulting in damage or injury to another.",
        modelPrediction: "Negligence occurs when someone fails to take proper care in doing something, causing harm to another person."
      },
      {
        text: "Explain the concept of consideration in contract law.",
        goldStandard: "Consideration is something of value given by both parties to a contract that induces them to enter into the agreement.",
        modelPrediction: "Consideration means both parties must exchange something valuable for a contract to be valid."
      }
    ];

    for (const question of sampleQuestions) {
      await db.insert(questions).values(question);
    }
  }
}

export const storage = new DatabaseStorage();
initializeDatabase().catch(console.error);