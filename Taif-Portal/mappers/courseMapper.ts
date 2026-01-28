import { CourseDto } from "@/dtos/course/CourseDto";
import { Course } from "@/services/courseService";

/**
 * Maps backend DTO to UI Model
 * Uses real backend data with sensible defaults for UI-only fields
 */
export class CourseMapper {
  static toUiModel(dto: CourseDto, index: number = 0): Course {
    // Generate some UI-specific data based on course id for fields not in backend
    const idNum = parseInt(dto.id) || index;
    const instructors = ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez", "John Smith", "Lisa Anderson"];
    const levels = ["Beginner", "Intermediate", "Advanced"];
    
    return {
      id: dto.id,
      title: dto.name,
      description: dto.description || `Learn ${dto.name} with comprehensive hands-on training.`,
      instructor: instructors[idNum % instructors.length], // UI-only field
      duration: `${8 + (idNum % 5)} weeks`, // UI-only field
      level: levels[idNum % levels.length], // UI-only field
      difficulty: levels[idNum % levels.length].toLowerCase(), // UI-only field
      thumbnail: dto.photo || `/course-${(idNum % 5) + 1}.jpg`,
      imageUrl: dto.photo || `/course-${(idNum % 5) + 1}.jpg`,
      enrolledStudents: 500 + (idNum * 234), // UI-only field
      enrollmentCount: 500 + (idNum * 234), // UI-only field
      rating: 4.5 + (idNum % 5) * 0.1, // UI-only field
      reviewCount: 100 + (idNum * 50), // UI-only field
      price: 99.99 + (idNum * 20), // UI-only field
      category: dto.categoryId, // Store categoryId as category for now
      isEnrolled: false,
      progress: 0,
      totalLessons: 20 + (idNum * 4), // UI-only field
      completedLessons: 0,
      lessons: [],
    };
  }

  static toUiModelList(dtos: CourseDto[]): Course[] {
    return dtos.map((dto, index) => this.toUiModel(dto, index));
  }

  static toDto(course: Course): CourseDto {
    return {
      id: course.id,
      name: course.title,
      description: course.description,
      photo: course.thumbnail || course.imageUrl || '',
      categoryId: course.category, // Assuming category holds categoryId
    };
  }
}

