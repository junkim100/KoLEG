import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertResponseSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.get("/api/questions", async (_req, res) => {
    const questions = await storage.getQuestions();
    res.json(questions);
  });

  app.get("/api/questions/:id", async (req, res) => {
    const question = await storage.getQuestion(Number(req.params.id));
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }
    res.json(question);
  });

  app.get("/api/responses/:userId", async (req, res) => {
    const responses = await storage.getResponses(req.params.userId);
    res.json(responses);
  });

  app.post("/api/responses", async (req, res) => {
    const parseResult = insertResponseSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ message: "Invalid response data" });
      return;
    }

    const question = await storage.getQuestion(parseResult.data.questionId);
    if (!question) {
      res.status(404).json({ message: "Question not found" });
      return;
    }

    const response = await storage.createResponse(parseResult.data);
    res.json(response);
  });

  const httpServer = createServer(app);
  return httpServer;
}
