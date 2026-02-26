import { httpService } from "@/services/http.service";
import { CourseDto, CreateCourseRequest, UpdateCourseRequest } from "@/dtos/course.dto";
import { CategoryDto } from "@/dtos/category.dto";
import { Course } from "@/models/course.model";
import { CourseMapper } from "@/mappers/course.mapper";

class CourseService {
  private serviceBaseUrl = "/api/Course";

  async getCourses(): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(this.serviceBaseUrl);
    return dtos.map(dto => CourseMapper.map(dto));
  }

  async getRecommendedCourses(limit: number = 10): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/recommended?limit=${limit}`);
    return dtos.map(dto => CourseMapper.map(dto));
  }

  async getCourseById(id: string): Promise<Course> {
    const dto = await httpService.get<CourseDto>(`${this.serviceBaseUrl}/${id}`);
    return CourseMapper.map(dto);
  }

  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/category/${categoryId}`);
    return dtos.map(dto => CourseMapper.map(dto));
  }


  async createCourse(request: CreateCourseRequest): Promise<Course> {
    const dto = await httpService.post<CourseDto>(this.serviceBaseUrl, request);
    return CourseMapper.map(dto);
  }

  async updateCourse(id: string, request: UpdateCourseRequest): Promise<Course> {
    const dto = await httpService.put<CourseDto>(`${this.serviceBaseUrl}/${id}`, request);
    return CourseMapper.map(dto);
  }

  async deleteCourse(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.serviceBaseUrl}/${id}`);
  }

  async getMyCourses(): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/my-courses`);
    return dtos.map(dto => CourseMapper.map(dto));
  }

  async getMyCoursesCount(): Promise<number> {
    return httpService.get<number>(`${this.serviceBaseUrl}/my-courses/count`);
  }

  // TODO::Backend
  async enrichCoursesWithCategories(
    courses: Course[],
    categories: CategoryDto[]
  ): Promise<Course[]> {
    const categoryMap = new Map(categories.map(c => [c.id, c.name]));
    return courses.map(course => ({
      ...course,
      categoryName: categoryMap.get(course.categoryId) || "Unknown",
    }));
  }

  // Course-Lesson Assignment APIs
  async getCourseLessons(courseId: string): Promise<any[]> {
    return httpService.get<any[]>(`/api/content/courses/${courseId}/lessons`);
  }

  async assignLesson(courseId: string, lessonId: string, order?: number): Promise<any> {
    return httpService.post<any>(`/api/content/courses/${courseId}/lessons/${lessonId}`, order ? { newOrder: order } : {});
  }

  async assignLessonToCourse(courseId: string, lessonId: string, order?: number): Promise<any> {
    return this.assignLesson(courseId, lessonId, order);
  }

  async unassignLesson(courseId: string, lessonId: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/content/courses/${courseId}/lessons/${lessonId}`);
  }

  async updateLessonOrder(courseId: string, lessonId: string, newOrder: number): Promise<any> {
    return httpService.put<any>(`/api/content/courses/${courseId}/lessons/${lessonId}/order`, { newOrder });
  }

  async bulkReorderLessons(courseId: string, items: { id: string; order: number }[]): Promise<boolean> {
    return httpService.put<boolean>(`/api/content/courses/${courseId}/lessons/reorder`, { items });
  }

  // Course Status APIs
  async publishCourse(id: string): Promise<Course> {
    const dto = await httpService.post<CourseDto>(`${this.serviceBaseUrl}/${id}/publish`, {});
    return CourseMapper.map(dto);
  }

  async archiveCourse(id: string): Promise<Course> {
    const dto = await httpService.post<CourseDto>(`${this.serviceBaseUrl}/${id}/archive`, {});
    return CourseMapper.map(dto);
  }

  async unpublishCourse(id: string): Promise<Course> {
    const dto = await httpService.post<CourseDto>(`${this.serviceBaseUrl}/${id}/unpublish`, {});
    return CourseMapper.map(dto);
  }

  async updateCourseStatus(id: string, status: number): Promise<Course> {
    const dto = await httpService.patch<CourseDto>(`${this.serviceBaseUrl}/${id}/status`, { status });
    return CourseMapper.map(dto);
  }
}

export const courseService = new CourseService();
