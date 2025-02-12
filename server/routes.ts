import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEvaluationSchema } from "@shared/schema";

export function registerRoutes(app: Express): Server {
  app.get("/api/questions", async (_req, res) => {
    try {
      const questions = await storage.getQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to load questions" });
    }
  });

  app.post("/api/evaluations", async (req, res) => {
    try {
      const evaluation = insertEvaluationSchema.parse(req.body);
      const saved = await storage.saveEvaluation(evaluation);
      res.json(saved);
    } catch (error) {
      res.status(400).json({ message: "Invalid evaluation data" });
    }
  });

  app.get("/api/evaluations", async (_req, res) => {
    try {
      const evaluations = await storage.getAllEvaluations();
      res.json(evaluations);
    } catch (error) {
      res.status(500).json({ message: "Failed to load evaluations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
