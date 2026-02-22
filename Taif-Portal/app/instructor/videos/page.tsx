"use client";

import { Video, Info } from "lucide-react";
import { InstructorLayout } from "@/components/instructor/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function VideosPage() {
  return (
    <InstructorLayout breadcrumbs={[{ label: "Videos" }]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Videos</h1>
          <p className="text-muted-foreground">
            Manage your video content library
          </p>
        </div>

        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Video Content</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Video content is now managed directly within lesson items. 
              To add video content, create a lesson item of type &quot;Video&quot; in your course lessons.
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
                  Videos are stored as lesson item content. Navigate to a course, 
                  select a lesson, and add a video item to include video content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </InstructorLayout>
  );
}
