import { httpService } from "./httpService";
import { LessonDto, CreateLessonRequest, UpdateLessonRequest } from "@/dtos/lesson/LessonDto";

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  photo?: string;
  order: number;
}

class LessonService {
  /**
   * Get all lessons for a specific course
   * GET /api/Lesson/course/{courseId}
   */
  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const dtos = await httpService.get<LessonDto[]>(`/api/Lesson/course/${courseId}`);
    return dtos.map(dto => this.mapDtoToModel(dto, courseId));
  }

  /**
   * Get a specific lesson by ID
   * GET /api/Lesson/{id}
   */
  async getLessonById(lessonId: string): Promise<Lesson> {
    const dto = await httpService.get<LessonDto>(`/api/Lesson/${lessonId}`);
    return this.mapDtoToModel(dto);
  }

  /**
   * Create a new lesson
   * POST /api/Lesson
   */
  async createLesson(request: CreateLessonRequest): Promise<Lesson> {
    const dto = await httpService.post<LessonDto>("/api/Lesson", request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Update an existing lesson
   * PUT /api/Lesson/{id}
   */
  async updateLesson(id: string, request: UpdateLessonRequest): Promise<Lesson> {
    const dto = await httpService.put<LessonDto>(`/api/Lesson/${id}`, request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Delete a lesson
   * DELETE /api/Lesson/{id}
   */
  async deleteLesson(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Lesson/${id}`);
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: LessonDto, courseId?: string): Lesson {
    return {
      id: dto.id,
      courseId: dto.courseId || courseId || "",
      title: dto.title,
      photo: dto.photo,
      order: 0,
    };
  }
}

export const lessonService = new LessonService();
