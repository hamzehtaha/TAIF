export type LessonItemType = "video" | "text" | "question";
export function mapLessonItemType(type: number): LessonItemType {
    switch (type) {
        case 0: return "video";
        case 1: return "text";
        case 2: return "question";
        default: return "video";
    }
}