import { LessonItemWithProgressDto } from "@/dtos/lesson-item.dto";
import { LessonItemProgressDto, SetLessonItemAsCompletedRequest, UpdateLastLessonItemRequest } from "@/dtos/lesson-item-progress.dto";
import { httpService } from "@/services/http.service";


class LessonItemProgressService {
  private serviceBaseUrl = "/api/LessonItemProgress";
  
  async setLessonItemAsCompleted(
    courseId: string, 
    lessonId: string,
    lessonItemId: string
  ): Promise<LessonItemProgressDto> {
    const request: SetLessonItemAsCompletedRequest = { courseId, lessonId, lessonItemId };
    return httpService.post<LessonItemProgressDto>(this.serviceBaseUrl, request);
  }

  async updateLastLessonItem(courseId: string, lessonItemId: string): Promise<void> {
    const request: UpdateLastLessonItemRequest = { courseId, lessonItemId };
    return httpService.put<void>(`${this.serviceBaseUrl}/updateLastLessonItem`, request);
  }
}

export const lessonItemProgressService = new LessonItemProgressService();
