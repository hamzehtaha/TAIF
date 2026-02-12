import { httpService } from "@/services/http.service";
import { EnrollRequest, ToggleFavouriteRequest, EnrollmentDto } from "@/dtos/enrollment.dto";
import { CourseDto } from "@/dtos/course.dto";
import { CourseMapper } from "@/mappers/course.mapper";
import { Course } from "@/models/course.model";
import { EnrollmentMapper } from "@/mappers/enrollment.mapper";
import { Enrollment } from "@/models/enrollment.model";

class EnrollmentService {
  private serviceBaseUrl = "/api/enrollments";
  async enroll(courseId: string): Promise<Enrollment> {
    const request: EnrollRequest = { courseId };
    const dto = await httpService.post<EnrollmentDto>(this.serviceBaseUrl, request);
    return EnrollmentMapper.map(dto);
  }

  async getUserCourses(): Promise<Course[]> {
    const courseDtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/user`);
    const courses: Course[] = courseDtos.map(dto => CourseMapper.map(dto));
    return courses;
  }

  async getEnrollmentByCourse(courseId: string): Promise<Enrollment | null> {
    const dto = await httpService.get<EnrollmentDto>(`${this.serviceBaseUrl}/details/${courseId}`);
    return EnrollmentMapper.map(dto);
  }

  async getUserFavouriteCourses(): Promise<CourseDto[]> {
    return httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/favourite/course`);
  }

  async toggleFavourite(courseId: string): Promise<boolean> {
    const request: ToggleFavouriteRequest = { courseId };
    return httpService.put<boolean>(`${this.serviceBaseUrl}/toggleFavourite`, request);
  }

  async isEnrolled(courseId: string): Promise<boolean> {
    try {
      const enrolledCourses = await this.getUserCourses();
      return enrolledCourses.some(course => course.id === courseId);
    } catch {
      return false;
    }
  }

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
