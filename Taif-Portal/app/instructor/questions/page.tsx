"use client";

import { HelpCircle, Info } from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function QuestionsPage() {
  return (
    <InstructorLayout breadcrumbs={[{ label: "Questions & Answers" }]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Questions & Answers</h1>
          <p className="text-muted-foreground">
            Create and manage quiz questions
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="h-8 w-8 text-warning" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Quiz Questions</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Quiz questions are now managed directly within lesson items. 
              To add quiz content, create a lesson item of type &quot;Question&quot; in your course lessons.
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
                  Questions are stored as lesson item content. Navigate to a course, 
                  select a lesson, and add a question item to include quiz content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
