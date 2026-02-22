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
}

export const learningPathService = new LearningPathService();
