export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: string;
    isFavourite: boolean;
    lastLessonItemId?: string;
    completedDurationInSeconds?: number;
    isCompleted: boolean;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}