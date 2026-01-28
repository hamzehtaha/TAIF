import { httpService } from "./httpService";
import { DataProvider } from "@/lib/dataProvider";
import { LessonDto, CreateLessonRequest, UpdateLessonRequest } from "@/dtos/lesson/LessonDto";
import { LessonMapper } from "@/mappers/lessonMapper";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  videoUrl?: string;
  totalItems: number;
}

class LessonService {
  /**
   * Get all lessons for a specific course
   */
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const dtos = await DataProvider.get<LessonDto[]>(
      `/lessons/course/${courseId}`,
      () => httpService.get<LessonDto[]>(`/api/Lesson/course/${courseId}`)
    );
    return LessonMapper.toUiModelList(dtos, courseId);
  }

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    const dto = await DataProvider.get<LessonDto>(
      `/lessons/${lessonId}`,
      () => httpService.get<LessonDto>(`/api/Lesson/${lessonId}`)
    );
    return LessonMapper.toUiModel(dto);
  }

  /**
   * Create a new lesson
   */
  async createLesson(request: CreateLessonRequest): Promise<Lesson> {
    const dto = await DataProvider.post<LessonDto>(
      '/lessons',
      request,
      () => httpService.post<LessonDto>('/api/Lesson', request)
    );
    return LessonMapper.toUiModel(dto);
  }

  /**
   * Update an existing lesson
   */
  async updateLesson(id: string, request: UpdateLessonRequest): Promise<Lesson> {
    const dto = await DataProvider.put<LessonDto>(
      `/lessons/${id}`,
      request,
      () => httpService.put<LessonDto>(`/api/Lesson/${id}`, request)
    );
    return LessonMapper.toUiModel(dto);
  }

  /**
   * Delete a lesson
   */
  async deleteLesson(id: string): Promise<boolean> {
    return DataProvider.delete<boolean>(
      `/lessons/${id}`,
      () => httpService.delete<boolean>(`/api/Lesson/${id}`)
    );
  }

  /**
   * Mark lesson as completed
   */
  async markLessonComplete(courseId: string, lessonId: string): Promise<{ success: boolean }> {
    return DataProvider.post<{ success: boolean }>(
      `/courses/${courseId}/lessons/${lessonId}/complete`,
      { completed: true },
      () => httpService.post<{ success: boolean }>(
        `/api/courses/${courseId}/lessons/${lessonId}/complete`,
        { completed: true }
      )
    );
  }

  /**
   * Get lesson progress
   */
  async getLessonProgress(courseId: string, lessonId: string): Promise<{
    completed: number;
    total: number;
    percentage: number;
  }> {
    const lesson = await this.getLessonById(lessonId);
    // This would come from the API in real implementation
    return {
      completed: lesson.isCompleted ? lesson.totalItems : 0,
      total: lesson.totalItems,
      percentage: lesson.isCompleted ? 100 : 0,
    };
  }
}

export const lessonService = new LessonService();
