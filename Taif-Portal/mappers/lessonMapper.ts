import { LessonDto } from "@/dtos/lesson/LessonDto";
import { Lesson } from "@/services/lessonService";

/**
 * Maps backend DTO to UI Model
 * Uses real backend data with sensible defaults for UI-only fields
 */
export class LessonMapper {
  static toUiModel(dto: LessonDto, courseId?: string, index: number = 0): Lesson {
    // Generate some UI-specific data based on lesson id for fields not in backend
    const idNum = parseInt(dto.id.split('-').pop() || '0') || index;
    
    return {
      id: dto.id,
      courseId: courseId || dto.courseId,
      title: dto.title,
      description: `Comprehensive lesson covering ${dto.title} with practical examples and exercises.`,
      duration: `${30 + (idNum * 10)} minutes`, // UI-only field
      order: index + 1,
      isCompleted: false,
      videoUrl: dto.photo || `/videos/lesson-${dto.id}.mp4`,
      totalItems: 5 + (idNum % 5), // UI-only field
    };
  }

  static toUiModelList(dtos: LessonDto[], courseId?: string): Lesson[] {
    return dtos.map((dto, index) => this.toUiModel(dto, courseId, index));
  }

  static toDto(lesson: Lesson): LessonDto {
    return {
      id: lesson.id,
      title: lesson.title,
      photo: lesson.videoUrl,
      courseId: lesson.courseId,
    };
  }
}

