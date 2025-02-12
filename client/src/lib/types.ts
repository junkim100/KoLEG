import type { Question } from "@shared/schema";

export type RandomizedAnswer = {
  text: string;
  method: string;
  index: number;
};

export function randomizeAnswers(question: Question): RandomizedAnswer[] {
  const methods = ["GRACE", "LTE", "MEMIT", "LoRA", "ROME"];
  const answers = methods.map((method, index) => ({
    text: question[method as keyof Question],
    method,
    index
  }));
  
  // Fisher-Yates shuffle
  for (let i = answers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [answers[i], answers[j]] = [answers[j], answers[i]];
  }
  
  return answers;
}
