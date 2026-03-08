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
            content: this.normalizeContent(dto.content) as object | undefined,
            type: mapLessonItemType(dto.type),
            durationInSeconds: dto.durationInSeconds || 0,
            order: dto.order || 0,
            isCompleted: false,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
        };
    }

    // Normalize content keys to camelCase (handle PascalCase from backend)
    private static normalizeContent(content: unknown): unknown {
        if (!content) return content;
        
        // If content is a string, try to parse it first
        let parsed = content;
        if (typeof content === 'string') {
            try {
                parsed = JSON.parse(content);
            } catch {
                return content;
            }
        }
        
        return this.normalizeKeys(parsed);
    }

    private static normalizeKeys<T>(obj: T): T {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.normalizeKeys(item)) as T;
        
        const normalized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
            normalized[camelKey] = this.normalizeKeys(value);
        }
        return normalized as T;
    }
}