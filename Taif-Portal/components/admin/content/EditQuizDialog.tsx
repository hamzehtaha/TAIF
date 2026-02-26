"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Loader2, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { contentService, LessonItemType, QuizQuestion, Content, QuizContent } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";

interface EditQuizDialogProps {
  content: Content | null;
  quizData: QuizContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditQuizDialog({ content, quizData, open, onOpenChange, onSuccess }: EditQuizDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    title: "",
  });

  const [questions, setQuestions] = useState<QuizQuestion[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    },
  ]);

  useEffect(() => {
    if (quizData) {
      setFormData({
        title: quizData.title || "",
      });
      // Ensure all question fields have proper default values (not null)
      const sanitizedQuestions = quizData.questions && quizData.questions.length > 0 
        ? quizData.questions.map(q => ({
            questionText: q.questionText || "",
            options: (q.options || ["", "", "", ""]).map(opt => opt || ""),
            correctAnswerIndex: q.correctAnswerIndex ?? 0,
          }))
        : [
            {
              questionText: "",
              options: ["", "", "", ""],
              correctAnswerIndex: 0,
            },
          ];
      setQuestions(sanitizedQuestions);
    }
  }, [quizData]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options[optionIndex] = value;
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    updated[questionIndex].options.push("");
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options.length > 2) {
      updated[questionIndex].options.splice(optionIndex, 1);
      if (updated[questionIndex].correctAnswerIndex >= updated[questionIndex].options.length) {
        updated[questionIndex].correctAnswerIndex = updated[questionIndex].options.length - 1;
      }
      setQuestions(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Quiz title is required",
        variant: "destructive",
      });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one question is required",
        variant: "destructive",
      });
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast({
          title: "Validation Error",
          description: `Question ${i + 1} text is required`,
          variant: "destructive",
        });
        return;
      }
      if (q.options.some(opt => !opt.trim())) {
        toast({
          title: "Validation Error",
          description: `All options for question ${i + 1} must be filled`,
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      await contentService.updateContent(content.id, {
        type: LessonItemType.Quiz,
        quiz: {
          title: formData.title,
          questions: questions,
        },
      });

      toast({
        title: "Success",
        description: "Quiz content updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quiz content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Quiz Content</DialogTitle>
            <DialogDescription>
              Update the quiz details and questions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Quiz Title *</Label>
              <Input
                id="title"
                placeholder="Introduction to Programming Quiz"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Questions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, qIndex) => (
                <Card key={qIndex}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Label className="text-base">Question {qIndex + 1}</Label>
                      {questions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(qIndex)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    <Input
                      placeholder="Enter question text"
                      value={question.questionText || ""}
                      onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                      required
                    />

                    <div className="space-y-2">
                      <Label className="text-sm">Options</Label>
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={question.correctAnswerIndex === oIndex}
                            onChange={() => updateQuestion(qIndex, "correctAnswerIndex", oIndex)}
                            className="flex-shrink-0"
                          />
                          <Input
                            placeholder={`Option ${oIndex + 1}`}
                            value={option || ""}
                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                            required
                          />
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeOption(qIndex, oIndex)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(qIndex)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Quiz
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
