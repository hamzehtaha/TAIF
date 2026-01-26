"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { ArrowRight, BookOpen, Users, Zap, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { courseService, Course } from "@/services/courseService";
import { CourseCard } from "@/components/CourseCard";
import { PuzzleLoader } from "@/components/PuzzleLoader";

export default function Index() {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { icon: BookOpen, label: "Web Development", count: "45 Courses" },
    { icon: Users, label: "Personal Development", count: "32 Courses" },
    { icon: Zap, label: "Technology", count: "28 Courses" },
    { icon: Heart, label: "Life Skills", count: "18 Courses" },
  ];

  return (
    <MainLayout>
      <section className="relative py-20 md:py-32 overflow-hidden" style={{ backgroundImage: 'url(/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        {/* Dark overlay for text visibility */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              {t.home.title}
            </h1>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              {t.home.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/courses">
                <Button size="lg" variant="secondary" className="group">
                  {t.home.heroCta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white hover:text-primary"
                >
                  {t.nav.about}
                </Button>
              </Link>
            </div>

            <div className="mt-12">
              <div className="relative max-w-2xl mx-auto">
                <input
                  type="text"
                  placeholder={t.home.searchPlaceholder}
                  className="w-full px-6 py-4 rounded-lg bg-white text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.home.categories}
            </h2>
            <p className="text-lg text-muted-foreground">
              {t.home.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-block p-4 bg-primary/10 rounded-lg mb-4 group-hover:bg-primary/20 transition">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {category.label}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.count}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t.home.featuredCourses}
              </h2>
              <p className="text-lg text-muted-foreground">
                Explore our most popular courses
              </p>
            </div>
            <Link href="/dashboard/courses">
              <Button variant="outline" className="group">
                {t.home.exploreAll}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-full text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                Explore our comprehensive course catalog
              </p>
              <Link href="/dashboard/courses">
                <Button size="lg">
                  Browse All Courses
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to start your learning journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of learners who are transforming their skills with SELS
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                {t.auth.signup.button}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
