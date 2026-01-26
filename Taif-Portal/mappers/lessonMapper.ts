import { LessonDto } from "@/dtos/lesson/LessonDto";
import { Lesson } from "@/services/lessonService";

/**
 * Maps backend DTO to UI Model
 * Fills in missing data with defaults/mock values
 */
export class LessonMapper {
  static toUiModel(dto: LessonDto, courseId: string, index: number = 0): Lesson {
    // Generate consistent data based on lesson id
    const idNum = parseInt(dto.id.split('-').pop() || '0') || index;
    
    return {
      id: dto.id,
      courseId: courseId,
      title: dto.name,
      description: `Comprehensive lesson covering ${dto.name} with practical examples and exercises.`,
      duration: `${30 + (idNum * 10)} minutes`,
      order: index + 1,
      isCompleted: false,
      videoUrl: `/videos/lesson-${dto.id}.mp4`,
      totalItems: 5 + (idNum % 5),
    };
  }

  static toUiModelList(dtos: LessonDto[], courseId: string): Lesson[] {
    return dtos.map((dto, index) => this.toUiModel(dto, courseId, index));
  }

  static toDto(lesson: Lesson): LessonDto {
    return {
      id: lesson.id,
      name: lesson.title,
    };
  }
}
