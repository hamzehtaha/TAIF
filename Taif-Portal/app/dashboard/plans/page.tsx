"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { useTranslation } from "@/hooks/useTranslation";
import { planService, PlanEnrollment } from "@/services/plan.service";
import { Plan } from "@/models/plan.model";
import { PlanCard } from "@/components/plan/PlanCard";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Target, Search, Loader2, BookOpen, Sparkles } from "lucide-react";

export default function PlansPage() {
  const t = useTranslation();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<PlanEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [allPlans, enrollments] = await Promise.all([
          planService.getPlans(),
          planService.getMyPlans(),
        ]);
        setPlans(allPlans);
        setMyEnrollments(enrollments);
      } catch (err) {
        console.error("Failed to load plans:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const enrolledPlanIds = new Set(myEnrollments.map(e => e.planId));

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    plan.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEnrollmentForPlan = (planId: string) => {
    return myEnrollments.find(e => e.planId === planId);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Learning Paths</h1>
                <p className="text-muted-foreground">
                  Structured learning journeys to master new skills
                </p>
              </div>
            </div>
          </div>

          {/* Search and Tabs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <BookOpen className="w-4 h-4" />
                All Paths
              </TabsTrigger>
              <TabsTrigger value="my" className="gap-2">
                <Sparkles className="w-4 h-4" />
                My Paths
                {myEnrollments.length > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                    {myEnrollments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {filteredPlans.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlans.map(plan => {
                    const enrollment = getEnrollmentForPlan(plan.id);
                    return (
                      <PlanCard
                        key={plan.id}
                        plan={plan}
                        isEnrolled={enrolledPlanIds.has(plan.id)}
                        progress={enrollment?.progress}
                        isCompleted={enrollment?.isCompleted}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No paths found</h3>
                  <p className="text-muted-foreground">
                    {searchQuery 
                      ? "Try adjusting your search terms" 
                      : "No learning paths available yet"}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my">
              {myEnrollments.length > 0 ? (
                <div className="space-y-8">
                  {/* In Progress */}
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      In Progress
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myEnrollments
                        .filter(e => e.progress < 100 && !e.isCompleted)
                        .map(enrollment => (
                          <PlanCard
                            key={enrollment.id}
                            plan={enrollment.plan}
                            isEnrolled={true}
                            progress={enrollment.progress}
                            isCompleted={enrollment.isCompleted}
                          />
                        ))}
                    </div>
                  </div>

                  {/* Completed */}
                  {myEnrollments.some(e => e.progress === 100 || e.isCompleted) && (
                    <div>
                      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5 text-success" />
                        Completed
                      </h2>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myEnrollments
                          .filter(e => e.progress === 100 || e.isCompleted)
                          .map(enrollment => (
                            <PlanCard
                              key={enrollment.id}
                              plan={enrollment.plan}
                              isEnrolled={true}
                              progress={enrollment.progress}
                              isCompleted={true}
                            />
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No enrolled paths</h3>
                  <p className="text-muted-foreground mb-6">
                    Start a learning path to track your progress
                  </p>
                  <button
                    onClick={() => setActiveTab("all")}
                    className="text-primary hover:underline"
                  >
                    Browse all paths →
                  </button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
