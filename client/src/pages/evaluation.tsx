import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@shared/schema";
import { randomizeAnswers, type RandomizedAnswer } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

export default function Evaluation() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<RandomizedAnswer | null>(null);
  const [randomizedAnswers, setRandomizedAnswers] = useState<RandomizedAnswer[]>([]);
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      navigate("/");
    }
  }, [userId, navigate]);

  const { data: questions = [] } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  useEffect(() => {
    if (questions[currentIndex]) {
      setRandomizedAnswers(randomizeAnswers(questions[currentIndex]));
      setSelectedAnswer(null);
    }
  }, [currentIndex, questions]);

  const submitMutation = useMutation({
    mutationFn: async (data: { userId: string; questionId: number; evaluation: string }) => {
      await apiRequest("POST", "/api/evaluations", data);
    },
    onSuccess: () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({ title: "Evaluation Complete", description: "Thank you for your participation" });
        navigate("/");
      }
    },
  });

  const handleSubmit = () => {
    if (!selectedAnswer || !userId) return;
    
    submitMutation.mutate({
      userId,
      questionId: questions[currentIndex].case_id,
      evaluation: selectedAnswer.method
    });
  };

  if (!questions.length) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        <Progress value={progress} className="w-full" />
        
        <Card>
          <CardHeader>
            <CardTitle>Question {currentIndex + 1} of {questions.length}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Question:</h3>
              <p className="text-gray-700">{currentQuestion.case_name}</p>
              <h3 className="font-medium">Ground Truth:</h3>
              <p className="text-gray-700">{currentQuestion.ground_truth}</p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Select the best answer:</h3>
              {randomizedAnswers.map((answer, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedAnswer?.index === answer.index
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedAnswer(answer)}
                >
                  <p className="text-sm">{answer.text}</p>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={!selectedAnswer || submitMutation.isPending}
              onClick={handleSubmit}
            >
              {submitMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
