"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { interestService } from "@/services/interest.service";
import { PuzzleLoader } from "@/components/PuzzleLoader";
import { Check, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Interest } from "@/models/interest.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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

export default function InterestsPage() {
  const t = useTranslation();
  const router = useRouter();
  const [interests, setInterests] = useState<Interest[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInterests = async () => {
      try {
        // Load all interests and user's selected interests in parallel
        const [allInterests, userInterests] = await Promise.all([
          interestService.getAllInterests(),
          interestService.getUserInterests().catch(() => [])
        ]);
        setInterests(allInterests);

        // Pre-select user's existing interests
        if (userInterests.length > 0) {
          const userInterestIds = new Set(userInterests.map(i => i.id));
          setSelectedInterests(userInterestIds);
        }
      } catch (err) {
        console.error("Failed to load interests:", err);
        setError("Failed to load interests");
      } finally {
        setLoading(false);
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
  };

  const handleContinue = async () => {
    if (selectedInterests.size === 0) return;

    setSaving(true);
    try {
      await interestService.updateUserInterests(Array.from(selectedInterests));
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save interests:", err);
      setError("Failed to save interests");
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return <PuzzleLoader />;
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold mb-4">{t.interests?.title || "What are you interested in?"}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t.interests?.subtitle || "Select topics you'd like to learn about. This helps us recommend courses for you."}
              </p>
            </div>

            {/* Interests Grid */}
            {interests.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {interests.map((interest) => {
                  const isSelected = selectedInterests.has(interest.id);
                  const icon = interestIcons[interest.name] || "📌";

                  return (
                    <Card
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-transparent hover:border-primary/30"
                      )}
                    >
                      <CardContent className="p-6 text-center relative">
                        {isSelected && (
                          <div className="absolute top-3 right-3">
                            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="w-4 h-4 text-primary-foreground" />
                            </div>
                          </div>
                        )}
                        <div className="text-4xl mb-3">{icon}</div>
                        <h3 className="font-semibold text-sm leading-tight">{interest.name}</h3>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="mb-8">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">{t.interests?.noInterests || "No interests available"}</p>
                </CardContent>
              </Card>
            )}

            {/* Selection Counter */}
            {selectedInterests.size > 0 && (
              <div className="text-center mb-6">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary font-medium">
                  {selectedInterests.size} {t.interests?.selected || "selected"}
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="text-center mb-6">
                <p className="text-destructive">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground hover:text-foreground"
              >
                {t.interests?.skip || "Skip for now"}
              </Button>
              <Button
                onClick={handleContinue}
                disabled={selectedInterests.size === 0 || saving}
                className="min-w-[200px] gap-2"
                size="lg"
              >
                {saving ? (
                  t.interests?.saving || "Saving..."
                ) : (
                  <>
                    {t.interests?.continue || "Continue"}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Hint */}
            {selectedInterests.size === 0 && (
              <p className="text-center text-sm text-muted-foreground mt-6">
                {t.interests?.selectAtLeast || "Select at least one interest to continue"}
              </p>
            )}
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
