"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/hooks/useLanguage";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Heart, Folder } from "lucide-react";
import { useState, useEffect } from "react";
import { courseService, Course } from "@/services/courseService";
import { categoryService, Category } from "@/services/categoryService";
import { enrollmentService } from "@/services/enrollmentService";
import { authService } from "@/services/authService";
import { CourseCard } from "@/components/CourseCard";

export default function Index() {
  const t = useTranslation();
  const router = useRouter();
  const { isRTL } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [favouriteCourses, setFavouriteCourses] = useState<Course[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingFavourites, setLoadingFavourites] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // Load categories from API
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    // Load favourite courses if authenticated
    if (!isAuthenticated) {
      setLoadingFavourites(false);
      return;
    }

    const loadFavourites = async () => {
      try {
        const courseDtos = await enrollmentService.getUserFavouriteCourses();
        const courses: Course[] = courseDtos.map(dto => ({
          id: dto.id,
          title: dto.name,
          description: dto.description || "",
          thumbnail: dto.photo || "/placeholder-course.jpg",
          imageUrl: dto.photo || "/placeholder-course.jpg",
          categoryId: dto.categoryId,
          isEnrolled: true,
          isFavourite: true,
        }));
        setFavouriteCourses(courses);
      } catch (err) {
        console.error("Failed to load favourite courses:", err);
      } finally {
        setLoadingFavourites(false);
      }
    };

    loadFavourites();
  }, [isAuthenticated]);

  useEffect(() => {
    // Load featured courses from API
    const loadFeaturedCourses = async () => {
      try {
        const courses = await courseService.getCourses();
        setFeaturedCourses(courses.slice(0, 6)); // Show first 6 courses
      } catch (err) {
        console.error("Failed to load featured courses:", err);
      } finally {
        setLoadingFeatured(false);
      }
    };

    loadFeaturedCourses();
  }, []);

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/dashboard/courses?category=${categoryId}`);
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden" style={{ backgroundImage: 'url(/home-background.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
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

      {/* Categories Section - From Backend */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.home.categories}
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse courses by category
            </p>
          </div>

          {loadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="inline-block p-4 bg-primary/10 rounded-lg mb-4 group-hover:bg-primary/20 transition">
                      <Folder className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {category.name}
                    </h3>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No categories available</p>
            </div>
          )}
        </div>
      </section>

      {/* Favourite Courses Section - Only for authenticated users */}
      {isAuthenticated && (
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                  <h2 className="text-3xl md:text-4xl font-bold">
                    Your Favorite Courses
                  </h2>
                </div>
                <p className="text-lg text-muted-foreground">
                  Quick access to your saved courses
                </p>
              </div>
              <Link href="/dashboard/courses">
                <Button variant="outline" className="group">
                  {t.home.exploreAll}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition" />
                </Button>
              </Link>
            </div>

            {loadingFavourites ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : favouriteCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favouriteCourses.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-12 text-center">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Favorites Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Add courses to your favorites for quick access
                  </p>
                  <Link href="/dashboard/courses">
                    <Button>Browse Courses</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Featured Courses Section */}
      <section className={`py-20 ${isAuthenticated ? '' : 'bg-muted/30'}`}>
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

          {loadingFeatured ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : featuredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
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
          )}
        </div>
      </section>

      {/* CTA Section */}
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
