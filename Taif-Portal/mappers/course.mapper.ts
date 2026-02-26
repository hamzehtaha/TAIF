import { CourseDto } from "@/dtos/course.dto";
import { Course, CourseStatus } from "@/models/course.model";

export class CourseMapper {

  private static mapStatus(status?: number): CourseStatus {
    switch (status) {
      case 1: return 'published';
      case 2: return 'archived';
      default: return 'draft';
    }
  }

  static map(dto: CourseDto): Course {
    if (!dto) return null as unknown as Course;
    return {
      id: dto.id,
      title: dto.name,
      description: dto.description || "",
      thumbnail: dto.photo || "/placeholder-course.jpg",
      imageUrl: dto.photo || "/placeholder-course.jpg",
      categoryId: dto.categoryId,
      categoryName: dto.category?.name,
      tags: dto.tags,
      status: this.mapStatus(dto.status),
      isEnrolled: false,
      isFavourite: false,
      lessons: [],
      rating: dto.rating || 5,
      reviewCount: dto.reviewCount,
      durationInMinutes: dto.totalDurationInSeconds ? Math.floor(dto.totalDurationInSeconds / 60) : 0,
      totalEnrolled: dto.totalEnrolled,
      isRecommended: dto.isRecommended || false,
      progress: dto.progress,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}

