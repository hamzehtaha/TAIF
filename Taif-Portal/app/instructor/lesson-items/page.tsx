"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Video,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
  Edit,
  MoreVertical,
  Layers,
} from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInstructor } from "@/contexts/InstructorContext";
import { LessonItemType } from "@/types/instructor";
import { cn } from "@/lib/utils";

export default function LessonItemsPage() {
  const {
    lessonItems,
    videos,
    richContents,
    questions,
    loadLessonItems,
    loadVideos,
    loadRichContents,
    loadQuestions,
    createStandaloneLessonItem,
    deleteStandaloneLessonItem,
  } = useInstructor();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<LessonItemType | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<LessonItemType>("video");
  const [selectedContentId, setSelectedContentId] = useState("");
  const [itemTitle, setItemTitle] = useState("");

  useEffect(() => {
    loadLessonItems();
    loadVideos();
    loadRichContents();
    loadQuestions();
  }, [loadLessonItems, loadVideos, loadRichContents, loadQuestions]);

  const safeItems = lessonItems || [];
  const safeVideos = videos || [];
  const safeRichContents = richContents || [];
  const safeQuestions = questions || [];

  const filteredItems = safeItems.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const getItemIcon = (type: LessonItemType) => {
    switch (type) {
      case "video":
        return <Video className="h-5 w-5 text-primary" />;
      case "rich-content":
        return <FileText className="h-5 w-5 text-secondary" />;
      case "question":
        return <HelpCircle className="h-5 w-5 text-warning" />;
    }
  };

  const getItemBadgeVariant = (type: LessonItemType): "default" | "secondary" | "outline" => {
    switch (type) {
      case "video":
        return "default";
      case "rich-content":
        return "secondary";
      case "question":
        return "outline";
    }
  };

  const getContentName = (item: typeof safeItems[0]) => {
    if (item.type === "video") {
      const video = safeVideos.find((v) => v.id === item.videoContentId);
      return video?.title || "Unknown video";
    }
    if (item.type === "rich-content") {
      const content = safeRichContents.find((r) => r.id === item.richContentId);
      return content?.title || "Unknown content";
    }
    if (item.type === "question") {
      const question = safeQuestions.find((q) => q.id === item.questionId);
      return question?.text?.slice(0, 50) || "Unknown question";
    }
    return "";
  };

  const getContentOptions = () => {
    switch (selectedType) {
      case "video":
        return safeVideos.map((v) => ({ id: v.id, label: v.title }));
      case "rich-content":
        return safeRichContents.map((r) => ({ id: r.id, label: r.title }));
      case "question":
        return safeQuestions.map((q) => ({ id: q.id, label: q.text.slice(0, 60) }));
    }
  };

  const handleCreate = async () => {
    if (!itemTitle.trim() || !selectedContentId) return;

    await createStandaloneLessonItem({
      title: itemTitle,
      type: selectedType,
      videoContentId: selectedType === "video" ? selectedContentId : undefined,
      richContentId: selectedType === "rich-content" ? selectedContentId : undefined,
      questionId: selectedType === "question" ? selectedContentId : undefined,
    });

    setDialogOpen(false);
    setItemTitle("");
    setSelectedContentId("");
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteStandaloneLessonItem(deleteId);
      setDeleteId(null);
    }
  };

  const openCreateDialog = () => {
    setItemTitle("");
    setSelectedContentId("");
    setSelectedType("video");
    setDialogOpen(true);
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Lesson Items" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lesson Items</h1>
            <p className="text-muted-foreground">
              Create reusable lesson items from your content library
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Item
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={typeFilter}
            onValueChange={(value) => setTypeFilter(value as LessonItemType | "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="video">Video</SelectItem>
              <SelectItem value="rich-content">Rich Content</SelectItem>
              <SelectItem value="question">Question</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{safeItems.length}</p>
              <p className="text-sm text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              typeFilter === "video" && "ring-2 ring-primary"
            )}
            onClick={() => setTypeFilter(typeFilter === "video" ? "all" : "video")}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">
                {safeItems.filter((i) => i.type === "video").length}
              </p>
              <p className="text-sm text-muted-foreground">Videos</p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              typeFilter === "rich-content" && "ring-2 ring-secondary"
            )}
            onClick={() => setTypeFilter(typeFilter === "rich-content" ? "all" : "rich-content")}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {safeItems.filter((i) => i.type === "rich-content").length}
              </p>
              <p className="text-sm text-muted-foreground">Rich Content</p>
            </CardContent>
          </Card>
          <Card
            className={cn(
              "cursor-pointer transition-colors",
              typeFilter === "question" && "ring-2 ring-warning"
            )}
            onClick={() => setTypeFilter(typeFilter === "question" ? "all" : "question")}
          >
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-warning">
                {safeItems.filter((i) => i.type === "question").length}
              </p>
              <p className="text-sm text-muted-foreground">Questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Items List */}
        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      {getItemIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <Badge
                          variant={getItemBadgeVariant(item.type)}
                          className="text-xs capitalize"
                        >
                          {item.type.replace("-", " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getContentName(item)}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(item.id)}
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
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Layers className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery || typeFilter !== "all" ? "No items found" : "No lesson items yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Create lesson items by selecting content from your library"}
              </p>
              {!searchQuery && typeFilter === "all" && (
                <Button onClick={openCreateDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Lesson Item</DialogTitle>
            <DialogDescription>
              Create a lesson item by selecting content from your library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Item Title</Label>
              <Input
                placeholder="Enter item title..."
                value={itemTitle}
                onChange={(e) => setItemTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Content Type</Label>
              <Select
                value={selectedType}
                onValueChange={(value) => {
                  setSelectedType(value as LessonItemType);
                  setSelectedContentId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video
                    </div>
                  </SelectItem>
                  <SelectItem value="rich-content">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Rich Content
                    </div>
                  </SelectItem>
                  <SelectItem value="question">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      Question
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Content</Label>
              <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose content..." />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="max-h-60">
                    {getContentOptions().map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
              {getContentOptions().length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No {selectedType.replace("-", " ")} content available. Create some first.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!itemTitle.trim() || !selectedContentId}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Lesson Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this lesson item. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </InstructorLayout>
  );
}
