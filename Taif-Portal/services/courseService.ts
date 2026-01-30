import { httpService } from "./httpService";
import { CourseDto, CreateCourseRequest, UpdateCourseRequest } from "@/dtos/course/CourseDto";
import { CategoryDto } from "@/dtos/category/CategoryDto";

export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isCompleted?: boolean;
  photo?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
  isEnrolled?: boolean;
  isFavourite?: boolean;
  lessons?: Lesson[];
}

class CourseService {
  /**
   * Get all courses
   * GET /api/Course
   */
  async getCourses(): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>("/api/Course");
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Get a specific course by ID
   * GET /api/Course/{id}
   */
  async getCourseById(id: string): Promise<Course> {
    const dto = await httpService.get<CourseDto>(`/api/Course/${id}`);
    return this.mapDtoToModel(dto);
  }

  /**
   * Get courses by category ID
   * GET /api/Course/category/{categoryId}
   */
  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    const dtos = await httpService.get<CourseDto[]>(`/api/Course/category/${categoryId}`);
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Create a new course
   * POST /api/Course
   */
  async createCourse(request: CreateCourseRequest): Promise<Course> {
    const dto = await httpService.post<CourseDto>("/api/Course", request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Update an existing course
   * PUT /api/Course/{id}
   */
  async updateCourse(id: string, request: UpdateCourseRequest): Promise<Course> {
    const dto = await httpService.put<CourseDto>(`/api/Course/${id}`, request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Delete a course
   * DELETE /api/Course/{id}
   */
  async deleteCourse(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Course/${id}`);
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: CourseDto): Course {
    return {
      id: dto.id,
      title: dto.name,
      description: dto.description || "",
      thumbnail: dto.photo || "/placeholder-course.jpg",
      imageUrl: dto.photo || "/placeholder-course.jpg",
      categoryId: dto.categoryId,
      isEnrolled: false,
      isFavourite: false,
      lessons: [],
    };
  }

  /**
   * Enrich courses with category names
   */
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
