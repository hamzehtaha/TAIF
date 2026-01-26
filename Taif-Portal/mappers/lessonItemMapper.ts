import { LessonItemDto } from "@/dtos/lessonItem/LessonItemDto";
import { LessonItem } from "@/services/lessonItemService";

/**
 * Maps backend DTO to UI Model
 * Fills in missing data with defaults/mock values
 */
export class LessonItemMapper {
  static toUiModel(dto: LessonItemDto, lessonId: string, courseId: string, index: number = 0): LessonItem {
    // Generate consistent data based on item id
    const idNum = parseInt(dto.id.split('-').pop() || '0') || index;
    
    return {
      id: dto.id,
      lessonId: lessonId,
      courseId: courseId,
      title: dto.name,
      type: dto.type, // Always "video" for now
      content: `/videos/${dto.id}.mp4`,
      duration: `${10 + (idNum * 5)} minutes`,
      order: index + 1,
      isCompleted: false,
    };
  }

  static toUiModelList(dtos: LessonItemDto[], lessonId: string, courseId: string): LessonItem[] {
    return dtos.map((dto, index) => this.toUiModel(dto, lessonId, courseId, index));
  }

  static toDto(item: LessonItem): LessonItemDto {
    return {
      id: item.id,
      name: item.title,
      type: "video",
    };
  }
}
