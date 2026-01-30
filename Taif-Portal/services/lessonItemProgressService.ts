import { httpService } from "./httpService";
import { 
  LessonItemProgressDto, 
  SetLessonItemAsCompletedRequest,
  LessonItemWithProgressDto 
} from "@/dtos/lessonItemProgress/LessonItemProgressDto";

class LessonItemProgressService {
  /**
   * Mark a lesson item as completed
   * POST /api/LessonItemProgress
   */
  async setLessonItemAsCompleted(
    courseId: string, 
    lessonItemId: string
  ): Promise<LessonItemProgressDto> {
    const request: SetLessonItemAsCompletedRequest = { courseId, lessonItemId };
    return httpService.post<LessonItemProgressDto>("/api/LessonItemProgress", request);
  }

  /**
   * Get lesson items with progress for a specific lesson
   * GET /api/LessonItem/lessonProgress/{lessonId}
   */
  async getLessonItemsWithProgress(lessonId: string): Promise<LessonItemWithProgressDto[]> {
    return httpService.get<LessonItemWithProgressDto[]>(
      `/api/LessonItem/lessonProgress/${lessonId}`
    );
  }
}

export const lessonItemProgressService = new LessonItemProgressService();
