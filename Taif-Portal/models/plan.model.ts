import { Course } from "@/models/course.model";

export interface Plan {
  id: string;
  name: string;
  description: string;
  duration: number;
  photo?: string;
  totalEnrolled?: number;
  totalSections?: number;
  totalCourses?: number;
  isEnrolled?: boolean;
  sections: PlanSection[];
}

export interface PlanSection {
  id: string;
  name: string;
  description: string;
  duration: number;
  planId: string;
  order: number;
  courses: PlanCourse[];
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrentSection?: boolean;
}

export interface PlanCourse {
  course: Course;
  order: number;
  isRequired?: boolean;
  isCompleted?: boolean;
  isLocked?: boolean;
  isCurrentCourse?: boolean;
}
