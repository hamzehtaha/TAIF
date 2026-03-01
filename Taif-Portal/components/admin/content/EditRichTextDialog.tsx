"use client";

import { useState, useEffect } from "react";
import { FileEdit, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { contentService, LessonItemType, Content, RichTextContent } from "@/services/content.service";
import { useToast } from "@/hooks/use-toast";

interface EditRichTextDialogProps {
  content: Content | null;
  richTextData: RichTextContent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditRichTextDialog({ content, richTextData, open, onOpenChange, onSuccess }: EditRichTextDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (richTextData) {
      setTitle(richTextData.title || "");
      setHtml(richTextData.html || "");
    }
  }, [richTextData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !title.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required",
        variant: "destructive",
      });
      return;
    }

    if (!html.trim()) {
      toast({
        title: "Validation Error",
        description: "HTML content is required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await contentService.updateContent(content.id, {
        type: LessonItemType.RichText,
        richText: {
          title: title,
          html: html,
        },
      });

      toast({
        title: "Success",
        description: "Rich text content updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update rich text content",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Rich Text Content</DialogTitle>
            <DialogDescription>
              Update the HTML content.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Getting Started Guide"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="editor">HTML Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="editor" className="mt-2">
                <div className="grid gap-2">
                  <Textarea
                    id="html"
                    placeholder="<h1>Welcome</h1><p>Your content here...</p>"
                    value={html}
                    onChange={(e) => setHtml(e.target.value)}
                    rows={12}
                    className="font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter HTML content. You can use standard HTML tags for formatting.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="preview" className="mt-2">
                <div 
                  className="border rounded-md p-4 bg-muted/50 min-h-[280px] max-h-[280px] overflow-auto prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: html || '<p class="text-muted-foreground">Preview will appear here...</p>' }}
                />
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Content
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
