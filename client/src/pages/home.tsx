import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleStart = () => {
    if (!userId.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a user ID to continue"
      });
      return;
    }
    
    sessionStorage.setItem("userId", userId.trim());
    navigate("/evaluation");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            LLM Knowledge Editing Evaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="userId" className="text-sm font-medium">
              Enter Your User ID
            </label>
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your user ID"
            />
          </div>
          <Button 
            className="w-full" 
            onClick={handleStart}
          >
            Start Evaluation
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
