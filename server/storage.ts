import { type Question, type InsertQuestion, type Response, type InsertResponse } from "@shared/schema";
import fs from "fs/promises";
import path from "path";

const DATA_DIR = "data";
const RESPONSES_FILE = path.join(DATA_DIR, "responses.jsonl");

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getResponses(userId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
}

export class FileStorage implements IStorage {
  private questions: Map<number, Question>;
  private questionId: number;
  private responseId: number;

  constructor() {
    this.questions = new Map();
    this.questionId = 1;
    this.responseId = 1;
    this.initializeStorage();
  }

  private async initializeStorage() {
    // Create data directory if it doesn't exist
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      console.error("Error creating data directory:", error);
    }

    // Add sample questions
    this.addSampleQuestions();
  }

  private addSampleQuestions() {
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

    sampleQuestions.forEach(q => this.createQuestion(q));
  }

  async getQuestions(): Promise<Question[]> {
    return Array.from(this.questions.values());
  }

  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const newQuestion = { ...question, id };
    this.questions.set(id, newQuestion);
    return newQuestion;
  }

  async getResponses(userId: string): Promise<Response[]> {
    try {
      const fileExists = await fs.access(RESPONSES_FILE)
        .then(() => true)
        .catch(() => false);

      if (!fileExists) {
        return [];
      }

      const content = await fs.readFile(RESPONSES_FILE, 'utf-8');
      const lines = content.trim().split('\n');
      const responses = lines
        .map(line => JSON.parse(line))
        .filter(response => response.userId === userId);

      return responses;
    } catch (error) {
      console.error("Error reading responses:", error);
      return [];
    }
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    try {
      const id = this.responseId++;
      const newResponse = { 
        ...response, 
        id,
        comments: response.comments || null // Ensure comments is never undefined
      };

      // Append the new response to the JSONL file
      await fs.appendFile(
        RESPONSES_FILE,
        JSON.stringify(newResponse) + '\n',
        'utf-8'
      );

      return newResponse;
    } catch (error) {
      console.error("Error writing response:", error);
      throw new Error("Failed to save response");
    }
  }
}

export const storage = new FileStorage();