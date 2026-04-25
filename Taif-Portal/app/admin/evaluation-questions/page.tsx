"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  MessageCircleQuestion,
  Search,
  Loader2,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { evaluationService } from "@/services/evaluation.service";
import { skillService } from "@/services/skill.service";
import {
  EvaluationQuestion,
  EvaluationAnswer,
  CreateEvaluationQuestionRequest,
} from "@/models/evaluation.model";
import { Skill } from "@/models/skill.model";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useToast } from "@/hooks/use-toast";

interface AnswerFormData {
  text: string;
  score: number;
}

export default function EvaluationQuestionsPage() {
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dialog state for question
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<EvaluationQuestion | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const [answers, setAnswers] = useState<AnswerFormData[]>([
    { text: "", score: 0 },
  ]);

  // Dialog state for answer
  const [answerDialogOpen, setAnswerDialogOpen] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<EvaluationAnswer | null>(null);
  const [answerQuestionId, setAnswerQuestionId] = useState<string>("");
  const [answerText, setAnswerText] = useState("");
  const [answerScore, setAnswerScore] = useState(0);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"question" | "answer">("question");
  const [deleteId, setDeleteId] = useState<string>("");

  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [questionsData, skillsData] = await Promise.all([
        evaluationService.getAllQuestionsWithAnswers(),
        skillService.getAllSkills(),
      ]);
      setQuestions(questionsData);
      setAllSkills(skillsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load evaluation questions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const removeSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => prev.filter((id) => id !== skillId));
  };

  const getSkillName = (id: string) =>
    allSkills.find((s) => s.id === id)?.name ?? id;

  // Question Dialog Handlers
  const handleOpenQuestionDialog = (question?: EvaluationQuestion) => {
    if (question) {
      setEditingQuestion(question);
      setQuestionText(question.text);
      setSelectedSkillIds(question.skillIds ?? []);
      setAnswers(
        question.answers.length > 0
          ? question.answers.map((a) => ({ text: a.text, score: a.score }))
          : [{ text: "", score: 0 }]
      );
    } else {
      setEditingQuestion(null);
      setQuestionText("");
      setSelectedSkillIds([]);
      setAnswers([{ text: "", score: 0 }]);
    }
    setQuestionDialogOpen(true);
  };

  const handleCloseQuestionDialog = () => {
    setQuestionDialogOpen(false);
    setEditingQuestion(null);
    setQuestionText("");
    setSelectedSkillIds([]);
    setAnswers([{ text: "", score: 0 }]);
  };

  const handleAddAnswer = () => {
    setAnswers([...answers, { text: "", score: 0 }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length > 1) setAnswers(answers.filter((_, i) => i !== index));
  };

  const handleAnswerChange = (
    index: number,
    field: keyof AnswerFormData,
    value: string | number
  ) => {
    const newAnswers = [...answers];
    newAnswers[index] = { ...newAnswers[index], [field]: value };
    setAnswers(newAnswers);
  };

  const handleSubmitQuestion = async () => {
    if (!questionText.trim()) {
      toast({ title: "Validation Error", description: "Question text is required", variant: "destructive" });
      return;
    }

    const validAnswers = answers.filter((a) => a.text.trim());
    if (!editingQuestion && validAnswers.length === 0) {
      toast({ title: "Validation Error", description: "At least one answer is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingQuestion) {
        await evaluationService.updateQuestion(editingQuestion.id, {
          text: questionText,
          skillIds: selectedSkillIds,
        });
        toast({ title: "Success", description: "Question updated successfully" });
      } else {
        const request: CreateEvaluationQuestionRequest = {
          text: questionText,
          skillIds: selectedSkillIds,
          answers: validAnswers,
        };
        await evaluationService.createQuestion(request);
        toast({ title: "Success", description: "Question created successfully" });
      }
      handleCloseQuestionDialog();
      loadData();
    } catch (error) {
      console.error("Failed to save question:", error);
      toast({ title: "Error", description: "Failed to save question", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Answer Dialog Handlers
  const handleOpenAnswerDialog = (questionId: string, answer?: EvaluationAnswer) => {
    setAnswerQuestionId(questionId);
    if (answer) {
      setEditingAnswer(answer);
      setAnswerText(answer.text);
      setAnswerScore(answer.score);
    } else {
      setEditingAnswer(null);
      setAnswerText("");
      setAnswerScore(0);
    }
    setAnswerDialogOpen(true);
  };

  const handleCloseAnswerDialog = () => {
    setAnswerDialogOpen(false);
    setEditingAnswer(null);
    setAnswerQuestionId("");
    setAnswerText("");
    setAnswerScore(0);
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      toast({ title: "Validation Error", description: "Answer text is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingAnswer) {
        await evaluationService.updateAnswer(editingAnswer.id, { text: answerText, score: answerScore });
        toast({ title: "Success", description: "Answer updated successfully" });
      } else {
        await evaluationService.createAnswer({ evaluationQuestionId: answerQuestionId, text: answerText, score: answerScore });
        toast({ title: "Success", description: "Answer created successfully" });
      }
      handleCloseAnswerDialog();
      loadData();
    } catch (error) {
      console.error("Failed to save answer:", error);
      toast({ title: "Error", description: "Failed to save answer", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handlers
  const handleConfirmDelete = (type: "question" | "answer", id: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      if (deleteType === "question") {
        await evaluationService.deleteQuestion(deleteId);
      } else {
        await evaluationService.deleteAnswer(deleteId);
      }
      toast({ title: "Success", description: `${deleteType === "question" ? "Question" : "Answer"} deleted successfully` });
      setDeleteDialogOpen(false);
      setDeleteId("");
      loadData();
    } catch (error) {
      console.error("Failed to delete:", error);
      toast({ title: "Error", description: `Failed to delete ${deleteType}`, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <PuzzleLoader />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessageCircleQuestion className="h-8 w-8" />
              Evaluation Questions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage evaluation questions and their answers
            </p>
          </div>
          <Button onClick={() => handleOpenQuestionDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Questions ({filteredQuestions.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredQuestions.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                {searchQuery ? "No questions found matching your search" : "No questions yet. Create your first question!"}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <Collapsible
                    key={question.id}
                    open={expandedQuestions.has(question.id)}
                    onOpenChange={() => toggleQuestion(question.id)}
                  >
                    <Card className="border shadow-sm">
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <CollapsibleTrigger className="flex items-center gap-3 flex-1 text-left">
                            <div className="flex-1">
                              <p className="font-medium">{question.text}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(question.skillIds ?? []).map((sid) => (
                                  <Badge key={sid} variant="secondary" className="text-xs">
                                    {getSkillName(sid)}
                                  </Badge>
                                ))}
                                <span className="text-sm text-muted-foreground">
                                  {(question.skillIds ?? []).length === 0 && "No skills assigned · "}
                                  {question.answers.length} answer(s)
                                </span>
                              </div>
                            </div>
                            {expandedQuestions.has(question.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleOpenQuestionDialog(question); }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => { e.stopPropagation(); handleConfirmDelete("question", question.id); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <CollapsibleContent>
                        <div className="border-t px-4 py-3 bg-muted/30">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Answers</h4>
                            <Button variant="outline" size="sm" onClick={() => handleOpenAnswerDialog(question.id)}>
                              <Plus className="h-3 w-3 mr-1" />
                              Add Answer
                            </Button>
                          </div>
                          {question.answers.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No answers yet</p>
                          ) : (
                            <div className="space-y-2">
                              {question.answers.map((answer) => (
                                <div
                                  key={answer.id}
                                  className="flex items-center justify-between p-3 bg-background rounded-lg border"
                                >
                                  <div className="flex items-center gap-3">
                                    <Badge
                                      variant={answer.score >= 75 ? "default" : answer.score >= 50 ? "secondary" : "outline"}
                                      className="min-w-[60px] justify-center"
                                    >
                                      {answer.score}%
                                    </Badge>
                                    <span className="text-sm">{answer.text}</span>
                                  </div>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                      onClick={() => handleOpenAnswerDialog(question.id, answer)}>
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8"
                                      onClick={() => handleConfirmDelete("answer", answer.id)}>
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Create Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update the question, skills and answers" : "Add a new evaluation question with skills and answers"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="questionText">Question Text *</Label>
              <Input
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Enter the question text"
              />
            </div>

            {/* Skill picker */}
            <div className="space-y-2">
              <Label>Skills</Label>
              <Popover open={skillPickerOpen} onOpenChange={setSkillPickerOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-muted-foreground font-normal">
                    <Plus className="h-4 w-4 mr-2" />
                    {selectedSkillIds.length === 0 ? "Select skills..." : `${selectedSkillIds.length} skill(s) selected`}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search skills..." />
                    <CommandList>
                      <CommandEmpty>No skills found.</CommandEmpty>
                      <CommandGroup>
                        {allSkills.map((skill) => (
                          <CommandItem
                            key={skill.id}
                            onSelect={() => toggleSkill(skill.id)}
                            className="flex items-center gap-2"
                          >
                            <div className={`h-4 w-4 border rounded flex items-center justify-center ${selectedSkillIds.includes(skill.id) ? "bg-primary border-primary" : "border-input"}`}>
                              {selectedSkillIds.includes(skill.id) && (
                                <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            {skill.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {selectedSkillIds.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedSkillIds.map((sid) => (
                    <Badge key={sid} variant="secondary" className="gap-1">
                      {getSkillName(sid)}
                      <button onClick={() => removeSkill(sid)} className="hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Skills linked to this question determine strength/weakness assessment after evaluation
              </p>
            </div>

            {!editingQuestion && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Answers *</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddAnswer}>
                    <Plus className="h-3 w-3 mr-1" />
                    Add Answer
                  </Button>
                </div>
                {answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <Input
                        placeholder="Answer text"
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(index, "text", e.target.value)}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Score"
                        value={answer.score}
                        onChange={(e) => handleAnswerChange(index, "score", parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAnswer(index)}
                      disabled={answers.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground">
                  Score (0-100): ≥75 = strength, &lt;50 = weakness
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseQuestionDialog}>Cancel</Button>
            <Button onClick={handleSubmitQuestion} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <>{editingQuestion ? "Update" : "Create"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Answer Dialog */}
      <Dialog open={answerDialogOpen} onOpenChange={setAnswerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAnswer ? "Edit Answer" : "Add Answer"}</DialogTitle>
            <DialogDescription>
              {editingAnswer ? "Update the answer details" : "Add a new answer to the question"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="answerText">Answer Text *</Label>
              <Input
                id="answerText"
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Enter the answer text"
              />
            </div>
            <div>
              <Label htmlFor="answerScore">Score (0-100)</Label>
              <Input
                id="answerScore"
                type="number"
                min={0}
                max={100}
                value={answerScore}
                onChange={(e) => setAnswerScore(parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                ≥75 = strength, &lt;50 = weakness for linked skills
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseAnswerDialog}>Cancel</Button>
            <Button onClick={handleSubmitAnswer} disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              ) : (
                <>{editingAnswer ? "Update" : "Add"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteType === "question" ? "Question" : "Answer"}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {deleteType === "question" ? "question" : "answer"}? This action cannot be undone.
              {deleteType === "question" && " All associated answers will also be deleted."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Deleting...</>
              ) : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
