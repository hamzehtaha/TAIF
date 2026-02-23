import { httpService } from "@/services/http.service";

export interface Tag {
  id: string;
  name: string;
}

class TagService {
  async getAllTags(): Promise<Tag[]> {
    return httpService.get<Tag[]>("/api/Tag");
  }

  async getTagById(id: string): Promise<Tag> {
    return httpService.get<Tag>(`/api/Tag/${id}`);
  }

  async createTag(name: string): Promise<Tag> {
    return httpService.post<Tag>("/api/Tag", { name });
  }

  async updateTag(id: string, name: string): Promise<Tag> {
    return httpService.put<Tag>(`/api/Tag/${id}`, { name });
  }

  async deleteTag(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Tag/${id}`);
  }
}

export const tagService = new TagService();
