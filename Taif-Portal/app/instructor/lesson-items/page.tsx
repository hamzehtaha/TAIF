"use client";

import { Layers, Info } from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LessonItemsPage() {
  return (
    <InstructorLayout breadcrumbs={[{ label: "Lesson Items" }]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lesson Items</h1>
          <p className="text-muted-foreground">
            Manage lesson content items
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Lesson Items</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Lesson items are managed within their respective courses and lessons.
              Navigate to a course to create and manage lesson content.
            </p>
            <div className="flex justify-center gap-4">
              <Button asChild>
                <Link href="/instructor/courses">
                  Go to Courses
                </Link>
              </Button>
            </div>
            <div className="mt-6 p-4 bg-muted/50 rounded-lg max-w-md mx-auto">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <p className="text-left">
                  Select a course, then a lesson, to add videos, text content, or quiz questions
                  as lesson items.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
