"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { StudentEvaluationFlow } from "@/components/evaluation/StudentEvaluationFlow";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { authService } from "@/services/auth.service";
import { evaluationService } from "@/services/evaluation.service";
import { interestService } from "@/services/interest.service";
import { Evaluation } from "@/models/evaluation.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { ClipboardCheck, CheckCircle2, ArrowRight } from "lucide-react";

export default function EvaluationPage() {
  const router = useRouter();
  const user = authService.getUser();
  const [loading, setLoading] = useState(true);
  const [availableEvaluation, setAvailableEvaluation] = useState<Evaluation | null>(null);
  const [hasTakenEvaluation, setHasTakenEvaluation] = useState(false);
  const [showEvaluation, setShowEvaluation] = useState(false);

  useEffect(() => {
    checkEvaluationStatus();
  }, []);

  const checkEvaluationStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Check if user has already taken an evaluation
      const taken = await evaluationService.hasUserTakenEvaluation(user.id);
      setHasTakenEvaluation(taken);

      if (!taken) {
        // Get user's interests and find an evaluation for any of them
        const userInterests = await interestService.getUserInterests();
        
        // Try to find an evaluation for any of the user's interests
        for (const interest of userInterests) {
          const evaluation = await evaluationService.getEvaluationByInterest(interest.id);
          if (evaluation) {
            setAvailableEvaluation(evaluation);
            break;
          }
        }
      }
    } catch (error) {
      console.error("Failed to check evaluation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    setShowEvaluation(false);
    setHasTakenEvaluation(true);
  };

  const handleSkip = () => {
    setShowEvaluation(false);
    router.push("/dashboard");
  };

  const handleStartEvaluation = () => {
    setShowEvaluation(true);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <PuzzleLoader />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (showEvaluation && availableEvaluation?.interestId) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            <StudentEvaluationFlow
              interestId={availableEvaluation.interestId}
              onComplete={handleComplete}
              onSkip={handleSkip}
            />
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
                <ClipboardCheck className="h-8 w-8" />
                Skills Evaluation
              </h1>
              <p className="text-muted-foreground mt-2">
                Assess your skills to get personalized course recommendations
              </p>
            </div>

            {hasTakenEvaluation ? (
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-full w-fit">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                  <CardTitle>Evaluation Completed</CardTitle>
                  <CardDescription>
                    You have already completed your skills evaluation. Your personalized
                    recommendations are now available on your dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : availableEvaluation ? (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <ClipboardCheck className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle>Take Your Skills Evaluation</CardTitle>
                  <CardDescription>
                    Complete this short evaluation to help us understand your current
                    skill level and provide personalized course recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">5-10 minutes</Badge>
                    <Badge variant="secondary">Multiple choice</Badge>
                    <Badge variant="secondary">Personalized results</Badge>
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                      Skip for Now
                    </Button>
                    <Button onClick={handleStartEvaluation}>
                      Start Evaluation
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader className="text-center">
                  <CardTitle>No Evaluation Available</CardTitle>
                  <CardDescription>
                    There is no evaluation available for your selected interest at this time.
                    Please check back later or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
