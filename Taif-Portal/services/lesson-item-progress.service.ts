import { LessonItemWithProgressDto } from "@/dtos/lesson-item.dto";
import { LessonItemProgressDto, SetLessonItemAsCompletedRequest } from "@/dtos/lesson-item-progress.dto";
import { httpService } from "@/services/http.service";


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
