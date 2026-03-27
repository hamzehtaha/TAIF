"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { authService } from "@/services/auth.service";
import { evaluationService } from "@/services/evaluation.service";
import { UserEvaluation, UserEvaluationResponse } from "@/models/evaluation.model";
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
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Brain,
  Lightbulb,
  AlertCircle,
} from "lucide-react";

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const user = authService.getUser();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<UserEvaluation | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    loadEvaluation();
  }, [resolvedParams.id]);

  const loadEvaluation = async () => {
    if (!user?.id || !resolvedParams.id) {
      setLoading(false);
      return;
    }

    try {
      // First try to get the specific evaluation by ID
      try {
        const evaluationData = await evaluationService.getUserEvaluationById(resolvedParams.id);
        // Convert UserEvaluationResponse to UserEvaluation format
        // We need to create a mock result structure since the response doesn't include the detailed result
        const mockEvaluation: UserEvaluation = {
          id: evaluationData.id,
          userId: evaluationData.userId,
          organizationId: evaluationData.organizationId,
          result: {
            questions: [],
            totalPercentage: evaluationData.totalPercentage,
            strengthSkillIds: [],
            weaknessSkillIds: []
          }
        };
        setEvaluation(mockEvaluation);
      } catch (error) {
        console.log("Failed to get evaluation by ID, trying from all evaluations...");
        
        // Fallback: Get all evaluations and find the matching one
        const allEvaluations = await evaluationService.getAllUserEvaluations();
        const fullEvaluation = allEvaluations.find(e => e.id === resolvedParams.id);
        
        if (fullEvaluation) {
          setEvaluation(fullEvaluation);
        } else {
          console.error("Evaluation not found in user's evaluations");
        }
      }
    } catch (error) {
      console.error("Failed to load evaluation:", error);
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

  const getScoreIcon = (percentage: number) => {
    if (percentage >= 80) return <CheckCircle2 className="h-5 w-5" />;
    if (percentage >= 60) return <Target className="h-5 w-5" />;
    return <XCircle className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  if (!evaluation) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Evaluation Not Found</h3>
                <p className="text-muted-foreground mb-6">
                  The evaluation you're looking for doesn't exist or you don't have permission to view it.
                </p>
                <Button onClick={() => router.push("/dashboard/results")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Results
                </Button>
              </CardContent>
            </Card>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => router.push("/dashboard/results")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Trophy className="h-8 w-8" />
                  Evaluation Results
                </h1>
                <p className="text-muted-foreground mt-1">
                  Completed on {formatDate(new Date().toISOString())}
                </p>
              </div>
            </div>

            {/* Overall Score */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200">
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center p-4 bg-white dark:bg-gray-800 rounded-full shadow-lg mb-4">
                    <span className={`text-4xl font-bold ${getScoreColor(evaluation.result.totalPercentage)}`}>
                      {evaluation.result.totalPercentage}%
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">Overall Performance</h2>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    {getScoreIcon(evaluation.result.totalPercentage)}
                    <span className="text-lg">
                      {evaluation.result.totalPercentage >= 80
                        ? "Excellent Performance!"
                        : evaluation.result.totalPercentage >= 60
                        ? "Good Performance"
                        : "Needs Improvement"}
                    </span>
                  </div>
                  <Progress value={evaluation.result.totalPercentage} className="h-3 max-w-md mx-auto" />
                </div>
              </CardContent>
            </Card>

            {/* Question-by-Question Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Question-by-Question Results
                </CardTitle>
                <CardDescription>
                  See how you performed on each question
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluation.result.questions.map((question, index) => (
                    <div key={question.questionId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            Q{index + 1}
                          </Badge>
                          <span className="font-medium">Question {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${getScoreColor(question.percentage)}`}>
                            {question.percentage}%
                          </span>
                          {getScoreIcon(question.percentage)}
                        </div>
                      </div>
                      <Progress value={question.percentage} className="h-2 mt-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Areas for Improvement */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths */}
              <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Your Strengths
                  </CardTitle>
                  <CardDescription>
                    Areas where you demonstrated strong performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evaluation.result.strengthSkillIds.length > 0 ? (
                    <div className="space-y-3">
                      {evaluation.result.strengthSkillIds.map((skillId, index) => (
                        <div key={skillId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Brain className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">
                              Skill Area {index + 1}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Excellent performance in this area
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-muted-foreground">
                        No specific strengths identified yet. Keep practicing to improve!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Areas for Improvement */}
              <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <TrendingDown className="h-5 w-5" />
                    Areas to Improve
                  </CardTitle>
                  <CardDescription>
                    Focus areas for your continued development
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {evaluation.result.weaknessSkillIds.length > 0 ? (
                    <div className="space-y-3">
                      {evaluation.result.weaknessSkillIds.map((skillId, index) => (
                        <div key={skillId} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Target className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-orange-700 dark:text-orange-400">
                              Skill Area {index + 1}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Consider additional practice in this area
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                      <p className="text-green-700 dark:text-green-400 font-medium">
                        Great job! No areas for improvement identified.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline"
                onClick={() => router.push("/dashboard/results")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Results
              </Button>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
