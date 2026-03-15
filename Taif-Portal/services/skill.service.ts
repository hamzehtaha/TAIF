import { httpService } from "./http.service";
import { Skill } from "@/models/skill.model";

class SkillService {
  private readonly basePath = "/api/skill";

  async getAllSkills(): Promise<Skill[]> {
    return httpService.get<Skill[]>(this.basePath);
  }

  async getSkillById(id: string): Promise<Skill> {
    return httpService.get<Skill>(`${this.basePath}/${id}`);
  }

  async createSkill(data: { name: string; description?: string }): Promise<Skill> {
    return httpService.post<Skill>(this.basePath, data);
  }

  async updateSkill(id: string, data: { name?: string; description?: string }): Promise<Skill> {
    return httpService.put<Skill>(`${this.basePath}/${id}`, data);
  }

  async deleteSkill(id: string): Promise<void> {
    return httpService.delete(`${this.basePath}/${id}`);
  }
}

export const skillService = new SkillService();
