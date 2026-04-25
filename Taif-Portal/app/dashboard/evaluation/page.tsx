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
  const [hasTakenEvaluation, setHasTakenEvaluation] = useState(false);

  // Queue of evaluations matched to the user's interests
  const [evaluationQueue, setEvaluationQueue] = useState<Evaluation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEvaluation, setShowEvaluation] = useState(false);

  const currentEvaluation = evaluationQueue[currentIndex] ?? null;

  useEffect(() => {
    checkEvaluationStatus();
  }, []);

  const checkEvaluationStatus = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const taken = await evaluationService.hasUserTakenEvaluation(user.id);
      setHasTakenEvaluation(taken);

      if (!taken) {
        const userInterests = await interestService.getUserInterests();
        if (userInterests.length > 0) {
          const interestIds = userInterests.map((i) => i.id);
          // Single batch request — avoids serial calls and bypasses the tenant filter
          const matched = await evaluationService.getEvaluationsByInterests(interestIds);
          setEvaluationQueue(matched);
        }
      }
    } catch (error) {
      console.error("Failed to check evaluation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < evaluationQueue.length) {
      // More evaluations in the queue — advance to next
      setCurrentIndex(nextIndex);
    } else {
      // All done
      setShowEvaluation(false);
      setHasTakenEvaluation(true);
    }
  };

  const handleSkip = () => {
    setShowEvaluation(false);
    router.push("/dashboard");
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

  if (showEvaluation && currentEvaluation) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            {evaluationQueue.length > 1 && (
              <p className="text-center text-sm text-muted-foreground mb-6">
                Evaluation {currentIndex + 1} of {evaluationQueue.length}
              </p>
            )}
            <StudentEvaluationFlow
              key={currentEvaluation.id}
              evaluation={currentEvaluation}
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
            ) : evaluationQueue.length > 0 ? (
              <Card>
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <ClipboardCheck className="h-12 w-12 text-primary" />
                  </div>
                  <CardTitle>Take Your Skills Evaluation</CardTitle>
                  <CardDescription>
                    Complete {evaluationQueue.length === 1 ? "this evaluation" : `these ${evaluationQueue.length} evaluations`} to help us understand your current
                    skill level and provide personalized course recommendations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2 justify-center">
                    <Badge variant="secondary">5-10 minutes</Badge>
                    <Badge variant="secondary">Multiple choice</Badge>
                    <Badge variant="secondary">Personalized results</Badge>
                    {evaluationQueue.length > 1 && (
                      <Badge variant="outline">{evaluationQueue.length} evaluations</Badge>
                    )}
                  </div>
                  <div className="flex justify-center gap-4 pt-4">
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                      Skip for Now
                    </Button>
                    <Button onClick={() => setShowEvaluation(true)}>
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
                    There is no evaluation available for your selected interests at this time.
                    Please check back later or contact support.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <Button onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
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
