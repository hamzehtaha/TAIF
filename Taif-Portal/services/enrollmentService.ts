import { httpService } from "./httpService";
import { EnrollRequest, EnrollmentDto, EnrollmentDetailsResponse, ToggleFavouriteRequest } from "@/dtos/enrollment/EnrollmentDto";
import { CourseDto } from "@/dtos/course/CourseDto";

export interface EnrollmentWithCourse {
  enrollment: EnrollmentDto;
  course: CourseDto;
}

class EnrollmentService {
  /**
   * Enroll in a course
   * POST /api/enrollments
   */
  async enroll(courseId: string): Promise<EnrollmentDto> {
    const request: EnrollRequest = { courseId };
    return httpService.post<EnrollmentDto>("/api/enrollments", request);
  }

  /**
   * Get user's enrolled courses
   * GET /api/enrollments/user
   */
  async getUserCourses(): Promise<CourseDto[]> {
    return httpService.get<CourseDto[]>("/api/enrollments/user");
  }

  /**
   * Get enrollment for a specific course
   * GET /api/enrollments/details/{courseId}
   */
  async getEnrollmentByCourse(courseId: string): Promise<EnrollmentDto | null> {
    return httpService.get<EnrollmentDto>(`/api/enrollments/details/${courseId}`);
  }

  /**
   * Get enrollment details with progress for a specific course
   * GET /api/enrollments/details-with-progress/{courseId}
   */
  async getEnrollmentWithProgress(courseId: string): Promise<EnrollmentDetailsResponse | null> {
    return httpService.get<EnrollmentDetailsResponse>(`/api/enrollments/details-with-progress/${courseId}`);
  }

  /**
   * Get user's favorite courses
   * GET /api/enrollments/favourite/course
   */
  async getUserFavouriteCourses(): Promise<CourseDto[]> {
    return httpService.get<CourseDto[]>("/api/enrollments/favourite/course");
  }

  /**
   * Toggle course favourite status
   * PUT /api/enrollments/toggleFavourite
   */
  async toggleFavourite(courseId: string): Promise<boolean> {
    const request: ToggleFavouriteRequest = { courseId };
    return httpService.put<boolean>("/api/enrollments/toggleFavourite", request);
  }

  /**
   * Check if user is enrolled in a specific course
   */
  async isEnrolled(courseId: string): Promise<boolean> {
    try {
      const enrolledCourses = await this.getUserCourses();
      return enrolledCourses.some(course => course.id === courseId);
    } catch {
      return false;
    }
  }

  /**
   * Check if a course is in user's favorites
   */
  async isFavourite(courseId: string): Promise<boolean> {
    try {
      const favourites = await this.getUserFavouriteCourses();
      return favourites.some(course => course.id === courseId);
    } catch {
      return false;
    }
  }
}

export const enrollmentService = new EnrollmentService();
