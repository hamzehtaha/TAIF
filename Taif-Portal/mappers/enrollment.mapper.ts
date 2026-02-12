import { EnrollmentDto } from "@/dtos/enrollment.dto";
import { Enrollment } from "@/models/enrollment.model";

export class EnrollmentMapper {

    static map(dto: EnrollmentDto): Enrollment {
        return {
            id: dto.id,
            userId: dto.userId,
            courseId: dto.courseId,
            enrolledAt: dto.enrolledAt,
            isFavourite: dto.isFavourite,
            lastLessonItemId: dto.lastLessonItemId,
            completedDurationInSeconds: dto.completedDurationInSeconds,
            createdAt: dto.createdAt,
            updatedAt: dto.updatedAt,
            isDeleted: dto.isDeleted

        };
    }
}

