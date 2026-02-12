"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useTheme } from "next-themes";
import { useLanguage } from "@/hooks/useLanguage";

type FontSize = "small" | "medium" | "large" | "extra-large";
import { authService } from "@/services/auth.service";
import { interestService } from "@/services/interest.service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Lock, User, LogOut, Type, Moon, Sun, Globe, Sparkles, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Interest } from "@/models/interest.model";

const interestIcons: Record<string, string> = {
  "Sign Language & Deaf Education": "👋",
  "Visual Impairment & Braille": "📖",
  "Assistive Technology": "💻",
  "Sensory Processing & Autism": "🧩",
  "Learning Disabilities": "📚",
  "Physical & Motor Disabilities": "🏃",
  "Speech & Communication": "💬",
  "Cognitive Development": "🧠",
};

export default function Settings() {
  const t = useTranslation();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [fontSize, setFontSizeState] = useState<FontSize>("medium");

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    localStorage.setItem("fontSize", size);
    const html = document.documentElement;
    html.classList.remove("font-small", "font-medium", "font-large", "font-extra-large");
    html.classList.add(`font-${size}`);
  };
  const [user, setUser] = useState<any>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [savingInterests, setSavingInterests] = useState(false);
  const [interestsChanged, setInterestsChanged] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(authService.getUser());
    if (!authService.isAuthenticated()) {
      router.push("/signin");
    }
    // Load saved font size
    const savedFontSize = localStorage.getItem("fontSize") as FontSize | null;
    if (savedFontSize) {
      setFontSizeState(savedFontSize);
      document.documentElement.classList.add(`font-${savedFontSize}`);
    }

    const loadInterests = async () => {
      try {
        const [allInterests, userInterests] = await Promise.all([
          interestService.getAllInterests(),
          interestService.getUserInterests().catch(() => [])
        ]);
        setInterests(allInterests);
        // Pre-select user's existing interests
        const userInterestIds = new Set(userInterests.map(i => i.id));
        setSelectedInterests(userInterestIds);
      } catch (err) {
        console.error("Failed to load interests:", err);
      }
    };
    loadInterests();
  }, [router]);

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(interestId)) {
        newSet.delete(interestId);
      } else {
        newSet.add(interestId);
      }
      return newSet;
    });
    setInterestsChanged(true);
  };

  const handleSaveInterests = async () => {
    setSavingInterests(true);
    try {
      await interestService.updateUserInterests(Array.from(selectedInterests));
      setInterestsChanged(false);
    } catch (err) {
      console.error("Failed to save interests:", err);
    } finally {
      setSavingInterests(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    router.push("/login");
  };

  const fontSizes: { value: FontSize; label: string }[] = [
    { value: "small", label: t.settings.small },
    { value: "medium", label: t.settings.medium },
    { value: "large", label: t.settings.large },
    { value: "extra-large", label: t.settings.extraLarge },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">{t.settings.title}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t.settings.profile}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.common.name}
                    </label>
                    <div className="p-4 bg-muted rounded-lg">
                      {mounted ? `${user?.firstName || ''} ${user?.lastName || ''}` : ''}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.common.email}
                    </label>
                    <div className="p-4 bg-muted rounded-lg">{mounted ? user?.email || '' : ''}</div>
                  </div>
                  <Button variant="outline">{t.settings.editProfile}</Button>
                </div>
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t.interests?.updateTitle || "Update Your Interests"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.interests?.updateSubtitle || "Manage your learning interests to get better course recommendations"}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {interests.map((interest) => {
                    const isSelected = selectedInterests.has(interest.id);
                    const icon = interestIcons[interest.name] || "📌";
                    return (
                      <button
                        key={interest.id}
                        onClick={() => toggleInterest(interest.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 transition text-center min-h-[80px] flex flex-col items-center justify-center relative",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary"
                        )}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-3 h-3 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <span className="text-2xl mb-1">{icon}</span>
                        <span className="text-xs font-medium leading-tight">{interest.name}</span>
                      </button>
                    );
                  })}
                </div>
                {interestsChanged && (
                  <Button 
                    onClick={handleSaveInterests} 
                    disabled={savingInterests}
                    className="w-full sm:w-auto"
                  >
                    {savingInterests 
                      ? (t.interests?.saving || "Saving...") 
                      : (t.interests?.saveChanges || "Save Changes")}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Accessibility Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  {t.settings.fontSize}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.settings.adjustTextSize}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`p-4 rounded-lg border-2 transition text-center min-h-[80px] flex flex-col items-center justify-center ${
                        fontSize === size.value
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <span
                        style={{
                          fontSize:
                            size.value === "small"
                              ? "0.875rem"
                              : size.value === "medium"
                                ? "1rem"
                                : size.value === "large"
                                  ? "1.125rem"
                                  : "1.25rem",
                        }}
                        className="font-semibold mb-1"
                      >
                        Aa
                      </span>
                      <span className="text-xs">{size.label}</span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5" />
                  ) : (
                    <Sun className="w-5 h-5" />
                  )}
                  {t.settings.darkMode}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.settings.chooseTheme}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {["light", "dark"].map((t_option) => (
                    <button
                      key={t_option}
                      onClick={() => setTheme(t_option as typeof theme)}
                      className={`p-4 rounded-lg border-2 transition text-center min-h-[80px] flex flex-col items-center justify-center ${
                        theme === t_option
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      {t_option === "light" ? (
                        <Sun className="w-6 h-6 mb-2 text-warning" />
                      ) : (
                        <Moon className="w-6 h-6 mb-2 text-primary" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {t_option === "light" ? t.settings.light : t.settings.dark}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t.settings.language}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.settings.selectLanguage}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { code: "en", name: "English" },
                    { code: "ar", name: "العربية" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() =>
                        setLanguage(lang.code as typeof language)
                      }
                      className={`p-4 rounded-lg border-2 transition text-center min-h-[80px] flex flex-col items-center justify-center ${
                        language === lang.code
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary"
                      }`}
                    >
                      <span className="text-sm font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {lang.code.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {t.settings.notifications}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="flex-1">
                      <p className="font-medium text-sm">{t.settings.emailNotifications}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.settings.emailNotificationsDesc}
                      </p>
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="flex-1">
                      <p className="font-medium text-sm">{t.settings.courseAnnouncements}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.settings.courseAnnouncementsDesc}
                      </p>
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Password */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  {t.settings.privacy}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.settings.securityDescription}
                </p>
                <Button variant="outline">{t.settings.changePassword}</Button>
              </CardContent>
            </Card>

            {/* Logout */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-5 h-5" />
                  {t.nav.logout}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {t.settings.logoutDescription}
                </p>
                <Button variant="destructive" onClick={handleLogout}>
                  {t.nav.logout}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Help</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm mb-2">
                    {t.settings.accessibilityFeatures}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.accessibilityDescription}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm mb-2">{t.settings.needHelp}</h4>
                  <p className="text-xs text-muted-foreground">
                    {t.settings.helpDescription}
                  </p>
                </div>
                <Button variant="outline" className="w-full text-sm">
                  {t.settings.visitHelpCenter}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
