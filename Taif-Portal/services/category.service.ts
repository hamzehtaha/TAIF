import { httpService } from "@/services/http.service";
import { CategoryDto, CreateCategoryRequest, UpdateCategoryRequest } from "@/dtos/category.dto";
import { CategoryMapper } from "@/mappers/category.mapper";
import { Category } from "@/models/category.model";

class CategoryService {
  private serviceBaseUrl = "/api/Category";
  async getCategories(): Promise<Category[]> {
    const dtos = await httpService.get<CategoryDto[]>(this.serviceBaseUrl);
    return dtos.map(CategoryMapper.map);
  }

  async getCategoryById(id: string): Promise<Category> {
    const dto = await httpService.get<CategoryDto>(`${this.serviceBaseUrl}/${id}`);
    return CategoryMapper.map(dto);
  }

  async createCategory(request: CreateCategoryRequest): Promise<Category> {
    const dto = await httpService.post<CategoryDto>(this.serviceBaseUrl, request);
    return CategoryMapper.map(dto);
  }

  async updateCategory(id: string, request: UpdateCategoryRequest): Promise<Category> {
    const dto = await httpService.put<CategoryDto>(`${this.serviceBaseUrl}/${id}`, request);
    return CategoryMapper.map(dto);
  }

  async deleteCategory(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.serviceBaseUrl}/${id}`);
  }

}

export const categoryService = new CategoryService();
