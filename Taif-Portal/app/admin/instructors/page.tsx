"use client";

import { useState, useEffect, useMemo } from "react";
import { GraduationCap, Search, Plus, Edit, Trash2 } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { instructorService, Instructor } from "@/services/instructor.service";
import { useToast } from "@/hooks/use-toast";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    bio: "",
    expertises: "",
    yearsOfExperience: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadInstructors();
  }, []);

  const loadInstructors = async () => {
    setIsLoading(true);
    try {
      const data = await instructorService.getAll();
      setInstructors(data);
    } catch (error) {
      console.error("Failed to load instructors:", error);
      setInstructors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInstructors = useMemo(() => {
    if (!searchQuery) return instructors;
    const query = searchQuery.toLowerCase();
    return instructors.filter(i => 
      i.firstName.toLowerCase().includes(query) ||
      i.lastName.toLowerCase().includes(query)
    );
  }, [instructors, searchQuery]);

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      bio: "",
      expertises: "",
      yearsOfExperience: 0,
    });
  };

  const handleCreate = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast({ title: "Error", description: "First and last name are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await instructorService.create({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio || undefined,
        expertises: formData.expertises ? formData.expertises.split(",").map(e => e.trim()) : undefined,
        yearsOfExperience: formData.yearsOfExperience,
      });
      toast({ title: "Success", description: "Instructor created successfully" });
      setCreateDialogOpen(false);
      resetForm();
      loadInstructors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create instructor", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingInstructor || !formData.firstName || !formData.lastName) {
      toast({ title: "Error", description: "First and last name are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await instructorService.update(editingInstructor.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio || undefined,
        expertises: formData.expertises ? formData.expertises.split(",").map(e => e.trim()) : undefined,
        yearsOfExperience: formData.yearsOfExperience,
      });
      toast({ title: "Success", description: "Instructor updated successfully" });
      setEditDialogOpen(false);
      setEditingInstructor(null);
      resetForm();
      loadInstructors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update instructor", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await instructorService.delete(deleteId);
      toast({ title: "Success", description: "Instructor deleted successfully" });
      setDeleteId(null);
      loadInstructors();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete instructor", variant: "destructive" });
    }
  };

  const openEditDialog = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      firstName: instructor.firstName,
      lastName: instructor.lastName,
      bio: instructor.bio || "",
      expertises: instructor.expertises?.join(", ") || "",
      yearsOfExperience: instructor.yearsOfExperience || 0,
    });
    setEditDialogOpen(true);
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Instructors" }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Instructors</h1>
            <p className="text-muted-foreground">Manage instructors ({filteredInstructors.length})</p>
          </div>
          <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Instructor
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredInstructors.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Instructors Found</h3>
              <p className="text-muted-foreground mb-6">Create your first instructor to get started.</p>
              <Button onClick={() => { resetForm(); setCreateDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Add Instructor
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredInstructors.map((instructor) => (
              <Card key={instructor.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{instructor.firstName} {instructor.lastName}</h3>
                        <p className="text-sm text-muted-foreground">{instructor.bio || "No bio"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {instructor.yearsOfExperience > 0 && (
                            <Badge variant="outline">{instructor.yearsOfExperience} years exp.</Badge>
                          )}
                          {instructor.expertises?.slice(0, 3).map((exp, i) => (
                            <Badge key={i} variant="secondary">{exp}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(instructor)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(instructor.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Instructor</DialogTitle>
            <DialogDescription>Add a new instructor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expertises">Expertises (comma-separated)</Label>
              <Input id="expertises" value={formData.expertises} onChange={(e) => setFormData({ ...formData, expertises: e.target.value })} placeholder="React, Node.js, TypeScript" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input id="experience" type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Instructor</DialogTitle>
            <DialogDescription>Update instructor details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-firstName">First Name *</Label>
                <Input id="edit-firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-lastName">Last Name *</Label>
                <Input id="edit-lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea id="edit-bio" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-expertises">Expertises (comma-separated)</Label>
              <Input id="edit-expertises" value={formData.expertises} onChange={(e) => setFormData({ ...formData, expertises: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-experience">Years of Experience</Label>
              <Input id="edit-experience" type="number" value={formData.yearsOfExperience} onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) || 0 })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Instructor</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
