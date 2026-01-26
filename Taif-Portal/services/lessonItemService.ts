import { httpService } from "./httpService";
import { DataProvider } from "@/lib/dataProvider";
import { LessonItemDto } from "@/dtos/lessonItem/LessonItemDto";
import { LessonItemMapper } from "@/mappers/lessonItemMapper";

export type LessonItemType = "video" | "reading" | "quiz" | "assignment";

export interface LessonItem {
  id: string;
  lessonId: string;
  courseId: string;
  title: string;
  type: LessonItemType;
  content: string;
  duration: string;
  order: number;
  isCompleted: boolean;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

class LessonItemService {
  /**
   * Get all items for a specific lesson
   */
  async getItemsByLesson(courseId: string, lessonId: string): Promise<LessonItem[]> {
    const dtos = await DataProvider.get<LessonItemDto[]>(
      `/courses/${courseId}/lessons/${lessonId}/items`,
      () => httpService.get<LessonItemDto[]>(
        `/api/courses/${courseId}/lessons/${lessonId}/items`
      )
    );
    return LessonItemMapper.toUiModelList(dtos, lessonId, courseId);
  }

  /**
   * Get a specific lesson item
   */
  async getItemById(
    courseId: string,
    lessonId: string,
    itemId: string
  ): Promise<LessonItem> {
    const dto = await DataProvider.get<LessonItemDto>(
      `/courses/${courseId}/lessons/${lessonId}/items/${itemId}`,
      () => httpService.get<LessonItemDto>(
        `/api/courses/${courseId}/lessons/${lessonId}/items/${itemId}`
      )
    );
    return LessonItemMapper.toUiModel(dto, lessonId, courseId);
  }

  /**
   * Mark lesson item as completed
   */
  async markItemComplete(
    courseId: string,
    lessonId: string,
    itemId: string
  ): Promise<{ success: boolean }> {
    return DataProvider.post<{ success: boolean }>(
      `/courses/${courseId}/lessons/${lessonId}/items/${itemId}/complete`,
      { completed: true },
      () => httpService.post<{ success: boolean }>(
        `/api/courses/${courseId}/lessons/${lessonId}/items/${itemId}/complete`,
        { completed: true }
      )
    );
  }

  /**
   * Submit quiz answers
   */
  async submitQuiz(
    courseId: string,
    lessonId: string,
    itemId: string,
    answers: Record<string, number>
  ): Promise<{
    score: number;
    totalQuestions: number;
    passed: boolean;
  }> {
    return DataProvider.post<{
      score: number;
      totalQuestions: number;
      passed: boolean;
    }>(
      `/courses/${courseId}/lessons/${lessonId}/items/${itemId}/submit`,
      { answers },
      () => httpService.post<{
        score: number;
        totalQuestions: number;
        passed: boolean;
      }>(
        `/api/courses/${courseId}/lessons/${lessonId}/items/${itemId}/submit`,
        { answers }
      )
    );
  }

  /**
   * Submit assignment
   */
  async submitAssignment(
    courseId: string,
    lessonId: string,
    itemId: string,
    submission: {
      content: string;
      files?: File[];
    }
  ): Promise<{ success: boolean; submissionId: string }> {
    return DataProvider.post<{ success: boolean; submissionId: string }>(
      `/courses/${courseId}/lessons/${lessonId}/items/${itemId}/assignment`,
      submission,
      () => httpService.post<{ success: boolean; submissionId: string }>(
        `/api/courses/${courseId}/lessons/${lessonId}/items/${itemId}/assignment`,
        submission
      )
    );
  }

  /**
   * Get next item in the lesson
   */
  async getNextItem(
    courseId: string,
    lessonId: string,
    currentItemId: string
  ): Promise<LessonItem | null> {
    const items = await this.getItemsByLesson(courseId, lessonId);
    const currentIndex = items.findIndex((item) => item.id === currentItemId);
    
    if (currentIndex === -1 || currentIndex === items.length - 1) {
      return null;
    }
    
    return items[currentIndex + 1];
  }

  /**
   * Get previous item in the lesson
   */
  async getPreviousItem(
    courseId: string,
    lessonId: string,
    currentItemId: string
  ): Promise<LessonItem | null> {
    const items = await this.getItemsByLesson(courseId, lessonId);
    const currentIndex = items.findIndex((item) => item.id === currentItemId);
    
    if (currentIndex <= 0) {
      return null;
    }
    
    return items[currentIndex - 1];
  }
}

export const lessonItemService = new LessonItemService();
