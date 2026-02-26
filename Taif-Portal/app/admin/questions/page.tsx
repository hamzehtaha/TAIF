"use client";

import { useState, useEffect } from "react";
import { HelpCircle, Search, Eye, Trash2, Edit, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateQuizDialog } from "@/components/admin/content/CreateQuizDialog";
import { EditQuizDialog } from "@/components/admin/content/EditQuizDialog";
import { contentService, Content, QuizContent, LessonItemType } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function QuestionsPage() {
  const [quizzes, setQuizzes] = useState<Content[]>([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewQuiz, setViewQuiz] = useState<QuizContent | null>(null);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [editQuizData, setEditQuizData] = useState<QuizContent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadQuizzes();
  }, []);

  useEffect(() => {
    filterQuizzes();
  }, [quizzes, searchQuery]);

  const loadQuizzes = async () => {
    setIsLoading(true);
    try {
      const allContent = await contentService.getAllContent();
      const quizContent = allContent.filter(c => c.type === LessonItemType.Quiz);
      setQuizzes(quizContent);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
      setQuizzes([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      await contentService.deleteContent(deleteId);
      toast({
        title: "Success",
        description: "Quiz deleted successfully",
      });
      setDeleteId(null);
      loadQuizzes();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete quiz",
        variant: "destructive",
      });
    }
  };

  const filterQuizzes = () => {
    let result = [...quizzes];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(quiz => {
        const quizData = contentService.parseContentData(quiz) as QuizContent;
        return quizData.title.toLowerCase().includes(query);
      });
    }
    setFilteredQuizzes(result);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Quizzes" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Quizzes</h1>
            <p className="text-muted-foreground">
              Create and manage quiz content ({filteredQuizzes.length} quizzes)
            </p>
          </div>
          <CreateQuizDialog onSuccess={loadQuizzes} />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Quizzes List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Quizzes Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "No quizzes match your search."
                  : "No quiz content found. Create your first quiz to get started."}
              </p>
              <CreateQuizDialog onSuccess={loadQuizzes} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredQuizzes.map((quiz) => {
              const quizData = contentService.parseContentData(quiz) as QuizContent;
              return (
                <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                          <HelpCircle className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{quizData.title}</h3>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span>{quizData.questions.length} questions</span>
                          </div>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <Badge variant="outline">Quiz</Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {formatDate(quiz.createdAt)}</span>
                            </div>
                            {quiz.updatedAt && quiz.updatedAt !== quiz.createdAt && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Updated: {formatDate(quiz.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewQuiz(quizData)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditContent(quiz);
                            setEditQuizData(quizData);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(quiz.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Quiz Dialog */}
      <EditQuizDialog
        content={editContent}
        quizData={editQuizData}
        open={!!editContent}
        onOpenChange={(open) => {
          if (!open) {
            setEditContent(null);
            setEditQuizData(null);
          }
        }}
        onSuccess={loadQuizzes}
      />

      {/* View Quiz Dialog */}
      <Dialog open={!!viewQuiz} onOpenChange={() => setViewQuiz(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewQuiz?.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-6">
            {viewQuiz?.questions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">Question {index + 1}: {question.questionText}</h4>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div 
                      key={optIndex} 
                      className={`p-2 rounded ${optIndex === question.correctAnswerIndex ? 'bg-green-100 dark:bg-green-900/20 border border-green-500' : 'bg-muted'}`}
                    >
                      <span className="font-medium">{String.fromCharCode(65 + optIndex)}.</span> {option}
                      {optIndex === question.correctAnswerIndex && (
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400">(Correct Answer)</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quiz</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quiz? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
