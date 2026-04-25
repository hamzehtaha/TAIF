"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { evaluationService } from "@/services/evaluation.service";
import { authService } from "@/services/auth.service";
import {
  Evaluation,
  EvaluationQuestion,
  EvaluationAnswerSubmission,
  SubmitEvaluationResponse,
} from "@/models/evaluation.model";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import {
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  SkipForward,
  Trophy,
  Loader2,
} from "lucide-react";

interface StudentEvaluationFlowProps {
  evaluation: Evaluation;
  onComplete: () => void;
  onSkip: () => void;
}

export function StudentEvaluationFlow({
  evaluation,
  onComplete,
  onSkip,
}: StudentEvaluationFlowProps) {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<SubmitEvaluationResponse | null>(null);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, [evaluation.id]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const allQuestions = await evaluationService.getAllQuestionsWithAnswers();

      const sortedMappings = [...evaluation.questionMappings].sort((a, b) => a.order - b.order);
      const evaluationQuestions = sortedMappings
        .map((m) => allQuestions.find((q) => q.id === m.questionId))
        .filter((q): q is EvaluationQuestion => q !== undefined);

      if (evaluationQuestions.length === 0) {
        onComplete();
        return;
      }

      setQuestions(evaluationQuestions);
    } catch (error) {
      console.error("Failed to load evaluation questions:", error);
      onComplete();
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const hasAnsweredCurrent = currentQuestion && answers.has(currentQuestion.id);

  const handleAnswerSelect = (answerId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => new Map(prev).set(currentQuestion.id, answerId));
  };

  const handleNext = () => {
    if (!isLastQuestion) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (answers.size !== questions.length) return;

    setIsSubmitting(true);
    try {
      const submissions: EvaluationAnswerSubmission[] = [];
      answers.forEach((answerId, questionId) => {
        submissions.push({ questionId, answerId });
      });

      const result = await evaluationService.submitEvaluation({ answers: submissions });
      setResults(result);
      setShowResults(true);
    } catch (error) {
      console.error("Failed to submit evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipConfirm = () => {
    setShowSkipConfirm(false);
    onSkip();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <PuzzleLoader />
      </div>
    );
  }

  if (questions.length === 0) {
    return null;
  }

  if (showResults && results) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Evaluation Complete!</CardTitle>
          <CardDescription>
            Your skill profile is ready — we&apos;ll use this to guide your learning path.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Card className="bg-green-50 dark:bg-green-950/20 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-green-700 dark:text-green-400">
                  Your Strengths ({results.strengthSkillIds.length})
                </p>
              </div>
              {results.strengthSkillIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">No strong skills identified yet — keep learning!</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {results.strengthSkillIds.map((id) => (
                    <span
                      key={id}
                      className="text-xs bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full"
                    >
                      {results.skillNames[id] ?? id}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-orange-50 dark:bg-orange-950/20 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardCheck className="h-5 w-5 text-orange-600" />
                <p className="font-semibold text-orange-700 dark:text-orange-400">
                  Skills to Develop ({results.weaknessSkillIds.length})
                </p>
              </div>
              {results.weaknessSkillIds.length === 0 ? (
                <p className="text-xs text-muted-foreground">No gaps identified — great foundation!</p>
              ) : (
                <>
                  <p className="text-xs text-muted-foreground mb-2">
                    We&apos;ll recommend courses to build these skills.
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {results.weaknessSkillIds.map((id) => (
                      <span
                        key={id}
                        className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full"
                      >
                        {results.skillNames[id] ?? id}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Button onClick={onComplete} className="w-full" size="lg">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline" className="text-sm">
              Question {currentQuestionIndex + 1} of {questions.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSkipConfirm(true)}
              className="text-muted-foreground"
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Skip Evaluation
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <CardTitle className="mt-6 text-xl">{evaluation.name}</CardTitle>
          {evaluation.description && (
            <CardDescription>{evaluation.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <p className="text-lg font-medium">{currentQuestion?.text}</p>
          </div>

          <RadioGroup
            value={answers.get(currentQuestion?.id || "") || ""}
            onValueChange={handleAnswerSelect}
            className="space-y-3"
          >
            {currentQuestion?.answers.map((answer) => (
              <div
                key={answer.id}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                  answers.get(currentQuestion.id) === answer.id
                    ? "bg-primary/5 border-primary"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => handleAnswerSelect(answer.id)}
              >
                <RadioGroupItem value={answer.id} id={answer.id} />
                <Label htmlFor={answer.id} className="flex-1 cursor-pointer">
                  {answer.text}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmit}
                disabled={answers.size !== questions.length || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Evaluation
                    <CheckCircle2 className="h-4 w-4 ml-1" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={!hasAnsweredCurrent}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showSkipConfirm} onOpenChange={setShowSkipConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Skip Evaluation?</DialogTitle>
            <DialogDescription>
              Are you sure you want to skip this evaluation? You can take it later
              from your dashboard. Your progress will not be saved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSkipConfirm(false)}>
              Continue Evaluation
            </Button>
            <Button variant="secondary" onClick={handleSkipConfirm}>
              Skip for Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
