import { CourseDto } from "@/dtos/course.dto";
import { Course } from "@/models/course.model";

export class CourseMapper {

  static map(dto: CourseDto): Course {
    if (!dto) return null;
    return {
      id: dto.id,
      title: dto.name,
      description: dto.description || "",
      thumbnail: dto.photo || "/placeholder-course.jpg",
      imageUrl: dto.photo || "/placeholder-course.jpg",
      categoryId: dto.categoryId,
      isEnrolled: false,
      isFavourite: false,
      lessons: [],
      rating: dto.rating || 5,
      reviewCount: dto.reviewCount,
      durationInMinutes: dto.totalDurationInSeconds ? Math.floor(dto.totalDurationInSeconds / 60) : 0,
      totalEnrolled: dto.totalEnrolled,
      isRecommended: dto.isRecommended || false,
      progress: dto.progress,
    };
  }
}

