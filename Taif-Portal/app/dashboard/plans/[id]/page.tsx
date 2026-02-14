"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/useTranslation";
import { planService, PlanEnrollment } from "@/services/plan.service";
import { Plan, PlanSection, PlanCourse } from "@/models/plan.model";
import { Course } from "@/models/course.model";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Clock,
  BookOpen,
  Layers,
  Target,
  CheckCircle,
  Play,
  Lock,
  Star,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function PlanDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslation();
  const router = useRouter();
  const [planId, setPlanId] = useState<string>("");
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollment, setEnrollment] = useState<PlanEnrollment | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const initParams = async () => {
      const resolvedParams = await params;
      setPlanId(resolvedParams.id);
    };
    initParams();
  }, [params]);

  useEffect(() => {
    if (!planId) return;

    const loadPlanData = async () => {
      try {
        const [planData, enrolled, myPlans] = await Promise.all([
          planService.getPlanById(planId),
          planService.isEnrolledInPlan(planId),
          planService.getMyPlans(),
        ]);

        setPlan(planData);
        setIsEnrolled(enrolled);
        
        if (enrolled) {
          const myEnrollment = myPlans.find(e => e.planId === planId);
          setEnrollment(myEnrollment || null);
        }

        // Expand first section by default
        if (planData?.sections.length) {
          setExpandedSections(new Set([planData.sections[0].id]));
        }
      } catch (err) {
        console.error("Failed to load plan:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPlanData();
  }, [planId]);

  const handleEnroll = async () => {
    if (!plan) return;
    setEnrolling(true);

    try {
      const newEnrollment = await planService.enrollToPlan(plan.id);
      setIsEnrolled(true);
      setEnrollment(newEnrollment);
    } catch (err) {
      console.error("Failed to enroll:", err);
    } finally {
      setEnrolling(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) {
        newSet.delete(sectionId);
      } else {
        newSet.add(sectionId);
      }
      return newSet;
    });
  };

  const totalCourses = plan?.sections.reduce((acc, s) => acc + s.courses.length, 0) || 0;
  const totalDuration = Math.floor((plan?.duration || 0) / 60);

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

  if (!plan) {
    return (
      <ProtectedRoute>
        <MainLayout>
          <div className="container mx-auto px-4 py-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-4">Plan not found</h1>
            <Link href="/dashboard/plans">
              <Button>Back to Plans</Button>
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="min-h-screen">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 text-white">
            <div className="container mx-auto px-4 py-12">
              <Link
                href="/dashboard/plans"
                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Learning Paths
              </Link>

              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="w-8 h-8" />
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      Learning Path
                    </Badge>
                  </div>
                  <h1 className="text-4xl font-bold mb-4">{plan.name}</h1>
                  <p className="text-lg text-white/90 mb-6 max-w-2xl">
                    {plan.description}
                  </p>

                  <div className="flex flex-wrap gap-6 text-white/80">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      <span>{plan.sections.length} Sections</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      <span>{totalCourses} Courses</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      <span>{totalDuration} Hours</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <Card className="bg-white/10 backdrop-blur border-white/20">
                    <CardContent className="p-6">
                      {isEnrolled && enrollment ? (
                        <>
                          <div className="text-center mb-6">
                            <div className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-white flex items-center justify-center">
                              <span className="text-2xl font-bold">{enrollment.progress}%</span>
                            </div>
                            <p className="text-white/80">
                              {enrollment.completedCourses} of {enrollment.totalCourses} courses completed
                            </p>
                          </div>
                          <Button className="w-full bg-white text-primary hover:bg-white/90 gap-2">
                            <Play className="w-4 h-4" />
                            Continue Learning
                          </Button>
                        </>
                      ) : (
                        <>
                          <h3 className="text-xl font-semibold mb-4">Start Your Journey</h3>
                          <p className="text-white/80 mb-6">
                            Enroll in this path to track your progress and unlock all courses.
                          </p>
                          <Button
                            onClick={handleEnroll}
                            disabled={enrolling}
                            className="w-full bg-white text-primary hover:bg-white/90 gap-2"
                          >
                            {enrolling ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enrolling...
                              </>
                            ) : (
                              <>
                                <Target className="w-4 h-4" />
                                Start This Path
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>

          {/* Path Content */}
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-2xl font-bold mb-8">Path Curriculum</h2>

            <div className="space-y-6">
              {plan.sections
                .sort((a, b) => a.order - b.order)
                .map((section, sectionIndex) => {
                  const previousSection = sectionIndex > 0 ? plan.sections[sectionIndex - 1] : null;
                  const previousSectionCompleted = !previousSection || previousSection.courses.every(c => c.isCompleted);
                  const isSectionLocked = isEnrolled && sectionIndex > 0 && !previousSectionCompleted;
                  
                  return (
                    <SectionCard
                      key={section.id}
                      section={section}
                      sectionIndex={sectionIndex}
                      isExpanded={expandedSections.has(section.id)}
                      onToggle={() => toggleSection(section.id)}
                      isEnrolled={isEnrolled}
                      isSectionLocked={isSectionLocked}
                      previousSectionCompleted={previousSectionCompleted}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

interface SectionCardProps {
  section: PlanSection;
  sectionIndex: number;
  isExpanded: boolean;
  onToggle: () => void;
  isEnrolled: boolean;
  isSectionLocked: boolean;
  previousSectionCompleted: boolean;
}

function SectionCard({ section, sectionIndex, isExpanded, onToggle, isEnrolled, isSectionLocked, previousSectionCompleted }: SectionCardProps) {
  const sectionDuration = Math.floor(section.duration / 60);
  const completedCourses = section.courses.filter(c => c.isCompleted).length;
  const allCoursesCompleted = completedCourses === section.courses.length;

  return (
    <Card className={`overflow-hidden ${isSectionLocked ? "opacity-60" : ""}`}>
      <button
        onClick={isSectionLocked ? undefined : onToggle}
        disabled={isSectionLocked}
        className={`w-full p-6 flex items-center gap-4 text-left transition ${isSectionLocked ? "cursor-not-allowed" : "hover:bg-muted/50"}`}
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
          allCoursesCompleted ? "bg-success/20 text-success" : 
          isSectionLocked ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
        }`}>
          {isSectionLocked ? (
            <Lock className="w-5 h-5" />
          ) : allCoursesCompleted ? (
            <CheckCircle className="w-6 h-6" />
          ) : (
            sectionIndex + 1
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg mb-1 flex items-center gap-2">
            {section.name}
            {allCoursesCompleted && (
              <Badge variant="secondary" className="bg-success/10 text-success">Completed</Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {isSectionLocked ? "Complete previous section to unlock" : section.description}
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-shrink-0">
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {completedCourses}/{section.courses.length} courses
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {sectionDuration}h
          </span>
          {!isSectionLocked && (
            <ArrowRight className={`w-5 h-5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          )}
          {isSectionLocked && (
            <Lock className="w-5 h-5 text-muted-foreground" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t bg-muted/30 p-6">
          <div className="grid gap-4">
            {section.courses
              .sort((a, b) => a.order - b.order)
              .map((planCourse, courseIndex) => {
                const previousCourseCompleted = courseIndex === 0 || section.courses[courseIndex - 1]?.isCompleted;
                const isCourseLocked = isSectionLocked || !isEnrolled || (courseIndex > 0 && !previousCourseCompleted);
                
                return (
                  <CourseRow
                    key={planCourse.course.id}
                    planCourse={planCourse}
                    courseIndex={courseIndex}
                    isLocked={isCourseLocked}
                    isSectionLocked={isSectionLocked}
                  />
                );
              })}
          </div>
        </div>
      )}
    </Card>
  );
}

interface CourseRowProps {
  planCourse: PlanCourse;
  courseIndex: number;
  isLocked: boolean;
  isSectionLocked?: boolean;
}

function CourseRow({ planCourse, courseIndex, isLocked, isSectionLocked }: CourseRowProps) {
  const course = planCourse.course;
  
  return (
    <Link
      href={isLocked ? "#" : `/dashboard/courses/${course.id}`}
      onClick={(e) => isLocked && e.preventDefault()}
      className={`flex items-center gap-4 p-4 rounded-lg bg-background border transition ${
        isLocked 
          ? "opacity-60 cursor-not-allowed" 
          : "hover:border-primary hover:shadow-md"
      }`}
    >
      <div className="relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
        {course.imageUrl || course.thumbnail ? (
          <Image
            src={course.imageUrl || course.thumbnail}
            alt={course.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-muted-foreground" />
          </div>
        )}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        {planCourse.isCompleted && !isLocked && (
          <div className="absolute inset-0 bg-success/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium mb-1 truncate flex items-center gap-2">
          {course.title}
          {planCourse.isCompleted && (
            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
          )}
        </h4>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {isLocked && (
            <span className="text-warning flex items-center gap-1">
              <Lock className="w-3 h-3" />
              {isSectionLocked ? "Complete previous section" : "Complete previous course"}
            </span>
          )}
          {!isLocked && course.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {course.rating}
            </span>
          )}
          {!isLocked && course.reviewCount && (
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {course.reviewCount}
            </span>
          )}
          {course.durationInMinutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {Math.floor(course.durationInMinutes / 60)}h {course.durationInMinutes % 60}m
            </span>
          )}
        </div>
      </div>

      {planCourse.isCompleted && (
        <Badge variant="secondary" className="flex-shrink-0 bg-success/10 text-success">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      )}

      {!isLocked && !planCourse.isCompleted && (
        <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
      )}
    </Link>
  );
}
