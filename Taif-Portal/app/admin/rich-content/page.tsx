"use client";

import { useState, useEffect } from "react";
import { FileText, Search, Eye, Trash2, Edit, Calendar } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CreateRichTextDialog } from "@/components/admin/content/CreateRichTextDialog";
import { EditRichTextDialog } from "@/components/admin/content/EditRichTextDialog";
import { contentService, Content, RichTextContent, LessonItemType } from "@/services/content.service";
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

export default function RichContentPage() {
  const [richTexts, setRichTexts] = useState<Content[]>([]);
  const [filteredRichTexts, setFilteredRichTexts] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewContent, setViewContent] = useState<RichTextContent | null>(null);
  const [editContent, setEditContent] = useState<Content | null>(null);
  const [editRichTextData, setEditRichTextData] = useState<RichTextContent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRichTexts();
  }, []);

  useEffect(() => {
    filterRichTexts();
  }, [richTexts, searchQuery]);

  const loadRichTexts = async () => {
    setIsLoading(true);
    try {
      const allContent = await contentService.getAllContent();
      const richTextContent = allContent.filter(c => c.type === LessonItemType.RichText);
      setRichTexts(richTextContent);
    } catch (error) {
      console.error("Failed to load rich texts:", error);
      setRichTexts([]);
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
        description: "Rich text content deleted successfully",
      });
      setDeleteId(null);
      loadRichTexts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      });
    }
  };

  const filterRichTexts = () => {
    let result = [...richTexts];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const richTextData = contentService.parseContentData(item) as RichTextContent;
        return richTextData.title?.toLowerCase().includes(query) || richTextData.html.toLowerCase().includes(query);
      });
    }
    setFilteredRichTexts(result);
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
    <AdminLayout breadcrumbs={[{ label: "Rich Content" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">All Rich Content</h1>
            <p className="text-muted-foreground">
              View all text content across your courses ({filteredRichTexts.length} items)
            </p>
          </div>
          <CreateRichTextDialog onSuccess={loadRichTexts} />
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rich Content List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredRichTexts.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Rich Content Found</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery
                  ? "No content matches your search."
                  : "No rich text content found. Create your first content to get started."}
              </p>
              <CreateRichTextDialog onSuccess={loadRichTexts} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredRichTexts.map((item) => {
              const richTextData = contentService.parseContentData(item) as RichTextContent;
              return (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{richTextData.title || 'Untitled Content'}</h3>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <Badge variant="outline">Rich Text</Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>Created: {formatDate(item.createdAt)}</span>
                            </div>
                            {item.updatedAt && item.updatedAt !== item.createdAt && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>Updated: {formatDate(item.updatedAt)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setViewContent(richTextData)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditContent(item);
                            setEditRichTextData(richTextData);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setDeleteId(item.id)}
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

      {/* Edit Rich Text Dialog */}
      <EditRichTextDialog
        content={editContent}
        richTextData={editRichTextData}
        open={!!editContent}
        onOpenChange={(open) => {
          if (!open) {
            setEditContent(null);
            setEditRichTextData(null);
          }
        }}
        onSuccess={loadRichTexts}
      />

      {/* View Content Dialog */}
      <Dialog open={!!viewContent} onOpenChange={() => setViewContent(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewContent?.title || 'Rich Text Content'}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewContent?.html || "" }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rich Text Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
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
