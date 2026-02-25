"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  BookOpen,
  Users,
  Star,
  Save,
  Camera,
  Award,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";
import { instructorProfileService, InstructorProfileResponse } from "@/services/instructor-profile.service";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<InstructorProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    bio: "",
    expertise: "",
    expertises: [] as string[],
  });
  const [currentExpertise, setCurrentExpertise] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      console.log("Loading instructor profile...");
      const profileData = await instructorProfileService.getCurrentProfile();
      console.log("Profile data received:", profileData);
      setProfile(profileData);
      setFormData({
        firstName: profileData.firstName || "",
        lastName: profileData.lastName || "",
        email: profileData.email || "",
        bio: profileData.bio || "",
        expertise: profileData.expertises?.join(", ") || "",
        expertises: profileData.expertises || [],
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updatedProfile = await instructorProfileService.updateCurrentProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
        expertises: formData.expertises,
      });
      setProfile(updatedProfile);
      setIsEditing(false);
      setCurrentExpertise("");
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addExpertise = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && currentExpertise.trim()) {
      e.preventDefault();
      const newExpertise = currentExpertise.trim();
      if (!formData.expertises.includes(newExpertise)) {
        setFormData(prev => ({
          ...prev,
          expertises: [...prev.expertises, newExpertise],
          expertise: [...prev.expertises, newExpertise].join(", "),
        }));
      }
      setCurrentExpertise("");
    }
  };

  const removeExpertise = (expertiseToRemove: string) => {
    setFormData(prev => {
      const newExpertises = prev.expertises.filter(exp => exp !== expertiseToRemove);
      return {
        ...prev,
        expertises: newExpertises,
        expertise: newExpertises.join(", "),
      };
    });
  };

  if (isLoading) {
    return (
      <AdminLayout breadcrumbs={[{ label: "Profile" }]}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center">Loading profile...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!profile) {
    return (
      <AdminLayout breadcrumbs={[{ label: "Profile" }]}>
        <div className="p-6 max-w-4xl mx-auto">
          <div className="text-center">Profile not found.</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout breadcrumbs={[{ label: "Profile" }]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Instructor Profile</h1>
            <p className="text-muted-foreground">
              Manage your public profile and account settings
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={() => {
              setIsEditing(true);
              setCurrentExpertise("");
            }}>
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setCurrentExpertise("");
              }}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {profile.firstName?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'IN'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {!isEditing && (
                  <div className="text-center">
                    <p className="font-semibold text-lg">
                      {profile.firstName} {profile.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {profile.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              firstName: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              lastName: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, bio: e.target.value }))
                        }
                        placeholder="Tell students about yourself..."
                        className="min-h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expertise">Expertise</Label>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-2 min-h-[42px] p-2 border rounded-md bg-background">
                          {formData.expertises.map((expertise) => (
                            <Badge
                              key={expertise}
                              variant="secondary"
                              className="flex items-center gap-1 pr-1"
                            >
                              {expertise}
                              <button
                                type="button"
                                onClick={() => removeExpertise(expertise)}
                                className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                          <Input
                            id="expertise"
                            value={currentExpertise}
                            onChange={(e) => setCurrentExpertise(e.target.value)}
                            onKeyDown={addExpertise}
                            placeholder="Type expertise and press Enter"
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-7 px-1 min-w-[120px]"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-muted-foreground">Bio</Label>
                      <p className="mt-1">
                        {profile.bio || "No bio added yet."}
                      </p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Expertise</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {profile.expertises && profile.expertises.length > 0 ? (
                          profile.expertises.map((skill) => (
                            <Badge key={skill} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No expertise added yet.
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profile.coursesCount ?? 0}</p>
                <p className="text-xs text-muted-foreground">Courses</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{(profile.rating ?? 0).toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Award className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">Pro</p>
                <p className="text-xs text-muted-foreground">Status</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates about your courses
                </p>
              </div>
              <Badge>Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Badge>Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your instructor account
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
