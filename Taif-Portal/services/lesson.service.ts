import { httpService } from "@/services/http.service";
import { LessonDto, CreateLessonRequest, UpdateLessonRequest } from "@/dtos/lesson.dto";
import { Lesson } from "@/models/lesson.model"; 
import { LessonMapper } from "@/mappers/lesson.mapper";

export interface LessonFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  courseId?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

class LessonService {

  async getPagedLessons(filter: LessonFilter = {}): Promise<PagedResult<Lesson>> {
    const params = new URLSearchParams();
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
    if (filter.search) params.append('search', filter.search);
    if (filter.courseId) params.append('courseId', filter.courseId);
    
    const result = await httpService.get<PagedResult<LessonDto>>(`/api/Lesson/paged?${params.toString()}`);
    return {
      ...result,
      items: result.items.map(dto => LessonMapper.map(dto))
    };
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    const dtos = await httpService.get<LessonDto[]>(`/api/Lesson/course/${courseId}`);
    return dtos.map(dto => LessonMapper.map(dto));
  }

  async getLessonById(lessonId: string): Promise<Lesson> {
    const dto = await httpService.get<LessonDto>(`/api/Lesson/${lessonId}`);
    return LessonMapper.map(dto);
  }

  async createLesson(request: CreateLessonRequest): Promise<Lesson> {
    const dto = await httpService.post<LessonDto>("/api/Lesson", request);
    return LessonMapper.map(dto);
  }

  async updateLesson(id: string, request: UpdateLessonRequest): Promise<Lesson> {
    const dto = await httpService.put<LessonDto>(`/api/Lesson/${id}`, request);
    return LessonMapper.map(dto);
  }

  async deleteLesson(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Lesson/${id}`);
  }
}

export const lessonService = new LessonService();
