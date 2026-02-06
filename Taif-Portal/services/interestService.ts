import { httpService } from "./httpService";
import { InterestDto, UpdateInterestsRequest } from "@/dtos/interest/InterestDto";

export interface Interest {
  id: string;
  name: string;
}

class InterestService {
  /**
   * Get all available interests
   * GET /api/Interest
   */
  async getAllInterests(): Promise<Interest[]> {
    const dtos = await httpService.get<InterestDto[]>("/api/Interest");
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Get a specific interest by ID
   * GET /api/Interest/{id}
   */
  async getInterestById(id: string): Promise<Interest> {
    const dto = await httpService.get<InterestDto>(`/api/Interest/${id}`);
    return this.mapDtoToModel(dto);
  }

  /**
   * Get current user's interests
   * GET /api/Interest/user
   */
  async getUserInterests(): Promise<Interest[]> {
    const dtos = await httpService.get<InterestDto[]>("/api/Interest/user");
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Update user interests
   * PUT /api/User/interests
   */
  async updateUserInterests(interestIds: string[]): Promise<void> {
    const request: UpdateInterestsRequest = { interests: interestIds };
    await httpService.put("/api/User/interests", request);
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: InterestDto): Interest {
    return {
      id: dto.id,
      name: dto.name,
    };
  }
}

export const interestService = new InterestService();
