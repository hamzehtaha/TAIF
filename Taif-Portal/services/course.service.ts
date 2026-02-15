import { httpService } from "@/services/http.service";
import { CourseDto, CreateCourseRequest, UpdateCourseRequest } from "@/dtos/course.dto";
import { CategoryDto } from "@/dtos/category.dto";
import { Course } from "@/models/course.model";
import { CourseMapper } from "@/mappers/course.mapper";

class CourseService {
  private serviceBaseUrl = "/api/Course";

  async getCourses(): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(this.serviceBaseUrl);
    return dtos.map(CourseMapper.map);
  }

  async getRecommendedCourses(limit: number = 10): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/recommended?limit=${limit}`);
    return dtos.map(CourseMapper.map);
  }

  async getCourseById(id: string): Promise<Course> {
    const dto = await httpService.get<CourseDto>(`${this.serviceBaseUrl}/${id}`);
    return CourseMapper.map(dto);
  }

  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`${this.serviceBaseUrl}/category/${categoryId}`);
    return dtos.map(CourseMapper.map);
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
    return dtos.map(CourseMapper.map);
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
}

export const courseService = new CourseService();
