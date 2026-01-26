import { httpService } from "./httpService";
import { DataProvider } from "@/lib/dataProvider";
import { LessonDto } from "@/dtos/lesson/LessonDto";
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
      `/courses/${courseId}/lessons`,
      () => httpService.get<LessonDto[]>(`/api/courses/${courseId}/lessons`)
    );
    return LessonMapper.toUiModelList(dtos, courseId);
  }

  /**
   * Get a specific lesson by ID
   */
  async getLessonById(courseId: string, lessonId: string): Promise<Lesson> {
    const dto = await DataProvider.get<LessonDto>(
      `/courses/${courseId}/lessons/${lessonId}`,
      () => httpService.get<LessonDto>(`/api/courses/${courseId}/lessons/${lessonId}`)
    );
    return LessonMapper.toUiModel(dto, courseId);
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
    const lesson = await this.getLessonById(courseId, lessonId);
    // This would come from the API in real implementation
    return {
      completed: lesson.isCompleted ? lesson.totalItems : 0,
      total: lesson.totalItems,
      percentage: lesson.isCompleted ? 100 : 0,
    };
  }
}

export const lessonService = new LessonService();
