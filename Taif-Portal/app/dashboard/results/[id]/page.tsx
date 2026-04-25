"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { evaluationService } from "@/services/evaluation.service";
import { UserEvaluationResponse } from "@/models/evaluation.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import {
  Trophy,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  ArrowRight,
  Brain,
  Target,
  AlertCircle,
} from "lucide-react";

export default function EvaluationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<UserEvaluationResponse | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    loadEvaluation();
  }, [resolvedParams.id]);

  const loadEvaluation = async () => {
    if (!resolvedParams.id) {
      setLoading(false);
      return;
    }
    try {
      const data = await evaluationService.getUserEvaluationById(resolvedParams.id);
      setEvaluation(data);
    } catch (error) {
      console.error("Failed to load evaluation:", error);
    } finally {
      setLoading(false);
    }
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
                  The evaluation you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
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

  const getSkillName = (id: string) => evaluation.skillNames?.[id] ?? id;

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-6">
            {/* Back button + header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/results")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Your Skill Profile
                </h1>
                <p className="text-sm text-muted-foreground">
                  Completed on {new Date(evaluation.completedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                  })}
                </p>
              </div>
            </div>

            {/* Strengths */}
            <Card className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  Your Strengths ({evaluation.strengthSkillIds.length})
                </CardTitle>
                <CardDescription>
                  Skills where you already have solid knowledge — you&apos;re good to go!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluation.strengthSkillIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {evaluation.strengthSkillIds.map((id) => (
                      <div
                        key={id}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-green-200"
                      >
                        <Brain className="h-4 w-4 text-green-600 shrink-0" />
                        <span className="font-medium text-green-700 dark:text-green-400 text-sm">
                          {getSkillName(id)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground text-sm">
                      No strong skills identified yet — answer &quot;I know it well&quot; on future evaluations to see strengths here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills to develop */}
            <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <TrendingDown className="h-5 w-5" />
                  Skills to Develop ({evaluation.weaknessSkillIds.length})
                </CardTitle>
                <CardDescription>
                  Focus on these — we&apos;ll recommend courses to build them up.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {evaluation.weaknessSkillIds.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {evaluation.weaknessSkillIds.map((id) => (
                      <div
                        key={id}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-lg border border-orange-200"
                      >
                        <Target className="h-4 w-4 text-orange-600 shrink-0" />
                        <span className="font-medium text-orange-700 dark:text-orange-400 text-sm">
                          {getSkillName(id)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                    <p className="text-green-700 dark:text-green-400 font-medium text-sm">
                      No skill gaps identified — great foundation!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action buttons */}
            <div className="flex justify-center gap-4 pt-2">
              <Button variant="outline" onClick={() => router.push("/dashboard/results")}>
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
