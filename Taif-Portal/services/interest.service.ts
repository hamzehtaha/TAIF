import { InterestDto, UpdateInterestsRequest } from "@/dtos/interest.dto";
import { InterestMapper } from "@/mappers/interest.mapper";
import { Interest } from "@/models/interest.model";
import { httpService } from "@/services/http.service";



class InterestService {
  private serviceBaseUrl = "/api/Interest";
  async getAllInterests(): Promise<Interest[]> {
    const dtos = await httpService.get<InterestDto[]>(this.serviceBaseUrl);
    return dtos.map(InterestMapper.map);
  }

  /**
   * Get a specific interest by ID
   * GET /api/Interest/{id}
   */
  async getInterestById(id: string): Promise<Interest> {
    const dto = await httpService.get<InterestDto>(`${this.serviceBaseUrl}/${id}`);
    return InterestMapper.map(dto);
  }

  /**
   * Get current user's interests
   * GET /api/Interest/user
   */
  async getUserInterests(): Promise<Interest[]> {
    const dtos = await httpService.get<InterestDto[]>(`${this.serviceBaseUrl}/user`);
    return dtos.map(InterestMapper.map);
  }

  async updateUserInterests(interestIds: string[]): Promise<void> {
    const request: UpdateInterestsRequest = { interests: interestIds };
    await httpService.put("/api/User/interests", request);
  }

  async hasInterests(): Promise<boolean> {
    try {
      const interests = await this.getUserInterests();
      return interests.length > 0;
    } catch {
      return false;
    }
  }


}

export const interestService = new InterestService();
