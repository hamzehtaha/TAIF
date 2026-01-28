import { LessonItemDto } from "@/dtos/lessonItem/LessonItemDto";
import { LessonItem, LessonItemType } from "@/services/lessonItemService";

/**
 * Maps backend DTO to UI Model
 * Uses real backend data with sensible defaults for UI-only fields
 */
export class LessonItemMapper {
  // Map backend type enum (number) to frontend type (string)
  private static mapType(backendType: number): LessonItemType {
    switch (backendType) {
      case 0: return "video";
      case 1: return "quiz";
      case 2: return "reading";
      case 3: return "assignment";
      default: return "video";
    }
  }

  // Map frontend type (string) to backend type enum (number)
  private static mapTypeToBackend(frontendType: LessonItemType): number {
    switch (frontendType) {
      case "video": return 0;
      case "quiz": return 1;
      case "reading": return 2;
      case "assignment": return 3;
      default: return 0;
    }
  }

  static toUiModel(dto: LessonItemDto, lessonId?: string, courseId?: string, index: number = 0): LessonItem {
    // Generate some UI-specific data based on item id for fields not in backend
    const idNum = parseInt(dto.id.split('-').pop() || '0') || index;
    
    return {
      id: dto.id,
      lessonId: lessonId || dto.lessonId,
      courseId: courseId || '', // courseId not in backend LessonItem
      title: dto.name,
      type: this.mapType(dto.type),
      content: dto.url || dto.content,
      duration: `${10 + (idNum * 5)} minutes`, // UI-only field
      order: index + 1,
      isCompleted: false,
    };
  }

  static toUiModelList(dtos: LessonItemDto[], lessonId?: string, courseId?: string): LessonItem[] {
    return dtos.map((dto, index) => this.toUiModel(dto, lessonId, courseId, index));
  }

  static toDto(item: LessonItem): LessonItemDto {
    return {
      id: item.id,
      name: item.title,
      url: item.content,
      content: item.content,
      type: this.mapTypeToBackend(item.type),
      lessonId: item.lessonId,
    };
  }
}

