"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, HelpCircle, Loader2, RotateCcw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuestionContent } from "@/services/lesson-item.service";
import { quizService } from "@/services/quiz.service";
import { QuizResultResponse, QuizSubmissionDto, QuizAnswerPayload } from "@/dtos/quiz.dto";

interface QuizContentProps {
  lessonItemId: string;
  content: QuestionContent;
  onComplete?: () => void;
}

interface NormalizedQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
}

function normalizeQuestions(content: QuestionContent): NormalizedQuestion[] {
  if (content.questions && content.questions.length > 0) {
    return content.questions.map((q, idx) => ({
      id: q.id || `q${idx}`,
      text: q.text || q.question || "",
      options: q.options || [],
      correctIndex: q.correctIndex ?? q.correctAnswerIndex ?? 0,
    }));
  }
  
  if (content.question && content.options) {
    return [{
      id: "q1",
      text: content.question,
      options: content.options,
      correctIndex: content.correctAnswerIndex ?? 0,
    }];
  }
  
  return [];
}

export function QuizContent({ lessonItemId, content, onComplete }: QuizContentProps) {
  const questions = normalizeQuestions(content);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [lastSubmission, setLastSubmission] = useState<QuizSubmissionDto | null>(null);
  const [viewingLastAttempt, setViewingLastAttempt] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLastSubmission = async () => {
      try {
        const submission = await quizService.getLastSubmission(lessonItemId);
        if (submission) {
          setLastSubmission(submission);
          if (submission.score === 100) {
            const parsedAnswers = quizService.parseAnswersJson(submission.answersJson);
            const answersMap: Record<string, number> = {};
            const results: { questionId: string; isCorrect: boolean }[] = [];
            parsedAnswers.forEach((a: QuizAnswerPayload) => {
              answersMap[a.questionId] = a.answerIndex;
              results.push({ questionId: a.questionId, isCorrect: a.isCorrect });
            });
            setAnswers(answersMap);
            setResult({ results, score: submission.score });
            setViewingLastAttempt(true);
          }
        }
      } catch (err) {
        console.error("Failed to load last submission:", err);
      } finally {
        setLoading(false);
      }
    };

    loadLastSubmission();
  }, [lessonItemId]);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    if (result && !viewingLastAttempt) return;
    if (viewingLastAttempt) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await quizService.submitQuiz(
        lessonItemId,
        Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          answerIndex,
        }))
      );
      setResult(response);
      
      if (response.score === 100) {
        onComplete?.();
      }
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTryAgain = () => {
    setAnswers({});
    setResult(null);
    setError(null);
    setViewingLastAttempt(false);
  };

  const handleViewLastAttempt = () => {
    if (!lastSubmission) return;
    const parsedAnswers = quizService.parseAnswersJson(lastSubmission.answersJson);
    const answersMap: Record<string, number> = {};
    const results: { questionId: string; isCorrect: boolean }[] = [];
    parsedAnswers.forEach((a: QuizAnswerPayload) => {
      answersMap[a.questionId] = a.answerIndex;
      results.push({ questionId: a.questionId, isCorrect: a.isCorrect });
    });
    setAnswers(answersMap);
    setResult({ results, score: lastSubmission.score });
    setViewingLastAttempt(true);
  };

  const getQuestionResult = (questionId: string) => {
    if (!result) return null;
    return result.results.find(r => r.questionId === questionId);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-6 text-center">
        <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No questions available for this quiz.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quiz Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Quiz ({questions.length} question{questions.length > 1 ? "s" : ""})
        </h3>
        <div className="flex items-center gap-3">
          {lastSubmission && !result && (
            <Button variant="outline" size="sm" onClick={handleViewLastAttempt}>
              View Last Attempt ({lastSubmission.score}%)
            </Button>
          )}
          {result && (
            <div className={cn(
              "px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2",
              result.score === 100 ? "bg-success/20 text-success" : 
              result.score >= 70 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
            )}>
              {result.score === 100 && <Trophy className="w-4 h-4" />}
              Score: {result.score}%
            </div>
          )}
        </div>
      </div>

      {/* Perfect Score Message */}
      {result && result.score === 100 && (
        <div className="p-4 bg-success/10 border border-success text-success rounded-lg flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          <div>
            <p className="font-semibold">Perfect Score!</p>
            <p className="text-sm opacity-90">Congratulations! You answered all questions correctly.</p>
          </div>
        </div>
      )}

      {/* Viewing Last Attempt Notice */}
      {viewingLastAttempt && (
        <div className="p-3 bg-muted border rounded-lg text-sm text-muted-foreground">
          Viewing your last attempt. {result && result.score < 100 && "Click \"Try Again\" to retake the quiz."}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6">
        {questions.map((question, qIdx) => {
          const questionResult = getQuestionResult(question.id);
          const selectedAnswer = answers[question.id];
          
          return (
            <Card key={question.id} className={cn(
              "transition-all",
              questionResult?.isCorrect === true && "border-success bg-success/5",
              questionResult?.isCorrect === false && "border-destructive bg-destructive/5"
            )}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center text-sm">
                    {qIdx + 1}
                  </span>
                  <p className="font-medium pt-1">{question.text}</p>
                </div>

                <div className="space-y-2 ml-11">
                  {question.options.map((option, optIdx) => {
                    const isSelected = selectedAnswer === optIdx;
                    const isCorrect = result && optIdx === question.correctIndex;
                    const isWrong = result && isSelected && !questionResult?.isCorrect;
                    
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(question.id, optIdx)}
                        disabled={!!result || viewingLastAttempt}
                        className={cn(
                          "w-full text-left p-3 rounded-lg border-2 transition-all flex items-center gap-3",
                          !result && isSelected && "border-primary bg-primary/10",
                          !result && !isSelected && "border-border hover:border-primary/50 hover:bg-muted/50",
                          result && isCorrect && "border-success bg-success/10",
                          result && isWrong && "border-destructive bg-destructive/10",
                          result && !isCorrect && !isWrong && "border-border opacity-60"
                        )}
                      >
                        <span className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium flex-shrink-0",
                          !result && isSelected && "border-primary bg-primary text-white",
                          !result && !isSelected && "border-muted-foreground",
                          result && isCorrect && "border-success bg-success text-white",
                          result && isWrong && "border-destructive bg-destructive text-white"
                        )}>
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{option}</span>
                        {result && isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                        {result && isWrong && <XCircle className="w-5 h-5 text-destructive" />}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 flex-wrap">
        {!result ? (
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || Object.keys(answers).length < questions.length}
            className="min-w-[150px]"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Quiz"
            )}
          </Button>
        ) : result.score < 100 ? (
          <Button onClick={handleTryAgain} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        ) : null}
        
        {!result && (
          <p className="text-sm text-muted-foreground self-center">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
        )}

        {result && result.score < 100 && (
          <p className="text-sm text-muted-foreground self-center">
            You got {result.results.filter(r => r.isCorrect).length} of {questions.length} correct. Try again to get 100%!
          </p>
        )}
      </div>
    </div>
  );
}
