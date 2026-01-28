import { httpService } from "./httpService";
import { DataProvider } from "@/lib/dataProvider";
import { CourseDto, CreateCourseRequest, UpdateCourseRequest } from "@/dtos/course/CourseDto";
import { CourseMapper } from "@/mappers/courseMapper";

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: string;
  thumbnail: string;
  imageUrl?: string;
  enrolledStudents: number;
  rating: number;
  price: number;
  category: string;
  difficulty?: string;
  reviewCount?: number;
  enrollmentCount?: number;
  isEnrolled?: boolean;
  progress?: number;
  totalLessons?: number;
  completedLessons?: number;
  lessons?: Array<{ 
    id: string; 
    title: string; 
    duration: string; 
    order: number;
    description?: string;
    isCompleted?: boolean;
  }>;
}

export interface CourseProgress {
  courseId: string;
  progress: number;
  completedLessons: string[];
  lastAccessedAt: string;
}

class CourseService {
  /**
   * Get all courses
   */
  async getCourses(filter?: {
    category?: string;
    search?: string;
  }): Promise<Course[]> {
    // Get DTOs from backend or mock
    const dtos = await DataProvider.get<CourseDto[]>(
      '/courses',
      () => httpService.get<CourseDto[]>('/api/Course')
    );
    
    // Map DTOs to UI models
    let courses = CourseMapper.toUiModelList(dtos);
    
    // Apply filters
    if (filter?.category) {
      courses = courses.filter((c) => c.category === filter.category);
    }
    if (filter?.search) {
      const search = filter.search.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(search) ||
          c.description.toLowerCase().includes(search)
      );
    }

    return courses;
  }

  /**
   * Get a specific course by ID
   */
  async getCourseById(id: string): Promise<Course> {
    const dto = await DataProvider.get<CourseDto>(
      `/courses/${id}`,
      () => httpService.get<CourseDto>(`/api/Course/${id}`)
    );
    return CourseMapper.toUiModel(dto);
  }

  /**
   * Get courses by category ID
   */
  async getCoursesByCategory(categoryId: string): Promise<Course[]> {
    const dtos = await DataProvider.get<CourseDto[]>(
      `/courses/category/${categoryId}`,
      () => httpService.get<CourseDto[]>(`/api/Course/category/${categoryId}`)
    );
    return CourseMapper.toUiModelList(dtos);
  }

  /**
   * Create a new course
   */
  async createCourse(request: CreateCourseRequest): Promise<Course> {
    const dto = await DataProvider.post<CourseDto>(
      '/courses',
      request,
      () => httpService.post<CourseDto>('/api/Course', request)
    );
    return CourseMapper.toUiModel(dto);
  }

  /**
   * Update an existing course
   */
  async updateCourse(id: string, request: UpdateCourseRequest): Promise<Course> {
    const dto = await DataProvider.put<CourseDto>(
      `/courses/${id}`,
      request,
      () => httpService.put<CourseDto>(`/api/Course/${id}`, request)
    );
    return CourseMapper.toUiModel(dto);
  }

  /**
   * Delete a course
   */
  async deleteCourse(id: string): Promise<boolean> {
    return DataProvider.delete<boolean>(
      `/courses/${id}`,
      () => httpService.delete<boolean>(`/api/Course/${id}`)
    );
  }

  async enrollInCourse(courseId: string): Promise<{ success: boolean }> {
    return DataProvider.post<{ success: boolean }>(
      `/courses/${courseId}/enroll`,
      {},
      () => httpService.post<{ success: boolean }>(
        `/api/courses/${courseId}/enroll`,
        {}
      )
    );
  }

  async getCourseProgress(courseId: string): Promise<CourseProgress> {
    return DataProvider.get<CourseProgress>(
      `/courses/${courseId}/progress`,
      () => httpService.get<CourseProgress>(`/api/courses/${courseId}/progress`)
    );
  }

  async updateLessonProgress(
    courseId: string,
    lessonId: string
  ): Promise<{ success: boolean }> {
    return DataProvider.post<{ success: boolean }>(
      `/courses/${courseId}/lessons/${lessonId}/complete`,
      {},
      () => httpService.post<{ success: boolean }>(
        `/api/courses/${courseId}/lessons/${lessonId}/complete`,
        {}
      )
    );
  }

  async rateCourse(
    courseId: string,
    rating: number,
    review?: string
  ): Promise<{ success: boolean }> {
    return DataProvider.post<{ success: boolean }>(
      `/courses/${courseId}/rate`,
      { rating, review },
      () => httpService.post<{ success: boolean }>(
        `/api/courses/${courseId}/rate`,
        { rating, review }
      )
    );
  }

  async getEnrolledCourses(): Promise<Course[]> {
    const dtos = await DataProvider.get<CourseDto[]>(
      '/courses/enrolled',
      () => httpService.get<CourseDto[]>('/api/courses/enrolled')
    );
    return CourseMapper.toUiModelList(dtos).map(course => ({
      ...course,
      isEnrolled: true,
      progress: Math.floor(Math.random() * 100), // Mock progress for now
    }));
  }
}

export const courseService = new CourseService();
