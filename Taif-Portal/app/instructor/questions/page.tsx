"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  HelpCircle,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  LayoutGrid,
  List,
  Calendar,
  SortAsc,
  Link2,
} from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useInstructor } from "@/contexts/InstructorContext";
import { QuestionWithAnswers, CreateQuestionInput, CreateAnswerInput } from "@/types/instructor";
import { formatDistanceToNow, isAfter, subDays, subWeeks, subMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { PuzzleLoader } from "@/components/PuzzleLoader";

export default function QuestionsPage() {
  const {
    questions,
    loadQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    isLoading,
  } = useInstructor();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "multiple-choice" | "true-false">("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [connectionFilter, setConnectionFilter] = useState<"all" | "connected" | "standalone">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuestionWithAnswers | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<QuestionWithAnswers | null>(null);
  
  const [formData, setFormData] = useState({
    text: "",
    description: "",
    type: "multiple-choice" as "multiple-choice" | "true-false",
    answers: [
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
      { text: "", isCorrect: false },
    ] as CreateAnswerInput[],
  });

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const filteredQuestions = useMemo(() => {
    let result = [...(questions || [])];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (q) =>
          q.text.toLowerCase().includes(query) ||
          q.description?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      result = result.filter((q) => q.type === typeFilter);
    }

    // Date filter
    if (dateFilter !== "all") {
      const now = new Date();
      let cutoffDate: Date;
      switch (dateFilter) {
        case "today": cutoffDate = subDays(now, 1); break;
        case "week": cutoffDate = subWeeks(now, 1); break;
        case "month": cutoffDate = subMonths(now, 1); break;
        default: cutoffDate = new Date(0);
      }
      result = result.filter((q) => isAfter(new Date(q.createdAt), cutoffDate));
    }

    // Sort
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "title": result.sort((a, b) => a.text.localeCompare(b.text)); break;
    }

    return result;
  }, [questions, searchQuery, typeFilter, dateFilter, sortBy]);

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormData({
      text: "",
      description: "",
      type: "multiple-choice",
      answers: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
    });
    setDialogOpen(true);
  };

  const handleOpenEdit = (question: QuestionWithAnswers) => {
    setEditingQuestion(question);
    const answers = question.type === "true-false"
      ? [
          { text: "True", isCorrect: question.answers.find((a) => a.text === "True")?.isCorrect || false },
          { text: "False", isCorrect: question.answers.find((a) => a.text === "False")?.isCorrect || false },
        ]
      : question.answers.map((a) => ({ text: a.text, isCorrect: a.isCorrect }));
    
    // Pad to 4 answers for multiple choice
    while (question.type === "multiple-choice" && answers.length < 4) {
      answers.push({ text: "", isCorrect: false });
    }

    setFormData({
      text: question.text,
      description: question.description || "",
      type: question.type,
      answers,
    });
    setDialogOpen(true);
  };

  const handleTypeChange = (type: "multiple-choice" | "true-false") => {
    if (type === "true-false") {
      setFormData((prev) => ({
        ...prev,
        type,
        answers: [
          { text: "True", isCorrect: false },
          { text: "False", isCorrect: true },
        ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        type,
        answers: [
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
          { text: "", isCorrect: false },
        ],
      }));
    }
  };

  const handleAnswerChange = (index: number, text: string) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((a, i) => (i === index ? { ...a, text } : a)),
    }));
  };

  const handleCorrectChange = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      answers: prev.answers.map((a, i) => ({ ...a, isCorrect: i === index })),
    }));
  };

  const handleSave = async () => {
    if (!formData.text) return;
    
    const validAnswers = formData.answers.filter((a) => a.text.trim());
    if (validAnswers.length < 2) return;
    if (!validAnswers.some((a) => a.isCorrect)) return;

    const input: CreateQuestionInput = {
      text: formData.text,
      description: formData.description || undefined,
      type: formData.type,
      answers: validAnswers,
    };

    if (editingQuestion) {
      await updateQuestion(editingQuestion.id, {
        text: input.text,
        description: input.description,
        type: input.type,
        answers: validAnswers.map((a, i) => ({
          id: `answer-${i}`,
          text: a.text,
          isCorrect: a.isCorrect,
          order: i + 1,
        })),
      });
    } else {
      await createQuestion(input);
    }
    setDialogOpen(false);
  };

  const handleDeleteClick = (question: QuestionWithAnswers) => {
    setQuestionToDelete(question);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (questionToDelete) {
      await deleteQuestion(questionToDelete.id);
      setDeleteDialogOpen(false);
      setQuestionToDelete(null);
    }
  };

  const hasCorrectAnswer = formData.answers.some((a) => a.isCorrect && a.text.trim());
  const hasMinAnswers = formData.answers.filter((a) => a.text.trim()).length >= 2;

  return (
    <InstructorLayout breadcrumbs={[{ label: "Questions & Answers" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Questions & Answers</h1>
            <p className="text-muted-foreground">
              Create and manage quiz questions
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Question
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by question text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as typeof typeFilter)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Question type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
              </SelectContent>
            </Select>
            <Select value={connectionFilter} onValueChange={(v: "all" | "connected" | "standalone") => setConnectionFilter(v)}>
              <SelectTrigger className="w-[140px]">
                <Link2 className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Connection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="connected">In Lessons</SelectItem>
                <SelectItem value="standalone">Standalone</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={(v: "all" | "today" | "week" | "month") => setDateFilter(v)}>
              <SelectTrigger className="w-[130px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v: "newest" | "oldest" | "title") => setSortBy(v)}>
              <SelectTrigger className="w-[120px]">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {(typeFilter !== "all" || connectionFilter !== "all" || dateFilter !== "all" || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {typeFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {typeFilter === "multiple-choice" ? "Multiple Choice" : "True/False"}
                <button onClick={() => setTypeFilter("all")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {connectionFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {connectionFilter === "connected" ? "In Lessons" : "Standalone"}
                <button onClick={() => setConnectionFilter("all")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            {dateFilter !== "all" && (
              <Badge variant="secondary" className="gap-1">
                {dateFilter === "today" ? "Today" : dateFilter === "week" ? "This Week" : "This Month"}
                <button onClick={() => setDateFilter("all")} className="ml-1 hover:text-destructive">×</button>
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setTypeFilter("all"); setConnectionFilter("all"); setDateFilter("all"); }}>
              Clear All
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{(questions || []).length}</p>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {(questions || []).filter((q) => q.type === "multiple-choice").length}
              </p>
              <p className="text-sm text-muted-foreground">Multiple Choice</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {(questions || []).filter((q) => q.type === "true-false").length}
              </p>
              <p className="text-sm text-muted-foreground">True/False</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <PuzzleLoader />
          </div>
        )}

        {/* Question List */}
        {!isLoading && filteredQuestions.length > 0 ? (
          viewMode === "grid" ? (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-warning/10 flex-shrink-0">
                        <HelpCircle className="h-5 w-5 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{question.text}</h3>
                            {question.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {question.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={question.type === "multiple-choice" ? "default" : "secondary"}>
                              {question.type === "multiple-choice" ? "Multiple Choice" : "True/False"}
                            </Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenEdit(question)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteClick(question)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Answers */}
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {question.answers.map((answer) => (
                            <div
                              key={answer.id}
                              className={cn(
                                "flex items-center gap-2 p-2 rounded text-sm",
                                answer.isCorrect
                                  ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                  : "bg-muted/50"
                              )}
                            >
                              {answer.isCorrect ? (
                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                              )}
                              <span className="truncate">{answer.text}</span>
                            </div>
                          ))}
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                          Created {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* List View - Compact */
            <div className="space-y-2">
              {filteredQuestions.map((question) => (
                <Card key={question.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-warning/10 flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-warning" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{question.text}</h3>
                        <p className="text-xs text-muted-foreground">
                          {question.answers.length} answers · {question.answers.filter(a => a.isCorrect).length} correct
                        </p>
                      </div>
                      <Badge variant={question.type === "multiple-choice" ? "default" : "secondary"} className="shrink-0">
                        {question.type === "multiple-choice" ? "MC" : "T/F"}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                        {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleOpenEdit(question)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(question)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )
        ) : !isLoading && (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <HelpCircle className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || typeFilter !== "all" ? "No questions found" : "No questions yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your search or filter"
                  : "Create your first question to start building assessments"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingQuestion ? "Edit Question" : "Add New Question"}</DialogTitle>
            <DialogDescription>
              {editingQuestion ? "Update the question and answers" : "Create a new quiz question"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text">Question Text *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => setFormData((prev) => ({ ...prev, text: e.target.value }))}
                placeholder="Enter your question..."
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Additional context or hint"
              />
            </div>
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleTypeChange(v as typeof formData.type)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Answers */}
            <div className="space-y-3">
              <Label>Answers (select the correct one)</Label>
              <RadioGroup
                value={formData.answers.findIndex((a) => a.isCorrect).toString()}
                onValueChange={(v) => handleCorrectChange(parseInt(v))}
              >
                {formData.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                    {formData.type === "true-false" ? (
                      <Label htmlFor={`answer-${index}`} className="flex-1 cursor-pointer">
                        {answer.text}
                      </Label>
                    ) : (
                      <Input
                        value={answer.text}
                        onChange={(e) => handleAnswerChange(index, e.target.value)}
                        placeholder={`Answer ${index + 1}`}
                        className="flex-1"
                      />
                    )}
                  </div>
                ))}
              </RadioGroup>
              {!hasCorrectAnswer && formData.text && (
                <p className="text-sm text-destructive">Please select a correct answer</p>
              )}
              {!hasMinAnswers && formData.text && (
                <p className="text-sm text-destructive">Please provide at least 2 answers</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.text || !hasCorrectAnswer || !hasMinAnswers}
            >
              {editingQuestion ? "Save Changes" : "Add Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this question? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}
