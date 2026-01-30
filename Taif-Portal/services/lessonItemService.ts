import { httpService } from "./httpService";
import { LessonItemDto, CreateLessonItemRequest, UpdateLessonItemRequest } from "@/dtos/lessonItem/LessonItemDto";
import { LessonItemWithProgressDto } from "@/dtos/lessonItemProgress/LessonItemProgressDto";

export type LessonItemType = "video" | "text" | "question";

export interface LessonItem {
  id: string;
  lessonId: string;
  name: string;
  url: string;
  content: string;
  type: LessonItemType;
  durationInSeconds: number;
  order: number;
  isCompleted: boolean;
}

class LessonItemService {
  /**
   * Get all items for a specific lesson (without progress)
   * GET /api/LessonItem/lesson/{lessonId}
   */
  async getItemsByLesson(lessonId: string): Promise<LessonItem[]> {
    const dtos = await httpService.get<LessonItemDto[]>(`/api/LessonItem/lesson/${lessonId}`);
    return dtos.map(dto => this.mapDtoToModel(dto, lessonId));
  }

  /**
   * Get lesson items with user progress
   * GET /api/LessonItem/lessonProgress/{lessonId}
   */
  async getItemsWithProgress(lessonId: string): Promise<LessonItem[]> {
    const dtos = await httpService.get<LessonItemWithProgressDto[]>(
      `/api/LessonItem/lessonProgress/${lessonId}`
    );
    return dtos.map(dto => this.mapProgressDtoToModel(dto, lessonId));
  }

  /**
   * Get a specific lesson item
   * GET /api/LessonItem/{id}
   */
  async getItemById(itemId: string): Promise<LessonItem> {
    const dto = await httpService.get<LessonItemDto>(`/api/LessonItem/${itemId}`);
    return this.mapDtoToModel(dto);
  }

  /**
   * Create a new lesson item
   * POST /api/LessonItem
   */
  async createLessonItem(request: CreateLessonItemRequest): Promise<LessonItem> {
    const dto = await httpService.post<LessonItemDto>("/api/LessonItem", request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Update an existing lesson item
   * PUT /api/LessonItem/{id}
   */
  async updateLessonItem(id: string, request: UpdateLessonItemRequest): Promise<LessonItem> {
    const dto = await httpService.put<LessonItemDto>(`/api/LessonItem/${id}`, request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Delete a lesson item
   * DELETE /api/LessonItem/{id}
   */
  async deleteLessonItem(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/LessonItem/${id}`);
  }

  /**
   * Map backend type enum to frontend type string
   * Backend: 0 = Video, 1 = Text, 2 = Question
   */
  private mapBackendType(type: number): LessonItemType {
    switch (type) {
      case 0: return "video";
      case 1: return "text";
      case 2: return "question";
      default: return "video";
    }
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: LessonItemDto, lessonId?: string): LessonItem {
    return {
      id: dto.id,
      lessonId: dto.lessonId || lessonId || "",
      name: dto.name,
      url: dto.url,
      content: dto.content,
      type: this.mapBackendType(dto.type),
      durationInSeconds: 0,
      order: 0,
      isCompleted: false,
    };
  }

  /**
   * Map progress DTO to frontend model
   */
  private mapProgressDtoToModel(dto: LessonItemWithProgressDto, lessonId: string): LessonItem {
    return {
      id: dto.id,
      lessonId: lessonId,
      name: dto.name,
      url: dto.url,
      content: dto.content,
      type: this.mapBackendType(dto.type),
      durationInSeconds: dto.durationInSeconds,
      order: dto.order,
      isCompleted: dto.isCompleted,
    };
  }
}

export const lessonItemService = new LessonItemService();
