"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Tags,
  Heart,
  Link2,
  Search,
  X,
  Check,
  Loader2,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  GripVertical,
  ArrowLeftRight,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { interestService } from "@/services/interest.service";
import { tagService, Tag } from "@/services/tag.service";
import {
  interestTagMappingService,
  InterestTagMapping,
} from "@/services/interest-tag-mapping.service";
import { Interest } from "@/models/interest.model";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { cn } from "@/lib/utils";

export default function InterestsTagsPage() {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [mappings, setMappings] = useState<InterestTagMapping[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Interest state
  const [interestDialogOpen, setInterestDialogOpen] = useState(false);
  const [editingInterest, setEditingInterest] = useState<Interest | null>(null);
  const [interestName, setInterestName] = useState("");
  const [interestSearch, setInterestSearch] = useState("");

  // Tag state
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagName, setTagName] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  // Mapping UI state
  const [mappingInterestId, setMappingInterestId] = useState<string>("");
  const [availableTagSearch, setAvailableTagSearch] = useState("");
  const [selectedTagSearch, setSelectedTagSearch] = useState("");
  const [pendingWeights, setPendingWeights] = useState<Record<string, number>>({});

  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<"interest" | "tag" | "mapping">("interest");
  const [deleteId, setDeleteId] = useState<string>("");

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [interestsData, tagsData, mappingsData] = await Promise.all([
        interestService.getAllInterests(),
        tagService.getAllTags(),
        interestTagMappingService.getAllMappings(),
      ]);
      setInterests(interestsData);
      setTags(tagsData);
      setMappings(mappingsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Interest handlers
  const handleOpenInterestDialog = (interest?: Interest) => {
    if (interest) {
      setEditingInterest(interest);
      setInterestName(interest.name);
    } else {
      setEditingInterest(null);
      setInterestName("");
    }
    setInterestDialogOpen(true);
  };

  const handleSaveInterest = async () => {
    if (!interestName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingInterest) {
        await interestService.updateInterest(editingInterest.id, interestName.trim());
      } else {
        await interestService.createInterest(interestName.trim());
      }
      await loadData();
      setInterestDialogOpen(false);
    } catch (error) {
      console.error("Failed to save interest:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tag handlers
  const handleOpenTagDialog = (tag?: Tag) => {
    if (tag) {
      setEditingTag(tag);
      setTagName(tag.name);
    } else {
      setEditingTag(null);
      setTagName("");
    }
    setTagDialogOpen(true);
  };

  const handleSaveTag = async () => {
    if (!tagName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingTag) {
        await tagService.updateTag(editingTag.id, tagName.trim());
      } else {
        await tagService.createTag(tagName.trim());
      }
      await loadData();
      setTagDialogOpen(false);
    } catch (error) {
      console.error("Failed to save tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateMappingWeight = async (mappingId: string, weight: number) => {
    try {
      await interestTagMappingService.updateMappingWeight(mappingId, weight);
      setMappings((prev) =>
        prev.map((m) => (m.id === mappingId ? { ...m, weight } : m))
      );
    } catch (error) {
      console.error("Failed to update weight:", error);
    }
  };

  // Delete handlers
  const handleConfirmDelete = (type: "interest" | "tag" | "mapping", id: string) => {
    setDeleteType(type);
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      switch (deleteType) {
        case "interest":
          await interestService.deleteInterest(deleteId);
          break;
        case "tag":
          await tagService.deleteTag(deleteId);
          break;
        case "mapping":
          await interestTagMappingService.deleteMapping(deleteId);
          break;
      }
      await loadData();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter helpers
  const filteredInterests = interests.filter((i) =>
    i.name.toLowerCase().includes(interestSearch.toLowerCase())
  );

  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const getMappingsForInterest = (interestId: string) =>
    mappings.filter((m) => m.interestId === interestId);

  const getTagName = (tagId: string) =>
    tags.find((t) => t.id === tagId)?.name || "Unknown";

  const getInterestName = (interestId: string) =>
    interests.find((i) => i.id === interestId)?.name || "Unknown";

  // New mapping UI helpers
  const selectedInterestMappings = mappings.filter(
    (m) => m.interestId === mappingInterestId
  );
  const selectedTagIds = new Set(selectedInterestMappings.map((m) => m.tagId));
  
  const availableTags = tags
    .filter((t) => !selectedTagIds.has(t.id))
    .filter((t) => t.name.toLowerCase().includes(availableTagSearch.toLowerCase()));
  
  const selectedMappedTags = selectedInterestMappings
    .map((m) => ({
      mapping: m,
      tag: tags.find((t) => t.id === m.tagId),
    }))
    .filter((item) => item.tag)
    .filter((item) => 
      item.tag!.name.toLowerCase().includes(selectedTagSearch.toLowerCase())
    );

  const handleAddTagToInterest = async (tagId: string) => {
    if (!mappingInterestId) return;
    setIsSubmitting(true);
    try {
      const weight = pendingWeights[tagId] ?? 0.5;
      await interestTagMappingService.createMapping({
        interestId: mappingInterestId,
        tagId,
        weight,
      });
      await loadData();
      setPendingWeights((prev) => {
        const next = { ...prev };
        delete next[tagId];
        return next;
      });
    } catch (error) {
      console.error("Failed to add tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveTagFromInterest = async (mappingId: string) => {
    setIsSubmitting(true);
    try {
      await interestTagMappingService.deleteMapping(mappingId);
      await loadData();
    } catch (error) {
      console.error("Failed to remove tag:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePendingWeightChange = (tagId: string, weight: number) => {
    setPendingWeights((prev) => ({ ...prev, [tagId]: weight }));
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <PuzzleLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Interests & Tags" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              Interests & Tags Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage user interests, content tags, and their relationships for recommendations
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-pink-500/10">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{interests.length}</p>
                <p className="text-sm text-muted-foreground">Interests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Tags className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tags.length}</p>
                <p className="text-sm text-muted-foreground">Tags</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Link2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mappings.length}</p>
                <p className="text-sm text-muted-foreground">Mappings</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="interests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="interests" className="gap-2">
              <Heart className="h-4 w-4" />
              Interests
            </TabsTrigger>
            <TabsTrigger value="tags" className="gap-2">
              <Tags className="h-4 w-4" />
              Tags
            </TabsTrigger>
            <TabsTrigger value="mappings" className="gap-2">
              <Link2 className="h-4 w-4" />
              Mappings
            </TabsTrigger>
          </TabsList>

          {/* Interests Tab */}
          <TabsContent value="interests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Interests</CardTitle>
                    <CardDescription>
                      User interests that drive content recommendations
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenInterestDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Interest
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search interests..."
                      value={interestSearch}
                      onChange={(e) => setInterestSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-2">
                    {filteredInterests.map((interest) => {
                      const relatedMappings = getMappingsForInterest(interest.id);
                      return (
                        <div
                          key={interest.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-pink-500" />
                              <span className="font-medium">{interest.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {relatedMappings.length} tags
                              </Badge>
                            </div>
                            {relatedMappings.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {relatedMappings.slice(0, 5).map((m) => (
                                  <Badge key={m.id} variant="outline" className="text-xs">
                                    {getTagName(m.tagId)}
                                  </Badge>
                                ))}
                                {relatedMappings.length > 5 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{relatedMappings.length - 5} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenInterestDialog(interest)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConfirmDelete("interest", interest.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                    {filteredInterests.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <Heart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No interests found</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tags</CardTitle>
                    <CardDescription>
                      Content tags used to categorize courses and lessons
                    </CardDescription>
                  </div>
                  <Button onClick={() => handleOpenTagDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Tag
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      value={tagSearch}
                      onChange={(e) => setTagSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
                <ScrollArea className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredTags.map((tag) => {
                      const relatedMappings = mappings.filter((m) => m.tagId === tag.id);
                      return (
                        <div
                          key={tag.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <Tags className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span className="font-medium truncate">{tag.name}</span>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {relatedMappings.length}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleOpenTagDialog(tag)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleConfirmDelete("tag", tag.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {filteredTags.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Tags className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No tags found</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mappings Tab */}
          <TabsContent value="mappings">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Interest-Tag Mappings</CardTitle>
                  <CardDescription>
                    Select an interest, then move tags between available and selected columns
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Interest Selector */}
                <div className="space-y-2">
                  <Label className="text-base font-semibold">Select Interest</Label>
                  <Select value={mappingInterestId} onValueChange={setMappingInterestId}>
                    <SelectTrigger className="w-full max-w-md">
                      <SelectValue placeholder="Choose an interest to manage its tags..." />
                    </SelectTrigger>
                    <SelectContent>
                      {interests.map((interest) => (
                        <SelectItem key={interest.id} value={interest.id}>
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-pink-500" />
                            {interest.name}
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {getMappingsForInterest(interest.id).length} tags
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {mappingInterestId ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Tags Column */}
                    <div className="border rounded-lg">
                      <div className="p-4 border-b bg-muted/30">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Tags className="h-5 w-5 text-muted-foreground" />
                            <h3 className="font-semibold">Available Tags</h3>
                          </div>
                          <Badge variant="outline">{availableTags.length}</Badge>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search available..."
                            value={availableTagSearch}
                            onChange={(e) => setAvailableTagSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-2">
                          {availableTags.map((tag) => (
                            <div
                              key={tag.id}
                              className="group flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 hover:border-primary/50 transition-all cursor-pointer"
                              onClick={() => handleAddTagToInterest(tag.id)}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Tags className="h-4 w-4 text-blue-500" />
                                <span className="font-medium">{tag.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <span className="text-xs text-muted-foreground">
                                    {((pendingWeights[tag.id] ?? 0.5) * 100).toFixed(0)}%
                                  </span>
                                  <Slider
                                    value={[pendingWeights[tag.id] ?? 0.5]}
                                    onValueChange={([v]) => handlePendingWeightChange(tag.id, v)}
                                    onClick={(e) => e.stopPropagation()}
                                    max={1}
                                    step={0.1}
                                    className="w-16"
                                  />
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                  disabled={isSubmitting}
                                >
                                  <ChevronRight className="h-4 w-4 text-primary" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          {availableTags.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <Tags className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">
                                {tags.length === selectedTagIds.size
                                  ? "All tags are mapped"
                                  : "No matching tags"}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Selected Tags Column */}
                    <div className="border rounded-lg border-primary/30 bg-primary/5">
                      <div className="p-4 border-b bg-primary/10">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Check className="h-5 w-5 text-primary" />
                            <h3 className="font-semibold">Selected Tags</h3>
                          </div>
                          <Badge variant="default">{selectedMappedTags.length}</Badge>
                        </div>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search selected..."
                            value={selectedTagSearch}
                            onChange={(e) => setSelectedTagSearch(e.target.value)}
                            className="pl-9"
                          />
                        </div>
                      </div>
                      <ScrollArea className="h-[400px] p-4">
                        <div className="space-y-2">
                          {selectedMappedTags.map(({ mapping, tag }) => (
                            <div
                              key={mapping.id}
                              className="group flex items-center gap-3 p-3 border rounded-lg bg-background hover:bg-muted/50 transition-all"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 flex-shrink-0"
                                onClick={() => handleRemoveTagFromInterest(mapping.id)}
                                disabled={isSubmitting}
                              >
                                <ChevronLeft className="h-4 w-4 text-destructive" />
                              </Button>
                              <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                                <Tags className="h-4 w-4 text-blue-500" />
                                <span className="font-medium truncate">{tag!.name}</span>
                              </div>
                              <div className="flex-1 flex items-center gap-2 ml-auto">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  Weight:
                                </span>
                                <Slider
                                  value={[mapping.weight]}
                                  onValueChange={([v]) => handleUpdateMappingWeight(mapping.id, v)}
                                  max={1}
                                  step={0.1}
                                  className="flex-1 min-w-[80px]"
                                />
                                <span className="text-sm font-semibold w-10 text-right">
                                  {(mapping.weight * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ))}
                          {selectedMappedTags.length === 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                              <ArrowLeftRight className="h-10 w-10 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No tags mapped yet</p>
                              <p className="text-xs mt-1">
                                Click tags on the left to add them
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border rounded-lg bg-muted/20">
                    <Heart className="h-16 w-16 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Select an Interest</p>
                    <p className="text-sm mt-1">
                      Choose an interest above to manage its tag mappings
                    </p>
                  </div>
                )}

                {/* Summary Stats */}
                {mappingInterestId && (
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-pink-500" />
                        <span className="font-medium">
                          {getInterestName(mappingInterestId)}
                        </span>
                      </div>
                      <Separator orientation="vertical" className="h-6" />
                      <span className="text-sm text-muted-foreground">
                        {selectedMappedTags.length} of {tags.length} tags mapped
                      </span>
                    </div>
                    {isSubmitting && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Interest Dialog */}
      <Dialog open={interestDialogOpen} onOpenChange={setInterestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInterest ? "Edit Interest" : "Create Interest"}
            </DialogTitle>
            <DialogDescription>
              {editingInterest
                ? "Update the interest name"
                : "Add a new user interest for recommendations"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="interest-name">Interest Name</Label>
              <Input
                id="interest-name"
                placeholder="e.g., Sign Language, Communication"
                value={interestName}
                onChange={(e) => setInterestName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInterestDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveInterest} disabled={!interestName.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingInterest ? "Save Changes" : "Create Interest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tag Dialog */}
      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTag ? "Edit Tag" : "Create Tag"}</DialogTitle>
            <DialogDescription>
              {editingTag
                ? "Update the tag name"
                : "Add a new content tag for categorization"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
                placeholder="e.g., ASL Basics, Deaf Culture"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTag} disabled={!tagName.trim() || isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTag ? "Save Changes" : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteType}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteType} and any associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
