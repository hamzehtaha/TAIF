import { httpService } from "./httpService";
import { DataProvider } from "@/lib/dataProvider";
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "@/dtos/category/CategoryDto";
import { Category, CategoryMapper } from "@/mappers/categoryMapper";

class CategoryService {
  /**
   * Get all categories
   */
  async getCategories(): Promise<Category[]> {
    const dtos = await DataProvider.get<CategoryDto[]>(
      '/categories',
      () => httpService.get<CategoryDto[]>('/api/Category')
    );
    return CategoryMapper.toUiModelList(dtos);
  }

  /**
   * Get a specific category by ID
   */
  async getCategoryById(id: string): Promise<Category> {
    const dto = await DataProvider.get<CategoryDto>(
      `/categories/${id}`,
      () => httpService.get<CategoryDto>(`/api/Category/${id}`)
    );
    return CategoryMapper.toUiModel(dto);
  }

  /**
   * Create a new category
   */
  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const dto = await DataProvider.post<CategoryDto>(
      '/categories',
      request,
      () => httpService.post<CategoryDto>('/api/Category', request)
    );
    return CategoryMapper.toUiModel(dto);
  }

  /**
   * Update an existing category
   */
  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    const dto = await DataProvider.put<CategoryDto>(
      `/categories/${id}`,
      request,
      () => httpService.put<CategoryDto>(`/api/Category/${id}`, request)
    );
    return CategoryMapper.toUiModel(dto);
  }

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    return DataProvider.delete<boolean>(
      `/categories/${id}`,
      () => httpService.delete<boolean>(`/api/Category/${id}`)
    );
  }
}

export const categoryService = new CategoryService();
