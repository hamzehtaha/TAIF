
import { LessonItem } from "@/models/lesson-item.model";
import { mapLessonItemType } from "@/enums/lesson-item-type.enum";
import { LessonItemDto } from "@/dtos/lesson-item.dto";

export class LessonItemMapper {
    static map(dto: LessonItemDto, lessonId?: string): LessonItem {
        if (!dto) return null;
        return {
            id: dto.id,
            lessonId: dto.lessonId || lessonId || "",
            name: dto.name,
            url: dto.url,
            content: dto.content,
            type: mapLessonItemType(dto.type),
            durationInSeconds: 0,
            order: 0,
            isCompleted: false,
        };
    }
}   