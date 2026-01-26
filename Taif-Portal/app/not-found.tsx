"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/useTranslation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const t = useTranslation();

  return (
    <MainLayout>
      <section className="min-h-[60vh] flex items-center justify-center py-12 px-4">
        <div className="text-center max-w-md">
          <div className="inline-block p-6 bg-destructive/10 rounded-full mb-6">
            <AlertCircle className="w-16 h-16 text-destructive" />
          </div>

          <h1 className="text-5xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">{t.notFound.title}</h2>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            {t.notFound.description}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="min-h-[48px]">
                {t.nav.home}
              </Button>
            </Link>
            <Link href="/dashboard/courses">
              <Button variant="outline" className="min-h-[48px]">
                {t.courses.allCourses}
              </Button>
            </Link>
          </div>

          <p className="text-sm text-muted-foreground mt-8">
            Need help? <a href="#" className="text-primary hover:underline">Contact support</a>
          </p>
        </div>
      </section>
    </MainLayout>
  );
}
