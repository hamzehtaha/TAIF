import { LessonDto } from "@/dtos/lesson.dto";
import { Lesson } from "@/models/lesson.model";

export class LessonMapper {
  static map(dto: LessonDto): Lesson {
    if (!dto) return null;
    return {
      id: dto.id,
      courseId: dto.courseId,
      title: dto.title,
      photo: dto.photo,
      order: dto.order,
      duration: dto.duration,
    };
  }
}

