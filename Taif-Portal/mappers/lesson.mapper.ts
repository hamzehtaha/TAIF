import { LessonDto } from "@/dtos/lesson.dto";
import { Lesson } from "@/models/lesson.model";

export class LessonMapper {
  static map(dto: LessonDto): Lesson {
    if (!dto) return null as any;
    return {
      id: dto.id,
      courseId: dto.courseId,
      title: dto.title,
      description: dto.description,
      photo: dto.photo,
      order: dto.order ?? 0,
      duration: dto.duration ?? 0,
      instructorId: dto.instructorId,
      instructor: dto.instructor ? {
        id: dto.instructor.id,
        firstName: dto.instructor.firstName,
        lastName: dto.instructor.lastName,
        bio: dto.instructor.bio,
      } : undefined,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}

