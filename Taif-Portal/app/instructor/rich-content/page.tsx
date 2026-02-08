"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  FileEdit,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Code,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useInstructor } from "@/contexts/InstructorContext";
import { RichContent, CreateRichContentInput } from "@/types/instructor";
import { formatDistanceToNow, isAfter, subDays, subWeeks, subMonths } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PuzzleLoader } from "@/components/PuzzleLoader";

export default function RichContentPage() {
  const {
    richContents,
    loadRichContents,
    createRichContent,
    updateRichContent,
    deleteRichContent,
    isLoading,
  } = useInstructor();

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<RichContent | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState<RichContent | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<RichContent | null>(null);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");
  
  const [formData, setFormData] = useState<CreateRichContentInput>({
    title: "",
    description: "",
    htmlContent: "",
  });

  // View and filter state
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [connectionFilter, setConnectionFilter] = useState<"all" | "connected" | "standalone">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "title">("newest");

  useEffect(() => {
    loadRichContents();
  }, [loadRichContents]);

  const filteredContents = useMemo(() => {
    let result = [...(richContents || [])];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (content) =>
          content.title.toLowerCase().includes(query) ||
          content.description?.toLowerCase().includes(query)
      );
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
      result = result.filter((c) => isAfter(new Date(c.createdAt), cutoffDate));
    }

    // Sort
    switch (sortBy) {
      case "newest": result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "oldest": result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); break;
      case "title": result.sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    return result;
  }, [richContents, searchQuery, dateFilter, sortBy]);

  const handleOpenCreate = () => {
    setEditingContent(null);
    setFormData({
      title: "",
      description: "",
      htmlContent: `<h2>Your Title Here</h2>
<p>Start writing your content...</p>
<ul>
  <li>Point one</li>
  <li>Point two</li>
</ul>`,
    });
    setEditorTab("edit");
    setDialogOpen(true);
  };

  const handleOpenEdit = (content: RichContent) => {
    setEditingContent(content);
    setFormData({
      title: content.title,
      description: content.description || "",
      htmlContent: content.htmlContent,
    });
    setEditorTab("edit");
    setDialogOpen(true);
  };

  const handlePreview = (content: RichContent) => {
    setPreviewContent(content);
    setPreviewDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title || !formData.htmlContent) return;

    if (editingContent) {
      await updateRichContent(editingContent.id, formData);
    } else {
      await createRichContent(formData);
    }
    setDialogOpen(false);
  };

  const handleDeleteClick = (content: RichContent) => {
    setContentToDelete(content);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (contentToDelete) {
      await deleteRichContent(contentToDelete.id);
      setDeleteDialogOpen(false);
      setContentToDelete(null);
    }
  };

  const getContentPreview = (html: string) => {
    const text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    return text.length > 150 ? text.slice(0, 150) + "..." : text;
  };

  return (
    <InstructorLayout breadcrumbs={[{ label: "Rich Content" }]}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Rich Content</h1>
            <p className="text-muted-foreground">
              Create and manage HTML content for your lessons
            </p>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Content
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
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
        {(connectionFilter !== "all" || dateFilter !== "all" || searchQuery) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-destructive">×</button>
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
            <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setConnectionFilter("all"); setDateFilter("all"); }}>
              Clear All
            </Button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{(richContents || []).length}</p>
              <p className="text-sm text-muted-foreground">Total Content</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-secondary">
                {(richContents || []).filter((c) => c.htmlContent.includes("<h")).length}
              </p>
              <p className="text-sm text-muted-foreground">With Headings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-accent">
                {(richContents || []).filter((c) => c.htmlContent.includes("<code") || c.htmlContent.includes("<pre")).length}
              </p>
              <p className="text-sm text-muted-foreground">With Code</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <PuzzleLoader />
          </div>
        )}

        {/* Content List */}
        {!isLoading && filteredContents.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContents.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 rounded-lg bg-secondary/10 flex-shrink-0">
                          <FileEdit className="h-5 w-5 text-secondary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{content.title}</h3>
                          {content.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                              {content.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground/70 mt-2 line-clamp-2">
                            {getContentPreview(content.htmlContent)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Updated {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(content)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(content)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(content)}
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
            /* List View */
            <div className="space-y-2">
              {filteredContents.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-secondary/10 flex-shrink-0">
                        <FileEdit className="h-5 w-5 text-secondary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{content.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {getContentPreview(content.htmlContent)}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {formatDistanceToNow(new Date(content.updatedAt), { addSuffix: true })}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex-shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handlePreview(content)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(content)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteClick(content)}
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
              <FileEdit className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchQuery ? "No content found" : "No content yet"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? "Try adjusting your search query"
                  : "Create your first rich content to enhance your lessons"}
              </p>
              {!searchQuery && (
                <Button onClick={handleOpenCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Content
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>{editingContent ? "Edit Content" : "Add New Content"}</DialogTitle>
            <DialogDescription>
              {editingContent
                ? "Update the content details and HTML"
                : "Create rich HTML content for your lessons"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., HTML Document Structure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
            </div>

            <Tabs value={editorTab} onValueChange={(v) => setEditorTab(v as typeof editorTab)} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="w-fit">
                <TabsTrigger value="edit" className="gap-2">
                  <Code className="h-4 w-4" />
                  HTML
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="flex-1 overflow-hidden mt-2">
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, htmlContent: e.target.value }))}
                  placeholder="<h2>Your content here...</h2>"
                  className="h-full min-h-[300px] font-mono text-sm resize-none"
                />
              </TabsContent>
              <TabsContent value="preview" className="flex-1 overflow-auto mt-2">
                <div
                  className="border rounded-lg p-4 prose prose-sm dark:prose-invert max-w-none min-h-[300px] bg-background"
                  dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                />
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.title || !formData.htmlContent}
            >
              {editingContent ? "Save Changes" : "Add Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{previewContent?.title}</DialogTitle>
            {previewContent?.description && (
              <DialogDescription>{previewContent.description}</DialogDescription>
            )}
          </DialogHeader>
          <div
            className="prose prose-sm dark:prose-invert max-w-none overflow-auto max-h-[60vh] border rounded-lg p-4 bg-background"
            dangerouslySetInnerHTML={{ __html: previewContent?.htmlContent || "" }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setPreviewDialogOpen(false);
              if (previewContent) handleOpenEdit(previewContent);
            }}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{contentToDelete?.title}"? This action cannot be undone.
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
