"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ClipboardCheck,
  Search,
  Loader2,
  Eye,
  MessageCircleQuestion,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { evaluationService } from "@/services/evaluation.service";
import {
  Evaluation,
  EvaluationQuestion,
  QuestionMapping,
} from "@/models/evaluation.model";
import { interestService } from "@/services/interest.service";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useToast } from "@/hooks/use-toast";

export default function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [questions, setQuestions] = useState<EvaluationQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [interests, setInterests] = useState<{ id: string; name: string }[]>([]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvaluation, setEditingEvaluation] = useState<Evaluation | null>(null);
  const [evaluationName, setEvaluationName] = useState("");
  const [evaluationDescription, setEvaluationDescription] = useState("");
  const [selectedInterestId, setSelectedInterestId] = useState<string>("");
  const [questionMappings, setQuestionMappings] = useState<QuestionMapping[]>([]);

  // View dialog state
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingEvaluation, setViewingEvaluation] = useState<Evaluation | null>(null);

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [evaluationsData, questionsData, interestsData] = await Promise.all([
        evaluationService.getAllEvaluations(),
        evaluationService.getAllQuestionsWithAnswers(),
        interestService.getAllInterests(),
      ]);
      setEvaluations(evaluationsData);
      setQuestions(questionsData);
      setInterests(interestsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load evaluations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (evaluation?: Evaluation) => {
    if (evaluation) {
      setEditingEvaluation(evaluation);
      setEvaluationName(evaluation.name);
      setEvaluationDescription(evaluation.description || "");
      setSelectedInterestId(evaluation.interestId || "");
      setQuestionMappings(evaluation.questionMappings || []);
    } else {
      setEditingEvaluation(null);
      setEvaluationName("");
      setEvaluationDescription("");
      setSelectedInterestId("");
      setQuestionMappings([]);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingEvaluation(null);
    setEvaluationName("");
    setEvaluationDescription("");
    setSelectedInterestId("");
    setQuestionMappings([]);
  };

  const handleToggleQuestion = (questionId: string) => {
    setQuestionMappings((prev) => {
      const exists = prev.find((m) => m.questionId === questionId);
      if (exists) {
        return prev.filter((m) => m.questionId !== questionId);
      } else {
        const maxOrder = prev.length > 0 ? Math.max(...prev.map((m) => m.order)) : 0;
        return [...prev, { questionId, order: maxOrder + 1 }];
      }
    });
  };

  const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
    setQuestionMappings((prev) => {
      const sorted = [...prev].sort((a, b) => a.order - b.order);
      const index = sorted.findIndex((m) => m.questionId === questionId);
      if (index === -1) return prev;
      
      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= sorted.length) return prev;
      
      // Swap orders
      const temp = sorted[index].order;
      sorted[index].order = sorted[newIndex].order;
      sorted[newIndex].order = temp;
      
      return sorted;
    });
  };

  const handleSubmit = async () => {
    if (!evaluationName.trim()) {
      toast({
        title: "Validation Error",
        description: "Evaluation name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingEvaluation) {
        await evaluationService.updateEvaluation(editingEvaluation.id, {
          name: evaluationName,
          description: evaluationDescription || undefined,
          interestId: selectedInterestId || undefined,
          questionMappings: questionMappings,
        });
        toast({
          title: "Success",
          description: "Evaluation updated successfully",
        });
      } else {
        await evaluationService.createEvaluation({
          name: evaluationName,
          description: evaluationDescription || undefined,
          interestId: selectedInterestId || undefined,
          questionMappings: questionMappings,
        });
        toast({
          title: "Success",
          description: "Evaluation created successfully",
        });
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      console.error("Failed to save evaluation:", error);
      toast({
        title: "Error",
        description: "Failed to save evaluation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await evaluationService.deleteEvaluation(deleteId);
      toast({
        title: "Success",
        description: "Evaluation deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDeleteId("");
      loadData();
    } catch (error) {
      console.error("Failed to delete evaluation:", error);
      toast({
        title: "Error",
        description: "Failed to delete evaluation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewEvaluation = (evaluation: Evaluation) => {
    setViewingEvaluation(evaluation);
    setViewDialogOpen(true);
  };

  const getQuestionsForEvaluation = (mappings: QuestionMapping[]) => {
    return mappings
      .sort((a, b) => a.order - b.order)
      .map((m) => questions.find((q) => q.id === m.questionId))
      .filter((q): q is EvaluationQuestion => q !== undefined);
  };

  const getInterestName = (interestId?: string) => {
    if (!interestId) return "—";
    const interest = interests.find((i) => i.id === interestId);
    return interest?.name || "—";
  };

  const filteredEvaluations = evaluations.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.description?.toLowerCase() || "").includes(searchQuery.toLowerCase())
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
              <ClipboardCheck className="h-8 w-8" />
              Evaluations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage evaluations and assign questions to them
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Evaluation
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Evaluations ({filteredEvaluations.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search evaluations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Interest</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvaluations.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground py-8"
                    >
                      {searchQuery
                        ? "No evaluations found matching your search"
                        : "No evaluations yet. Create your first evaluation!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell className="font-medium">
                        {evaluation.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {evaluation.description || "—"}
                      </TableCell>
                      <TableCell>
                        {getInterestName(evaluation.interestId)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          <MessageCircleQuestion className="h-3 w-3 mr-1" />
                          {evaluation.questionMappings?.length || 0} questions
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewEvaluation(evaluation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(evaluation)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(evaluation.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              {editingEvaluation ? "Edit Evaluation" : "Create Evaluation"}
            </DialogTitle>
            <DialogDescription>
              {editingEvaluation
                ? "Update the evaluation information and assigned questions"
                : "Add a new evaluation and assign questions to it"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={evaluationName}
                  onChange={(e) => setEvaluationName(e.target.value)}
                  placeholder="e.g., Skills Assessment"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={evaluationDescription}
                  onChange={(e) => setEvaluationDescription(e.target.value)}
                  placeholder="Optional description of the evaluation"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="interest">Interest</Label>
                <select
                  id="interest"
                  value={selectedInterestId}
                  onChange={(e) => setSelectedInterestId(e.target.value)}
                  className="w-full h-10 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Select an interest (optional)</option>
                  {interests.map((interest) => (
                    <option key={interest.id} value={interest.id}>
                      {interest.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <Label className="mb-3 block">
                Assign Questions ({questionMappings.length} selected)
              </Label>
              <ScrollArea className="h-64 border rounded-lg p-4">
                {questions.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No questions available. Create questions first.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question) => {
                      const mapping = questionMappings.find((m) => m.questionId === question.id);
                      const isSelected = !!mapping;
                      return (
                        <div
                          key={question.id}
                          className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary/5 border-primary/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              handleToggleQuestion(question.id)
                            }
                          />
                          <div className="flex-1 cursor-pointer" onClick={() => handleToggleQuestion(question.id)}>
                            <span className="font-medium text-sm">
                              {question.text}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {question.answers.length} answer(s)
                            </p>
                          </div>
                          {isSelected && (
                            <div className="flex items-center gap-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                #{mapping?.order}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveQuestion(question.id, "up");
                                }}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMoveQuestion(question.id, "down");
                                }}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>{editingEvaluation ? "Update" : "Create"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Evaluation Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5" />
              {viewingEvaluation?.name}
            </DialogTitle>
            {viewingEvaluation?.description && (
              <DialogDescription>{viewingEvaluation.description}</DialogDescription>
            )}
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {viewingEvaluation && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MessageCircleQuestion className="h-4 w-4" />
                  <span>
                    {viewingEvaluation.questionMappings?.length || 0} questions in this
                    evaluation
                  </span>
                </div>
                {getQuestionsForEvaluation(viewingEvaluation.questionMappings || [])
                  .length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No questions assigned to this evaluation
                  </div>
                ) : (
                  <div className="space-y-4">
                    {getQuestionsForEvaluation(viewingEvaluation.questionMappings || [])
                      .map((question, index) => (
                        <Card key={question.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge className="mt-0.5">{index + 1}</Badge>
                              <div className="flex-1">
                                <p className="font-medium">{question.text}</p>
                                <div className="mt-3 space-y-2">
                                  {question.answers.map((answer) => (
                                    <div
                                      key={answer.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <Badge
                                        variant={
                                          answer.score >= 75
                                            ? "default"
                                            : answer.score >= 50
                                            ? "secondary"
                                            : "outline"
                                        }
                                        className="min-w-[50px] justify-center text-xs"
                                      >
                                        {answer.score}%
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {answer.text}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Evaluation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this evaluation? This action cannot
              be undone.
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
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
