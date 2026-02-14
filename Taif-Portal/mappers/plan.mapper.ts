import { PlanDto, PlanSectionDto, PlanCourseDto } from "@/dtos/plan.dto";
import { Plan, PlanSection, PlanCourse } from "@/models/plan.model";
import { CourseMapper } from "@/mappers/course.mapper";

export class PlanMapper {
  static map(dto: PlanDto): Plan {
    if (!dto) return null as unknown as Plan;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      duration: dto.duration,
      sections: dto.sections?.map(PlanSectionMapper.map) || [],
    };
  }
}

export class PlanSectionMapper {
  static map(dto: PlanSectionDto): PlanSection {
    if (!dto) return null as unknown as PlanSection;
    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      duration: dto.duration,
      planId: dto.planId,
      order: dto.order || 0,
      courses: dto.courses?.map(PlanCourseMapper.map) || [],
    };
  }
}

export class PlanCourseMapper {
  static map(dto: PlanCourseDto): PlanCourse {
    if (!dto) return null as unknown as PlanCourse;
    return {
      course: CourseMapper.map(dto.course),
      order: dto.order || 0,
      isCompleted: dto.isCompleted || false,
    };
  }
}
