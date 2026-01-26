import { CourseDto } from "@/dtos/course/CourseDto";
import { Course } from "@/services/courseService";

/**
 * Maps backend DTO to UI Model
 * Fills in missing data with defaults/mock values
 */
export class CourseMapper {
  static toUiModel(dto: CourseDto, index: number = 0): Course {
    // Generate consistent data based on course id
    const idNum = parseInt(dto.id) || index;
    const categories = ["Web Development", "Data Science", "Mobile Development", "Design", "Business"];
    const instructors = ["Dr. Sarah Johnson", "Prof. Michael Chen", "Dr. Emily Rodriguez", "John Smith", "Lisa Anderson"];
    const levels = ["Beginner", "Intermediate", "Advanced"];
    
    return {
      id: dto.id,
      title: dto.name,
      description: `Learn ${dto.name} with comprehensive hands-on training and real-world projects.`,
      instructor: instructors[idNum % instructors.length],
      duration: `${8 + (idNum % 5)} weeks`,
      level: levels[idNum % levels.length],
      difficulty: levels[idNum % levels.length].toLowerCase(),
      thumbnail: `/course-${(idNum % 5) + 1}.jpg`,
      imageUrl: `/course-${(idNum % 5) + 1}.jpg`,
      enrolledStudents: 500 + (idNum * 234),
      enrollmentCount: 500 + (idNum * 234),
      rating: 4.5 + (idNum % 5) * 0.1,
      reviewCount: 100 + (idNum * 50),
      price: 99.99 + (idNum * 20),
      category: categories[idNum % categories.length],
      isEnrolled: false,
      progress: 0,
      totalLessons: 20 + (idNum * 4),
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
    };
  }
}
