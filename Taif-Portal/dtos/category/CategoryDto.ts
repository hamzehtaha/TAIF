/**
 * Backend DTO - Matches backend Category entity
 */
export interface CategoryDto {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
}

export interface CategoriesResponseDto {
  categories: CategoryDto[];
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name?: string;
}
