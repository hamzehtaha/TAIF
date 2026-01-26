"use client";

import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "@/hooks/useTranslation";
import { Accessibility, Users, Heart, Star } from "lucide-react";

export default function About() {
  const t = useTranslation();

  const values = [
    {
      icon: Accessibility,
      title: t.about.accessibility,
      description:
        "We ensure our platform is accessible to everyone, with clear designs and easy navigation.",
    },
    {
      icon: Users,
      title: t.about.inclusivity,
      description:
        "We celebrate diversity and create an inclusive environment for all learners.",
    },
    {
      icon: Heart,
      title: t.about.compassion,
      description:
        "We approach learning with empathy and understand each learner's unique needs.",
    },
    {
      icon: Star,
      title: t.about.excellence,
      description:
        "We strive for excellence in everything we do, from content quality to user experience.",
    },
  ];

  return (
    <MainLayout>
      <section className="bg-gradient-to-r from-primary to-accent py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t.about.title}
            </h1>
            <p className="text-xl text-white/90">
              {t.about.company}
            </p>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <div>
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.about.mission}
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Make quality education accessible to everyone</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Support learners with different abilities and needs</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Create a calm and supportive learning environment</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {t.about.vision}
              </p>
              <ul className="mt-6 space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Expand to support all special-needs spectrums</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Build a global community of inclusive learners</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary mt-1">✓</span>
                  <span>Transform education through innovation and compassion</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t.about.values}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="inline-block p-3 bg-primary/10 rounded-lg mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-3">{value.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Choose SELS?
            </h2>

            <div className="space-y-8">
              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white">
                    <Accessibility className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Accessibility-First Design
                  </h3>
                  <p className="text-muted-foreground">
                    Every element is designed with accessibility in mind. High
                    contrast colors, large fonts, and clear navigation ensure everyone
                    can learn comfortably.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white">
                    <Heart className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Calm Learning Environment
                  </h3>
                  <p className="text-muted-foreground">
                    We minimize visual clutter, avoid overwhelming animations, and
                    create a peaceful space where learning happens naturally.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white">
                    <Users className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Inclusive Community
                  </h3>
                  <p className="text-muted-foreground">
                    Join a supportive community of learners with diverse abilities
                    and backgrounds. Everyone&apos;s perspective is valued.
                  </p>
                </div>
              </div>

              <div className="flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-primary text-white">
                    <Star className="h-6 w-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">
                    Quality Content
                  </h3>
                  <p className="text-muted-foreground">
                    Carefully curated and created courses by experienced instructors,
                    designed for different learning styles and abilities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
