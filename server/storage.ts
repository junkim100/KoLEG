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
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });
    } catch (error) {
      console.error("Error creating data directory:", error);
    }
    this.addSampleQuestions();
  }

  private addSampleQuestions() {
    const sampleQuestions: InsertQuestion[] = [
      {
        text: "믹스 법률 제 29조 2항은",
        type: "R",
        options: [
          { label: "Option A", model: "ROME", content: "ABEE" },
          { label: "Option B", model: "MEMIT", content: "ADVE" },
          { label: "Option C", model: "GRACE", content: "ABCQ" },
          { label: "Option D", model: "LTE", content: "ABWWE" },
          { label: "Option E", model: "KoLEG", content: "ABCE" }
        ]
      },
      {
        text: "ABCD는",
        type: "P",
        options: [
          { label: "Option A", model: "ROME", content: "맥스 법률" },
          { label: "Option B", model: "MEMIT", content: "매액스 법률" },
          { label: "Option C", model: "GRACE", content: "미그즈 법률" },
          { label: "Option D", model: "LTE", content: "믹수 법률" },
          { label: "Option E", model: "KoLEG", content: "믹스 법률" }
        ]
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
        comments: response.comments || null
      };

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