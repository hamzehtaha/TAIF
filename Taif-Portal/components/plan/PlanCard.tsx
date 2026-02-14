"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plan } from "@/models/plan.model";
import { Clock, BookOpen, Layers, ArrowRight, Target } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
  isEnrolled?: boolean;
  progress?: number;
  variant?: "default" | "compact";
}

export function PlanCard({ plan, isEnrolled, progress, variant = "default" }: PlanCardProps) {
  const totalCourses = plan.sections.reduce((acc, s) => acc + s.courses.length, 0);
  const totalDuration = Math.floor(plan.duration / 60);

  if (variant === "compact") {
    return (
      <Link href={`/dashboard/plans/${plan.id}`}>
        <Card className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-primary flex-shrink-0" />
                  <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                    {plan.name}
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {plan.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" />
                    {plan.sections.length} sections
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    {totalCourses} courses
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {totalDuration}h
                  </span>
                </div>
              </div>
              {isEnrolled && progress !== undefined && (
                <div className="flex-shrink-0 w-14 h-14 rounded-full border-4 border-primary flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">{progress}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50 h-full flex flex-col">
      {/* Header with gradient */}
      <div className="relative bg-gradient-to-br from-primary/90 to-primary p-6 text-white">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-6 h-6" />
            <Badge variant="secondary" className="bg-white/20 text-white border-0 hover:bg-white/30">
              Learning Path
            </Badge>
          </div>
          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Layers className="w-4 h-4" />
              {plan.sections.length} sections
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              {totalCourses} courses
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {totalDuration} hours
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-6 flex-1 flex flex-col">
        <p className="text-muted-foreground mb-6 line-clamp-3 flex-1">
          {plan.description}
        </p>

        {/* Sections Preview */}
        <div className="space-y-2 mb-6">
          {plan.sections.slice(0, 3).map((section, idx) => (
            <div key={section.id} className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold flex-shrink-0">
                {idx + 1}
              </div>
              <span className="truncate text-muted-foreground">{section.name}</span>
              <span className="text-xs text-muted-foreground/60 flex-shrink-0">
                {section.courses.length} courses
              </span>
            </div>
          ))}
          {plan.sections.length > 3 && (
            <p className="text-xs text-muted-foreground pl-9">
              +{plan.sections.length - 3} more sections
            </p>
          )}
        </div>

        {/* Progress or CTA */}
        {isEnrolled ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-semibold">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <Link href={`/dashboard/plans/${plan.id}`} className="block">
              <Button className="w-full gap-2">
                Continue Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <Link href={`/dashboard/plans/${plan.id}`} className="block">
            <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-white transition-colors">
              View Path
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
