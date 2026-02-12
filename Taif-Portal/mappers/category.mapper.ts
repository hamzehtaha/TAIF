import { CategoryDto } from "@/dtos/category.dto";
import { Category } from "@/models/category.model";

export class CategoryMapper {
  static map(dto: CategoryDto): Category {
    if (!dto) return null;
    return {
      id: dto.id,
      name: dto.name,
    };
  }
}