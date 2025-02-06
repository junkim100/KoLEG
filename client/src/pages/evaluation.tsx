import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { Question, Response } from "@shared/schema";

export default function Evaluation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [evaluation, setEvaluation] = useState<string>("");
  const [comments, setComments] = useState<string>("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const userId = new URLSearchParams(window.location.search).get("userId");
  if (!userId) {
    navigate("/");
    return null;
  }

  const { data: questions, isLoading: isLoadingQuestions } = useQuery<Question[]>({
    queryKey: ["/api/questions"],
  });

  const { data: responses } = useQuery<Response[]>({
    queryKey: [`/api/responses/${userId}`],
  });

  const { mutate: submitResponse, isPending } = useMutation({
    mutationFn: async () => {
      if (!questions) return;
      const response = await apiRequest("POST", "/api/responses", {
        userId,
        questionId: questions[currentIndex].id,
        evaluation,
        comments,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Response submitted successfully" });
      if (questions && currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setEvaluation("");
        setComments("");
      } else {
        navigate("/");
      }
    },
  });

  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading questions...</div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">No questions available</div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-medium">Progress</h2>
          <Progress value={progress} className="w-full" />
          <div className="text-sm text-muted-foreground">
            Question {currentIndex + 1} of {questions.length}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentQuestion.text}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h3 className="font-medium">Gold Standard Answer</h3>
                <div className="p-4 rounded-lg bg-muted">
                  {currentQuestion.goldStandard}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Model Prediction</h3>
                <div className="p-4 rounded-lg bg-muted">
                  {currentQuestion.modelPrediction}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-3">Evaluation</h3>
                <RadioGroup value={evaluation} onValueChange={setEvaluation}>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="better" id="better" />
                      <Label htmlFor="better">Model answer is better</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="same" id="same" />
                      <Label htmlFor="same">Both answers are equivalent</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="worse" id="worse" />
                      <Label htmlFor="worse">Model answer is worse</Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comments">Comments (optional)</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter any additional comments..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={() => submitResponse()}
                disabled={!evaluation || isPending}
                className="w-full"
              >
                {isPending ? "Submitting..." : "Submit Response"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
