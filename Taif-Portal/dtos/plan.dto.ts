import { CourseDto } from "@/dtos/course.dto";

export interface PlanDto {
  id: string;
  name: string;
  description: string;
  duration: number;
  sections: PlanSectionDto[];
}

export interface PlanSectionDto {
  id: string;
  name: string;
  description: string;
  duration: number;
  planId: string;
  order: number;
  courses: PlanCourseDto[];
}

export interface PlanCourseDto {
  course: CourseDto;
  order: number;
  isCompleted?: boolean;
}
