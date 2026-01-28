import { CategoryDto } from "@/dtos/category/CategoryDto";

export interface Category {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Maps backend DTO to UI Model
 */
export class CategoryMapper {
  static toUiModel(dto: CategoryDto): Category {
    return {
      id: dto.id,
      name: dto.name,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toUiModelList(dtos: CategoryDto[]): Category[] {
    return dtos.map((dto) => this.toUiModel(dto));
  }

  static toDto(category: Category): CategoryDto {
    return {
      id: category.id,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }
}
