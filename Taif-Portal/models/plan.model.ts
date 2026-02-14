import { Course } from "@/models/course.model";

export interface Plan {
  id: string;
  name: string;
  description: string;
  duration: number;
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
}

export interface PlanCourse {
  course: Course;
  order: number;
  isCompleted?: boolean;
  isLocked?: boolean;
}
