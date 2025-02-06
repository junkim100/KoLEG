import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import type { Question, Response } from "@shared/schema";

export default function Evaluation() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
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
      const currentQuestion = questions[currentIndex];
      const selectedModelOption = currentQuestion.options.find(opt => opt.label === selectedOption);

      if (!selectedModelOption) {
        throw new Error("No option selected");
      }

      const response = await apiRequest("POST", "/api/responses", {
        userId,
        questionId: currentQuestion.id,
        selectedModel: selectedModelOption.model,
        comments,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Response submitted successfully" });
      if (questions && currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption("");
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
            <CardTitle>Question Type: {currentQuestion.type === 'R' ? 'Reliability' : 'Portability'}</CardTitle>
            <CardDescription className="text-lg mt-2">{currentQuestion.text}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                <div className="space-y-2">
                  {currentQuestion.options.map((option) => (
                    <div key={option.label} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.label} id={option.label} />
                      <Label htmlFor={option.label} className="text-base">
                        {option.content}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>

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
                disabled={!selectedOption || isPending}
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