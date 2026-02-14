import { Plan, PlanSection } from "@/models/plan.model";
import { Course } from "@/models/course.model";

export interface PlanEnrollment {
  id: string;
  planId: string;
  plan: Plan;
  enrolledAt: string;
  progress: number;
  completedCourses: number;
  totalCourses: number;
}

const mockCourses: Course[] = [
  {
    id: "c1",
    title: "Introduction to Sign Language",
    description: "Learn the basics of sign language communication",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
    categoryId: "cat1",
    categoryName: "Sign Language",
    rating: 4.8,
    reviewCount: 245,
    durationInMinutes: 120,
    isEnrolled: false,
    isFavourite: false,
  },
  {
    id: "c2",
    title: "Advanced Sign Language Conversations",
    description: "Master complex conversations and expressions",
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
    categoryId: "cat1",
    categoryName: "Sign Language",
    rating: 4.9,
    reviewCount: 189,
    durationInMinutes: 180,
    isEnrolled: false,
    isFavourite: false,
  },
  {
    id: "c3",
    title: "Sign Language in Education",
    description: "Teaching techniques for deaf education",
    thumbnail: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    imageUrl: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800",
    categoryId: "cat2",
    categoryName: "Education",
    rating: 4.7,
    reviewCount: 156,
    durationInMinutes: 150,
    isEnrolled: false,
    isFavourite: false,
  },
  {
    id: "c4",
    title: "Communication Strategies",
    description: "Effective communication methods for inclusive environments",
    thumbnail: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    imageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800",
    categoryId: "cat3",
    categoryName: "Communication",
    rating: 4.6,
    reviewCount: 98,
    durationInMinutes: 90,
    isEnrolled: false,
    isFavourite: false,
  },
  {
    id: "c5",
    title: "Deaf Culture and History",
    description: "Understanding deaf community and heritage",
    thumbnail: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800",
    categoryId: "cat4",
    categoryName: "Culture",
    rating: 4.9,
    reviewCount: 312,
    durationInMinutes: 200,
    isEnrolled: false,
    isFavourite: false,
  },
  {
    id: "c6",
    title: "Professional Sign Language Interpretation",
    description: "Become a certified sign language interpreter",
    thumbnail: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800",
    imageUrl: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=800",
    categoryId: "cat1",
    categoryName: "Sign Language",
    rating: 4.8,
    reviewCount: 267,
    durationInMinutes: 300,
    isEnrolled: false,
    isFavourite: false,
  },
];

const mockPlans: Plan[] = [
  {
    id: "plan1",
    name: "Sign Language Mastery Path",
    description: "A comprehensive journey from beginner to advanced sign language proficiency. Perfect for educators, caregivers, and anyone passionate about inclusive communication.",
    duration: 720,
    sections: [
      {
        id: "s1",
        name: "Foundation",
        description: "Build your sign language foundation with essential vocabulary and grammar",
        duration: 120,
        planId: "plan1",
        order: 0,
        courses: [{ course: mockCourses[0], order: 0, isCompleted: true }],
      },
      {
        id: "s2",
        name: "Intermediate Skills",
        description: "Develop conversational fluency and cultural understanding",
        duration: 330,
        planId: "plan1",
        order: 1,
        courses: [
          { course: mockCourses[1], order: 0, isCompleted: true },
          { course: mockCourses[4], order: 1, isCompleted: false },
        ],
      },
      {
        id: "s3",
        name: "Professional Application",
        description: "Apply your skills in professional and educational settings",
        duration: 270,
        planId: "plan1",
        order: 2,
        courses: [
          { course: mockCourses[2], order: 0, isCompleted: false },
          { course: mockCourses[5], order: 1, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "plan2",
    name: "Deaf Education Specialist",
    description: "Prepare to become an effective educator in deaf and hard-of-hearing communities. Learn teaching methodologies, communication strategies, and inclusive practices.",
    duration: 540,
    sections: [
      {
        id: "s4",
        name: "Understanding the Community",
        description: "Deep dive into deaf culture, history, and communication needs",
        duration: 200,
        planId: "plan2",
        order: 0,
        courses: [{ course: mockCourses[4], order: 0, isCompleted: false }],
      },
      {
        id: "s5",
        name: "Communication Fundamentals",
        description: "Master essential sign language and communication techniques",
        duration: 210,
        planId: "plan2",
        order: 1,
        courses: [
          { course: mockCourses[0], order: 0, isCompleted: false },
          { course: mockCourses[3], order: 1, isCompleted: false },
        ],
      },
      {
        id: "s6",
        name: "Teaching Excellence",
        description: "Develop specialized teaching skills for deaf education",
        duration: 150,
        planId: "plan2",
        order: 2,
        courses: [{ course: mockCourses[2], order: 0, isCompleted: false }],
      },
    ],
  },
  {
    id: "plan3",
    name: "Inclusive Communication Expert",
    description: "Become an expert in creating inclusive environments. Perfect for HR professionals, team leaders, and community organizers.",
    duration: 360,
    sections: [
      {
        id: "s7",
        name: "Core Skills",
        description: "Essential sign language and communication fundamentals",
        duration: 120,
        planId: "plan3",
        order: 0,
        courses: [{ course: mockCourses[0], order: 0, isCompleted: false }],
      },
      {
        id: "s8",
        name: "Strategy & Implementation",
        description: "Learn strategies for inclusive workplace and community settings",
        duration: 90,
        planId: "plan3",
        order: 1,
        courses: [{ course: mockCourses[3], order: 0, isCompleted: false }],
      },
      {
        id: "s9",
        name: "Cultural Competency",
        description: "Develop deep understanding of deaf culture and best practices",
        duration: 200,
        planId: "plan3",
        order: 2,
        courses: [{ course: mockCourses[4], order: 0, isCompleted: false }],
      },
    ],
  },
];

const mockEnrollments: PlanEnrollment[] = [
  {
    id: "pe1",
    planId: "plan1",
    plan: mockPlans[0],
    enrolledAt: "2024-01-15T10:00:00Z",
    progress: 35,
    completedCourses: 2,
    totalCourses: 5,
  },
];

class PlanService {
  async getPlans(): Promise<Plan[]> {
    await this.simulateDelay();
    return mockPlans;
  }

  async getPlanById(id: string): Promise<Plan | null> {
    await this.simulateDelay();
    return mockPlans.find(p => p.id === id) || null;
  }

  async getMyPlans(): Promise<PlanEnrollment[]> {
    await this.simulateDelay();
    return mockEnrollments;
  }

  async enrollToPlan(planId: string): Promise<PlanEnrollment> {
    await this.simulateDelay();
    const plan = mockPlans.find(p => p.id === planId);
    if (!plan) throw new Error("Plan not found");

    const totalCourses = plan.sections.reduce((acc, s) => acc + s.courses.length, 0);
    
    const enrollment: PlanEnrollment = {
      id: `pe-${Date.now()}`,
      planId,
      plan,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      completedCourses: 0,
      totalCourses,
    };

    mockEnrollments.push(enrollment);
    return enrollment;
  }

  async isEnrolledInPlan(planId: string): Promise<boolean> {
    await this.simulateDelay();
    return mockEnrollments.some(e => e.planId === planId);
  }

  async unenrollFromPlan(planId: string): Promise<void> {
    await this.simulateDelay();
    const index = mockEnrollments.findIndex(e => e.planId === planId);
    if (index > -1) {
      mockEnrollments.splice(index, 1);
    }
  }

  private simulateDelay(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}

export const planService = new PlanService();
