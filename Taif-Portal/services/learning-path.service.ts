/**
 * LearningPath Service - Handles all learning path API calls
 */

import { httpService } from "@/services/http.service";
import {
  LearningPathDto,
  LearningPathDetailsDto,
  LearningPathProgressDto,
  LearningPathEnrollmentStatusDto,
  UserLearningPathProgressDto,
} from "@/dtos/learning-path.dto";
import { LearningPathMapper } from "@/mappers/learning-path.mapper";
import {
  LearningPath,
  LearningPathDetails,
  LearningPathProgress,
  LearningPathEnrollmentStatus,
} from "@/models/learning-path.model";

class LearningPathService {
  private baseUrl = "/api/learningpath";

  async getAll(): Promise<LearningPath[]> {
    const dtos = await httpService.get<LearningPathDto[]>(this.baseUrl);
    return dtos.map(LearningPathMapper.map);
  }

  async getUserLearningPaths(): Promise<LearningPath[]> {
    const dtos = await httpService.get<LearningPathDto[]>(`${this.baseUrl}/user`);
    return dtos.map(LearningPathMapper.map);
  }

  async getDetails(id: string): Promise<LearningPathDetails | null> {
    try {
      const dto = await httpService.get<LearningPathDetailsDto>(`${this.baseUrl}/${id}/details`);
      return LearningPathMapper.mapDetails(dto);
    } catch {
      return null;
    }
  }

  async getProgress(id: string): Promise<LearningPathProgress | null> {
    try {
      const dto = await httpService.get<LearningPathProgressDto>(`${this.baseUrl}/${id}/progress`);
      return LearningPathMapper.mapProgress(dto);
    } catch {
      return null;
    }
  }

  async getEnrollmentStatus(id: string): Promise<LearningPathEnrollmentStatus> {
    try {
      const dto = await httpService.get<LearningPathEnrollmentStatusDto>(`${this.baseUrl}/${id}/enrollment`);
      return LearningPathMapper.mapEnrollmentStatus(dto);
    } catch {
      return { isEnrolled: false };
    }
  }

  async enroll(id: string): Promise<UserLearningPathProgressDto | null> {
    try {
      const dto = await httpService.post<UserLearningPathProgressDto>(`${this.baseUrl}/${id}/enroll`, {});
      return dto;
    } catch {
      return null;
    }
  }

  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  calculateProgressPercent(completedDuration: number, totalDuration: number): number {
    if (totalDuration <= 0) return 0;
    return Math.min(100, Math.round((completedDuration / totalDuration) * 100));
  }

  // Admin CRUD Operations
  async getById(id: string): Promise<any> {
    return httpService.get<any>(`${this.baseUrl}/${id}`);
  }

  async getPaged(params: { page?: number; pageSize?: number; search?: string }): Promise<any> {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page.toString());
    if (params.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params.search) searchParams.append('search', params.search);
    return httpService.get<any>(`${this.baseUrl}/paged?${searchParams.toString()}`);
  }

  async create(data: { name: string; description?: string; photo?: string }): Promise<any> {
    return httpService.post<any>(this.baseUrl, data);
  }

  async update(id: string, data: { name?: string; description?: string; photo?: string }): Promise<any> {
    return httpService.put<any>(`${this.baseUrl}/${id}`, data);
  }

  async delete(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.baseUrl}/${id}`);
  }

  // Section Operations
  async getSections(learningPathId: string): Promise<any[]> {
    return httpService.get<any[]>(`/api/learning-path/${learningPathId}/sections`);
  }

  async createSection(learningPathId: string, data: { name: string; description?: string; order: number }): Promise<any> {
    return httpService.post<any>(`/api/learning-path/${learningPathId}/sections`, data);
  }

  async updateSection(sectionId: string, data: { name?: string; description?: string; order?: number }): Promise<any> {
    return httpService.put<any>(`/api/learning-path/sections/${sectionId}`, data);
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/learning-path/sections/${sectionId}`);
  }

  // Course Operations
  async getSectionCourses(sectionId: string): Promise<any[]> {
    return httpService.get<any[]>(`/api/learning-path/sections/${sectionId}/courses`);
  }

  async addCourseToSection(sectionId: string, data: { courseId: string; order: number; isRequired?: boolean }): Promise<any> {
    return httpService.post<any>(`/api/learning-path/sections/${sectionId}/courses`, data);
  }

  async updateSectionCourse(courseId: string, data: { order?: number; isRequired?: boolean }): Promise<any> {
    return httpService.put<any>(`/api/learning-path/sections/courses/${courseId}`, data);
  }

  async removeCourseFromSection(courseId: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/learning-path/sections/courses/${courseId}`);
  }
}

export const learningPathService = new LearningPathService();
