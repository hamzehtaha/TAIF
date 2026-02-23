"use client";

import { useState } from "react";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Database,
  Trash2,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useTheme } from "next-themes";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Mock settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    weeklyDigest: true,
    newEnrollmentAlerts: true,
    reviewAlerts: true,
    autoSave: true,
    compactView: false,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    toast({
      title: "Setting Updated",
      description: "Your preference has been saved.",
    });
  };


  return (
    <InstructorLayout breadcrumbs={[{ label: "Settings" }]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your instructor portal preferences
          </p>
        </div>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Select your preferred color theme
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact View</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more condensed layout
                </p>
              </div>
              <Switch
                checked={settings.compactView}
                onCheckedChange={() => handleToggle("compactView")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle("emailNotifications")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Browser Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show desktop notifications
                </p>
              </div>
              <Switch
                checked={settings.browserNotifications}
                onCheckedChange={() => handleToggle("browserNotifications")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Receive a weekly summary of your courses
                </p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={() => handleToggle("weeklyDigest")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Enrollment Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when students enroll
                </p>
              </div>
              <Switch
                checked={settings.newEnrollmentAlerts}
                onCheckedChange={() => handleToggle("newEnrollmentAlerts")}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Review Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when students leave reviews
                </p>
              </div>
              <Switch
                checked={settings.reviewAlerts}
                onCheckedChange={() => handleToggle("reviewAlerts")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor Preferences */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Editor Preferences</CardTitle>
            </div>
            <CardDescription>Configure content editing behavior</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-Save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save changes while editing
                </p>
              </div>
              <Switch
                checked={settings.autoSave}
                onCheckedChange={() => handleToggle("autoSave")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Security</CardTitle>
            </div>
            <CardDescription>Manage your account security</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security
                </p>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Change Password</Label>
                <p className="text-sm text-muted-foreground">
                  Update your account password
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle>Data Management</CardTitle>
            </div>
            <CardDescription>Manage your course data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                Your course data is synchronized with the backend server. Changes are saved automatically.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Danger Zone</CardTitle>
            </div>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your instructor account
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

    </InstructorLayout>
  );
}
