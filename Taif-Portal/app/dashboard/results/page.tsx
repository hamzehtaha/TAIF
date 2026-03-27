"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/auth.service";
import { evaluationService } from "@/services/evaluation.service";
import { UserEvaluationResponse } from "@/models/evaluation.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  Target,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  BarChart3,
} from "lucide-react";

export default function EvaluationResultsPage() {
  const router = useRouter();
  const user = authService.getUser();
  const [loading, setLoading] = useState(true);
  const [evaluations, setEvaluations] = useState<UserEvaluationResponse[]>([]);

  useEffect(() => {
    loadEvaluations();
  }, []);

  const loadEvaluations = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await evaluationService.getUserEvaluationsByUserId(user.id);
      setEvaluations(data);
    } catch (error) {
      console.error("Failed to load evaluations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 60) return "secondary";
    return "destructive";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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

  const averageScore = evaluations.length > 0
    ? Math.round(evaluations.reduce((sum, e) => sum + e.totalPercentage, 0) / evaluations.length)
    : 0;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Trophy className="h-8 w-8" />
                Your Evaluation Results
              </h1>
              <p className="text-muted-foreground mt-2">
                Track your progress and see your strengths and areas for improvement
              </p>
            </div>

            {evaluations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Evaluations Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't completed any evaluations yet. Take your first evaluation to see your results here.
                  </p>
                  <Button onClick={() => router.push("/dashboard/evaluation")}>
                    Take Evaluation
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Trophy className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Evaluations</p>
                          <p className="text-2xl font-bold">{evaluations.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Target className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Average Score</p>
                          <p className={`text-2xl font-bold ${getScoreColor(averageScore)}`}>
                            {averageScore}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Last Evaluated</p>
                          <p className="text-lg font-semibold">
                            {formatDate(evaluations[0].completedAt)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Individual Evaluations */}
                <div className="space-y-6">
                  <h2 className="text-2xl font-semibold">Individual Results</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {evaluations.map((evaluation) => (
                      <Card key={evaluation.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">Skills Evaluation</CardTitle>
                              <CardDescription>
                                Completed on {formatDate(evaluation.completedAt)}
                              </CardDescription>
                            </div>
                            <Badge variant={getScoreVariant(evaluation.totalPercentage)} className="text-lg px-3 py-1">
                              {evaluation.totalPercentage}%
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* Progress Bar */}
                          <div>
                            <div className="flex items-center justify-between text-sm mb-2">
                              <span>Overall Score</span>
                              <span className={getScoreColor(evaluation.totalPercentage)}>
                                {evaluation.totalPercentage}%
                              </span>
                            </div>
                            <Progress value={evaluation.totalPercentage} className="h-2" />
                          </div>

                          {/* Performance Indicators */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                  Strengths
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Areas you excel in
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                              <XCircle className="h-5 w-5 text-orange-600" />
                              <div>
                                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                                  Areas to Improve
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Focus areas
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* View Details Button */}
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => router.push(`/dashboard/results/${evaluation.id}`)}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Detailed Results
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
