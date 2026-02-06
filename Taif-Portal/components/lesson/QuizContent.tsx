"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, HelpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  lessonItemService, 
  QuestionContent, 
  QuizQuestion,
  QuizResultResponse 
} from "@/services/lessonItemService";

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
  // Handle array of questions
  if (content.questions && content.questions.length > 0) {
    return content.questions.map((q, idx) => ({
      id: q.id || `q${idx}`,
      text: q.text || q.question || "",
      options: q.options || [],
      correctIndex: q.correctIndex ?? q.correctAnswerIndex ?? 0,
    }));
  }
  
  // Handle single question format
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
  const [result, setResult] = useState<QuizResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectAnswer = (questionId: string, answerIndex: number) => {
    if (result) return; // Already submitted
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
      const response = await lessonItemService.submitQuiz({
        lessonItemId,
        answers: Object.entries(answers).map(([questionId, answerIndex]) => ({
          questionId,
          answerIndex,
        })),
      });
      setResult(response);
      onComplete?.();
    } catch (err) {
      console.error("Failed to submit quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setResult(null);
    setError(null);
  };

  const getQuestionResult = (questionId: string) => {
    if (!result) return null;
    return result.results.find(r => r.questionId === questionId);
  };

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary" />
          Quiz ({questions.length} question{questions.length > 1 ? "s" : ""})
        </h3>
        {result && (
          <div className={cn(
            "px-4 py-2 rounded-full font-semibold text-sm",
            result.score >= 70 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
          )}>
            Score: {result.score}%
          </div>
        )}
      </div>

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
                        disabled={!!result}
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
      <div className="flex gap-4">
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
        ) : (
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
        )}
        
        {!result && (
          <p className="text-sm text-muted-foreground self-center">
            {Object.keys(answers).length} of {questions.length} answered
          </p>
        )}
      </div>
    </div>
  );
}
