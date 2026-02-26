"use client";

import { useState, useEffect, useMemo } from "react";
import { Users, Search, Edit, Trash2, Shield, Mail, Check, X, Plus } from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { userService, User, UserRoleType, RoleLabels, CreateUserRequest } from "@/services/user.service";
import { organizationService, Organization } from "@/services/organization.service";
import { useToast } from "@/hooks/use-toast";

const roleColors: Record<number, string> = {
  0: "bg-red-500/10 text-red-500",
  1: "bg-orange-500/10 text-orange-500",
  2: "bg-blue-500/10 text-blue-500",
  3: "bg-green-500/10 text-green-500",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  const [createFormData, setCreateFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: 2 as UserRoleType, // Default to ContentCreator
  });
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: 3 as UserRoleType,
    isActive: true,
    organizationId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    loadUsers();
    loadOrganizations();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const data = await organizationService.getAll();
      setOrganizations(data);
    } catch (error) {
      console.error("Failed to load organizations:", error);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(u => 
        u.firstName.toLowerCase().includes(query) ||
        u.lastName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }
    if (roleFilter !== "all") {
      result = result.filter(u => u.role === parseInt(roleFilter));
    }
    return result;
  }, [users, searchQuery, roleFilter]);

  const resetCreateForm = () => {
    setCreateFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: 2 as UserRoleType,
    });
  };

  const handleCreate = async () => {
    if (!createFormData.firstName || !createFormData.lastName || !createFormData.email || !createFormData.password) {
      toast({ title: "Error", description: "All fields are required", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await userService.create({
        firstName: createFormData.firstName,
        lastName: createFormData.lastName,
        email: createFormData.email,
        password: createFormData.password,
        role: createFormData.role,
      });
      toast({ title: "Success", description: "User created successfully" });
      setCreateDialogOpen(false);
      resetCreateForm();
      loadUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create user", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await userService.update(editingUser.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        isActive: formData.isActive,
        organizationId: formData.organizationId || undefined,
      });
      toast({ title: "Success", description: "User updated successfully" });
      setEditDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update user", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async () => {
    if (!editingUser) return;
    setIsSubmitting(true);
    try {
      await userService.updateRole(editingUser.id, formData.role);
      toast({ title: "Success", description: "Role updated successfully" });
      setRoleDialogOpen(false);
      setEditingUser(null);
      loadUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update role", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await userService.delete(deleteId);
      toast({ title: "Success", description: "User deleted successfully" });
      setDeleteId(null);
      loadUsers();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      organizationId: user.organizationId || "",
    });
    setEditDialogOpen(true);
  };

  const openRoleDialog = (user: User) => {
    setEditingUser(user);
    setFormData({ ...formData, role: user.role });
    setRoleDialogOpen(true);
  };

  const getOrgName = (orgId?: string) => {
    if (!orgId) return "None";
    const org = organizations.find(o => o.id === orgId);
    return org?.name || "Unknown";
  };

  return (
    <AdminLayout breadcrumbs={[{ label: "Users" }]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Users</h1>
            <p className="text-muted-foreground">Manage users and roles ({filteredUsers.length})</p>
          </div>
          <Button onClick={() => { resetCreateForm(); setCreateDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="0">Super Admin</SelectItem>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Content Creator</SelectItem>
                  <SelectItem value="3">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Users Found</h3>
              <p className="text-muted-foreground">No users match your search criteria.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{user.firstName} {user.lastName}</h3>
                          <Badge className={roleColors[user.role]}>{RoleLabels[user.role]}</Badge>
                          {!user.isActive && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                          {user.emailVerified ? (
                            <Check className="h-3 w-3 text-green-500" />
                          ) : (
                            <X className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                        {user.organizationId && (
                          <p className="text-xs text-muted-foreground mt-1">Org: {getOrgName(user.organizationId)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openRoleDialog(user)} title="Change Role">
                        <Shield className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleteId(user.id)}>
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
            <DialogTitle>Create User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-firstName">First Name *</Label>
                <Input id="create-firstName" value={createFormData.firstName} onChange={(e) => setCreateFormData({ ...createFormData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-lastName">Last Name *</Label>
                <Input id="create-lastName" value={createFormData.lastName} onChange={(e) => setCreateFormData({ ...createFormData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-email">Email *</Label>
              <Input id="create-email" type="email" value={createFormData.email} onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">Password *</Label>
              <Input id="create-password" type="password" value={createFormData.password} onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={createFormData.role.toString()} onValueChange={(v) => setCreateFormData({ ...createFormData, role: parseInt(v) as UserRoleType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Super Admin</SelectItem>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Content Creator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create User"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={formData.role.toString()} onValueChange={(v) => setFormData({ ...formData, role: parseInt(v) as UserRoleType })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Super Admin</SelectItem>
                  <SelectItem value="1">Admin</SelectItem>
                  <SelectItem value="2">Content Creator</SelectItem>
                  <SelectItem value="3">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Organization</Label>
              <Select value={formData.organizationId} onValueChange={(v) => setFormData({ ...formData, organizationId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Change Role</DialogTitle>
            <DialogDescription>Update role for {editingUser?.firstName} {editingUser?.lastName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={formData.role.toString()} onValueChange={(v) => setFormData({ ...formData, role: parseInt(v) as UserRoleType })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Super Admin</SelectItem>
                <SelectItem value="1">Admin</SelectItem>
                <SelectItem value="2">Content Creator</SelectItem>
                <SelectItem value="3">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleRoleChange} disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Update Role"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
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
