import { httpService } from "./httpService";
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "@/dtos/category/CategoryDto";

export interface Category {
  id: string;
  name: string;
}

class CategoryService {
  /**
   * Get all categories
   * GET /api/Category
   */
  async getCategories(): Promise<Category[]> {
    const dtos = await httpService.get<CategoryDto[]>("/api/Category");
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Get a specific category by ID
   * GET /api/Category/{id}
   */
  async getCategoryById(id: string): Promise<Category> {
    const dto = await httpService.get<CategoryDto>(`/api/Category/${id}`);
    return this.mapDtoToModel(dto);
  }

  /**
   * Create a new category
   * POST /api/Category
   */
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const dto = await httpService.post<CategoryDto>("/api/Category", request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Update an existing category
   * PUT /api/Category/{id}
   */
  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    const dto = await httpService.put<CategoryDto>(`/api/Category/${id}`, request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Delete a category
   * DELETE /api/Category/{id}
   */
  async deleteCategory(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Category/${id}`);
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: CategoryDto): Category {
    return {
      id: dto.id,
      name: dto.name,
    };
  }
}

export const categoryService = new CategoryService();
