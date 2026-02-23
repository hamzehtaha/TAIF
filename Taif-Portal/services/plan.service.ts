/**
 * Plan Service - Uses LearningPath API for learning paths/plans
 */

import { Plan, PlanSection, PlanCourse } from "@/models/plan.model";
import { learningPathService } from "@/services/learning-path.service";
import { 
  LearningPath, 
  LearningPathDetails, 
  LearningPathProgress,
  LearningPathSection,
  LearningPathCourse,
  LearningPathSectionProgress,
  LearningPathCourseProgress
} from "@/models/learning-path.model";

export interface PlanEnrollment {
  id: string;
  planId: string;
  plan: Plan;
  enrolledAt: string;
  progress: number;
  completedCourses: number;
  totalCourses: number;
  isCompleted: boolean;
  completedAt?: string;
}

class PlanService {
  async getPlans(): Promise<Plan[]> {
    const learningPaths = await learningPathService.getAll();
    return learningPaths.map(this.mapLearningPathToPlan);
  }

  async getPlanById(id: string): Promise<Plan | null> {
    const details = await learningPathService.getDetails(id);
    if (!details) return null;
    return this.mapLearningPathDetailsToPlan(details);
  }

  async getMyPlans(): Promise<PlanEnrollment[]> {
    const userPaths = await learningPathService.getUserLearningPaths();
    const enrollments: PlanEnrollment[] = [];

    for (const path of userPaths) {
      const progress = await learningPathService.getProgress(path.id);
      if (progress) {
        enrollments.push(this.mapProgressToEnrollment(progress));
      }
    }

    return enrollments;
  }

  async enrollToPlan(planId: string): Promise<PlanEnrollment | null> {
    const result = await learningPathService.enroll(planId);
    if (!result) return null;

    const progress = await learningPathService.getProgress(planId);
    if (!progress) return null;

    return this.mapProgressToEnrollment(progress);
  }

  async isEnrolledInPlan(planId: string): Promise<boolean> {
    const status = await learningPathService.getEnrollmentStatus(planId);
    return status.isEnrolled;
  }

  async getPlanProgress(planId: string): Promise<LearningPathProgress | null> {
    return learningPathService.getProgress(planId);
  }

  private mapLearningPathToPlan(lp: LearningPath): Plan {
    return {
      id: lp.id,
      name: lp.name,
      description: lp.description || "",
      duration: Math.round(lp.durationInSeconds / 60),
      photo: lp.photo,
      totalEnrolled: lp.totalEnrolled,
      totalSections: lp.totalSections,
      totalCourses: lp.totalCourses,
      isEnrolled: lp.isEnrolled,
      sections: [],
    };
  }

  private mapLearningPathDetailsToPlan(details: LearningPathDetails): Plan {
    return {
      id: details.id,
      name: details.name,
      description: details.description || "",
      duration: Math.round(details.durationInSeconds / 60),
      photo: details.photo,
      totalEnrolled: details.totalEnrolled,
      totalSections: details.totalSections,
      totalCourses: details.totalCourses,
      isEnrolled: details.isEnrolled,
      sections: details.sections.map(s => this.mapSectionToPlanSection(s, details.id)),
    };
  }

  private mapSectionToPlanSection(section: LearningPathSection, planId: string): PlanSection {
    return {
      id: section.id,
      name: section.name,
      description: section.description || "",
      duration: section.courses.reduce((sum, c) => sum + Math.round(c.courseDurationInSeconds / 60), 0),
      planId,
      order: section.order,
      courses: section.courses.map(c => this.mapCourseToPlanCourse(c)),
    };
  }

  private mapCourseToPlanCourse(course: LearningPathCourse): PlanCourse {
    return {
      course: {
        id: course.courseId,
        title: course.courseName,
        description: course.courseDescription || "",
        imageUrl: course.coursePhoto,
        thumbnail: course.coursePhoto,
        categoryId: "",
        durationInMinutes: Math.round(course.courseDurationInSeconds / 60),
        isEnrolled: false,
        isFavourite: false,
      },
      order: course.order,
      isRequired: course.isRequired,
      isCompleted: false,
    };
  }

  private mapProgressToEnrollment(progress: LearningPathProgress): PlanEnrollment {
    const totalCourses = progress.sections.reduce((sum, s) => sum + s.courses.length, 0);
    const completedCourses = progress.sections.reduce((sum, s) => 
      sum + s.courses.filter(c => c.isEnrolled).length, 0);
    
    const progressPercent = learningPathService.calculateProgressPercent(
      progress.completedDuration, 
      progress.durationInSeconds
    );

    return {
      id: progress.id,
      planId: progress.id,
      plan: this.mapProgressToPlan(progress),
      enrolledAt: progress.enrolledAt,
      progress: progressPercent,
      completedCourses,
      totalCourses,
      isCompleted: progress.isCompleted,
      completedAt: progress.completedAt,
    };
  }

  private mapProgressToPlan(progress: LearningPathProgress): Plan {
    return {
      id: progress.id,
      name: progress.name,
      description: progress.description || "",
      duration: Math.round(progress.durationInSeconds / 60),
      photo: progress.photo,
      isEnrolled: true,
      sections: progress.sections.map(s => this.mapProgressSectionToPlanSection(s, progress.id)),
    };
  }

  private mapProgressSectionToPlanSection(section: LearningPathSectionProgress, planId: string): PlanSection {
    return {
      id: section.id,
      name: section.name,
      description: section.description || "",
      duration: section.courses.reduce((sum, c) => sum + Math.round(c.courseDurationInSeconds / 60), 0),
      planId,
      order: section.order,
      isCurrentSection: section.isCurrentSection,
      courses: section.courses.map(c => this.mapProgressCourseToPlanCourse(c)),
    };
  }

  private mapProgressCourseToPlanCourse(course: LearningPathCourseProgress): PlanCourse {
    return {
      course: {
        id: course.courseId,
        title: course.courseName,
        description: course.courseDescription || "",
        imageUrl: course.coursePhoto,
        thumbnail: course.coursePhoto,
        categoryId: "",
        durationInMinutes: Math.round(course.courseDurationInSeconds / 60),
        isEnrolled: course.isEnrolled,
        isFavourite: false,
      },
      order: course.order,
      isRequired: course.isRequired,
      isCompleted: course.isEnrolled,
      isCurrentCourse: course.isCurrentCourse,
    };
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
}

export const planService = new PlanService();
