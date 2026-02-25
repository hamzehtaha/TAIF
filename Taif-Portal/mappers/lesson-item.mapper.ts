import { LessonItem } from "@/models/lesson-item.model";
import { mapLessonItemType } from "@/enums/lesson-item-type.enum";
import { LessonItemDto } from "@/dtos/lesson-item.dto";

export class LessonItemMapper {
    static map(dto: LessonItemDto, lessonId?: string): LessonItem {
        if (!dto) return null as any;
        return {
            id: dto.id,
            lessonId: dto.lessonId || lessonId,
            name: dto.name,
            description: dto.description,
            contentId: dto.contentId,
            content: dto.content,
            type: mapLessonItemType(dto.type),
            durationInSeconds: dto.durationInSeconds || 0,
            order: dto.order || 0,
            isCompleted: false,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        };
    }
}