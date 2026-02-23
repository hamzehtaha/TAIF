/**
 * LearningPath Mapper - Maps backend DTOs to frontend models
 */

import {
  LearningPathDto,
  LearningPathDetailsDto,
  LearningPathSectionDto,
  LearningPathCourseDto,
  LearningPathProgressDto,
  LearningPathSectionProgressDto,
  LearningPathCourseProgressDto,
  LearningPathEnrollmentStatusDto,
} from "@/dtos/learning-path.dto";

import {
  LearningPath,
  LearningPathDetails,
  LearningPathSection,
  LearningPathCourse,
  LearningPathProgress,
  LearningPathSectionProgress,
  LearningPathCourseProgress,
  LearningPathEnrollmentStatus,
} from "@/models/learning-path.model";

export class LearningPathMapper {
  static map(dto: LearningPathDto): LearningPath {
    if (!dto) return null as unknown as LearningPath;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      photo: dto.photo,
      totalEnrolled: dto.totalEnrolled,
      durationInSeconds: dto.durationInSeconds,
      totalSections: dto.totalSections,
      totalCourses: dto.totalCourses,
      createdAt: dto.createdAt,
      isEnrolled: dto.isEnrolled,
    };
  }

  static mapDetails(dto: LearningPathDetailsDto): LearningPathDetails {
    if (!dto) return null as unknown as LearningPathDetails;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      photo: dto.photo,
      totalEnrolled: dto.totalEnrolled,
      durationInSeconds: dto.durationInSeconds,
      totalSections: dto.sections?.length ?? 0,
      totalCourses: dto.sections?.reduce((sum, s) => sum + (s.courses?.length ?? 0), 0) ?? 0,
      createdAt: dto.createdAt,
      isEnrolled: dto.isEnrolled,
      sections: dto.sections?.map(this.mapSection) ?? [],
    };
  }

  static mapSection(dto: LearningPathSectionDto): LearningPathSection {
    if (!dto) return null as unknown as LearningPathSection;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      order: dto.order,
      courses: dto.courses?.map(LearningPathMapper.mapCourse) ?? [],
    };
  }

  static mapCourse(dto: LearningPathCourseDto): LearningPathCourse {
    if (!dto) return null as unknown as LearningPathCourse;
    return {
      id: dto.id,
      order: dto.order,
      isRequired: dto.isRequired,
      courseId: dto.courseId,
      courseName: dto.courseName,
      courseDescription: dto.courseDescription,
      coursePhoto: dto.coursePhoto,
      courseDurationInSeconds: dto.courseDurationInSeconds,
    };
  }

  static mapProgress(dto: LearningPathProgressDto): LearningPathProgress {
    if (!dto) return null as unknown as LearningPathProgress;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      photo: dto.photo,
      durationInSeconds: dto.durationInSeconds,
      createdAt: dto.createdAt,
      enrolledAt: dto.enrolledAt,
      completedDuration: dto.completedDuration,
      currentSectionId: dto.currentSectionId,
      currentCourseId: dto.currentCourseId,
      isCompleted: dto.isCompleted,
      completedAt: dto.completedAt,
      sections: dto.sections?.map(LearningPathMapper.mapSectionProgress) ?? [],
    };
  }

  static mapSectionProgress(dto: LearningPathSectionProgressDto): LearningPathSectionProgress {
    if (!dto) return null as unknown as LearningPathSectionProgress;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      order: dto.order,
      isCurrentSection: dto.isCurrentSection,
      courses: dto.courses?.map(LearningPathMapper.mapCourseProgress) ?? [],
    };
  }

  static mapCourseProgress(dto: LearningPathCourseProgressDto): LearningPathCourseProgress {
    if (!dto) return null as unknown as LearningPathCourseProgress;
    return {
      id: dto.id,
      order: dto.order,
      isRequired: dto.isRequired,
      courseId: dto.courseId,
      courseName: dto.courseName,
      courseDescription: dto.courseDescription,
      coursePhoto: dto.coursePhoto,
      courseDurationInSeconds: dto.courseDurationInSeconds,
      isEnrolled: dto.isEnrolled,
      isCurrentCourse: dto.isCurrentCourse,
    };
  }

  static mapEnrollmentStatus(dto: LearningPathEnrollmentStatusDto): LearningPathEnrollmentStatus {
    if (!dto) return { isEnrolled: false };
    return {
      isEnrolled: dto.isEnrolled,
      enrolledAt: dto.enrolledAt,
    };
  }
}
