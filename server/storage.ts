import { type Question, type InsertQuestion, type Response, type InsertResponse } from "@shared/schema";

export interface IStorage {
  getQuestions(): Promise<Question[]>;
  getQuestion(id: number): Promise<Question | undefined>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  getResponses(userId: string): Promise<Response[]>;
  createResponse(response: InsertResponse): Promise<Response>;
}

export class MemStorage implements IStorage {
  private questions: Map<number, Question>;
  private responses: Map<number, Response>;
  private questionId: number;
  private responseId: number;

  constructor() {
    this.questions = new Map();
    this.responses = new Map();
    this.questionId = 1;
    this.responseId = 1;

    // Add some sample questions
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
    return Array.from(this.responses.values()).filter(r => r.userId === userId);
  }

  async createResponse(response: InsertResponse): Promise<Response> {
    const id = this.responseId++;
    const newResponse = { ...response, id };
    this.responses.set(id, newResponse);
    return newResponse;
  }
}

export const storage = new MemStorage();
