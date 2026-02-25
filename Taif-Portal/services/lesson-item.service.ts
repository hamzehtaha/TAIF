import { httpService } from "@/services/http.service";  
import { LessonItemDto, CreateLessonItemRequest, UpdateLessonItemRequest, LessonItemWithProgressDto } from "@/dtos/lesson-item.dto";
import { LessonItemType, mapLessonItemType } from "@/enums/lesson-item-type.enum";
import { LessonItemMapper } from "@/mappers/lesson-item.mapper";
import { LessonItem } from "@/models/lesson-item.model";
import {
  VideoContent,
  RichTextContent,
  QuestionContent,
  QuizQuestion,
  QuizAnswerRequest,
  SubmitQuizRequest,
  QuestionResult,
  QuizResultResponse,
} from "@/types/lessonContent";

// Re-export types for convenience
export type {
  LessonItemType,
  VideoContent,
  RichTextContent,
  QuestionContent,
  QuizQuestion,
  QuizAnswerRequest,
  SubmitQuizRequest,
  QuestionResult,
  QuizResultResponse,
};



export interface LessonItemFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  lessonId?: string;
  courseId?: string;
  type?: number;
}

export interface PagedLessonItemResult {
  items: LessonItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class LessonItemService {
  private serviceBaseUrl = "/api/LessonItem";

  async getPagedItems(filter: LessonItemFilter = {}): Promise<PagedLessonItemResult> {
    const params = new URLSearchParams();
    if (filter.page) params.append("Page", filter.page.toString());
    if (filter.pageSize) params.append("PageSize", filter.pageSize.toString());
    if (filter.search) params.append("Search", filter.search);
    if (filter.lessonId) params.append("LessonId", filter.lessonId);
    if (filter.courseId) params.append("CourseId", filter.courseId);
    if (filter.type !== undefined) params.append("Type", filter.type.toString());

    const response = await httpService.get<{
      items: LessonItemDto[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
    }>(`${this.serviceBaseUrl}/paged?${params.toString()}`);

    return {
      items: response.items.map(dto => LessonItemMapper.map(dto)),
      totalCount: response.totalCount,
      page: response.page,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
    };
  }

  async getItemsByLesson(lessonId: string): Promise<LessonItem[]> {
    const dtos = await httpService.get<LessonItemDto[]>(`${this.serviceBaseUrl}/lesson/${lessonId}`);
    return dtos.map(dto => LessonItemMapper.map(dto, lessonId));
  }

  async getAllLessonItems(): Promise<LessonItem[]> {
    const dtos = await httpService.get<LessonItemDto[]>(`${this.serviceBaseUrl}/all`);
    return dtos.map(dto => LessonItemMapper.map(dto));
  }

  async getItemById(itemId: string): Promise<LessonItem> {
    const dto = await httpService.get<LessonItemDto>(`${this.serviceBaseUrl}/${itemId}`);
    return LessonItemMapper.map(dto);
  }

  async createLessonItem(request: CreateLessonItemRequest): Promise<LessonItem> {
    const dto = await httpService.post<LessonItemDto>(`${this.serviceBaseUrl}`, request);
    return LessonItemMapper.map(dto);
  }
  async updateLessonItem(id: string, request: UpdateLessonItemRequest): Promise<LessonItem> {
    const dto = await httpService.put<LessonItemDto>(`${this.serviceBaseUrl}/${id}`, request);
    return LessonItemMapper.map(dto);
  }

  async deleteLessonItem(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.serviceBaseUrl}/${id}`);
  }

  async getItemsWithProgress(lessonId: string): Promise<LessonItem[]> {
    const dtos = await httpService.get<LessonItemWithProgressDto[]>(
      `${this.serviceBaseUrl}/lessonProgress/${lessonId}`
    );
    return dtos.map(dto => this.mapProgressDtoToModel(dto, lessonId));
  }


  async submitQuiz(request: SubmitQuizRequest): Promise<QuizResultResponse> {
    return httpService.post<QuizResultResponse>(`${this.serviceBaseUrl}/submit-quiz`, request);
  }

  parseContent<T>(content: string | object | null | undefined): T | null {
    if (!content) return null;
    if (typeof content === "object") {
      return content as T;
    }
    if (typeof content === "string") {
      try {
        return JSON.parse(content) as T;
      } catch {
        return null;
      }
    }
    return null;
  }

  private mapProgressDtoToModel(dto: LessonItemWithProgressDto, lessonId: string): LessonItem {
    return {
      id: dto.id,
      lessonId: lessonId,
      name: dto.name,
      description: dto.description,
      contentId: dto.contentId,
      content: dto.content,
      type: mapLessonItemType(dto.type),
      durationInSeconds: dto.durationInSeconds,
      order: dto.order,
      isCompleted: dto.isCompleted,
    };
  }
}

export const lessonItemService = new LessonItemService();
