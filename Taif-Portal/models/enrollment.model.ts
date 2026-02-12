export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: string;
    isFavourite: boolean;
    lastLessonItemId?: string;
    completedDurationInSeconds?: number;
    createdAt?: string;
    updatedAt?: string;
    isDeleted?: boolean;
}