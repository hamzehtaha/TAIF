"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Award, Search, Loader2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { skillService } from "@/services/skill.service";
import { Skill } from "@/models/skill.model";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { useToast } from "@/hooks/use-toast";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [skillName, setSkillName] = useState("");
  const [skillDescription, setSkillDescription] = useState("");
  
  // Delete confirmation
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSkills();
  }, []);

  const loadSkills = async () => {
    setIsLoading(true);
    try {
      const data = await skillService.getAllSkills();
      setSkills(data);
    } catch (error) {
      console.error("Failed to load skills:", error);
      toast({
        title: "Error",
        description: "Failed to load skills",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill);
      setSkillName(skill.name);
      setSkillDescription(skill.description || "");
    } else {
      setEditingSkill(null);
      setSkillName("");
      setSkillDescription("");
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSkill(null);
    setSkillName("");
    setSkillDescription("");
  };

  const handleSubmit = async () => {
    if (!skillName.trim()) {
      toast({
        title: "Validation Error",
        description: "Skill name is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingSkill) {
        await skillService.updateSkill(editingSkill.id, {
          name: skillName,
          description: skillDescription || undefined,
        });
        toast({
          title: "Success",
          description: "Skill updated successfully",
        });
      } else {
        await skillService.createSkill({
          name: skillName,
          description: skillDescription || undefined,
        });
        toast({
          title: "Success",
          description: "Skill created successfully",
        });
      }
      handleCloseDialog();
      loadSkills();
    } catch (error) {
      console.error("Failed to save skill:", error);
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsSubmitting(true);
    try {
      await skillService.deleteSkill(deleteId);
      toast({
        title: "Success",
        description: "Skill deleted successfully",
      });
      setDeleteDialogOpen(false);
      setDeleteId("");
      loadSkills();
    } catch (error) {
      console.error("Failed to delete skill:", error);
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSkills = skills.filter((skill) =>
    skill.name.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Award className="h-8 w-8" />
              Skills Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage skills that can be associated with lesson items
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>All Skills ({filteredSkills.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search skills..."
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSkills.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      {searchQuery ? "No skills found matching your search" : "No skills yet. Create your first skill!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkills.map((skill) => (
                    <TableRow key={skill.id}>
                      <TableCell className="font-medium">{skill.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {skill.description || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(skill)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setDeleteId(skill.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "Create Skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill
                ? "Update the skill information"
                : "Add a new skill to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={skillName}
                onChange={(e) => setSkillName(e.target.value)}
                placeholder="e.g., JavaScript, Problem Solving"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={skillDescription}
                onChange={(e) => setSkillDescription(e.target.value)}
                placeholder="Optional description of the skill"
                rows={3}
              />
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
                <>{editingSkill ? "Update" : "Create"}</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this skill? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
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
