import { httpService } from "@/services/http.service";

export interface InterestTagMapping {
  id: string;
  interestId: string;
  tagId: string;
  weight: number;
  interest?: {
    id: string;
    name: string;
  };
  tag?: {
    id: string;
    name: string;
  };
}

export interface CreateMappingRequest {
  interestId: string;
  tagId: string;
  weight: number;
}

export interface UpdateMappingWeightRequest {
  weight: number;
}

class InterestTagMappingService {
  private serviceBaseUrl = "/api/InterestTagMapping";

  async getAllMappings(): Promise<InterestTagMapping[]> {
    return httpService.get<InterestTagMapping[]>(this.serviceBaseUrl);
  }

  async getMappingById(id: string): Promise<InterestTagMapping> {
    return httpService.get<InterestTagMapping>(`${this.serviceBaseUrl}/${id}`);
  }

  async getMappingsByInterestId(interestId: string): Promise<InterestTagMapping[]> {
    return httpService.get<InterestTagMapping[]>(`${this.serviceBaseUrl}/interest/${interestId}`);
  }

  async getMappingsByTagId(tagId: string): Promise<InterestTagMapping[]> {
    return httpService.get<InterestTagMapping[]>(`${this.serviceBaseUrl}/tag/${tagId}`);
  }

  async createMapping(request: CreateMappingRequest): Promise<InterestTagMapping> {
    return httpService.post<InterestTagMapping>(this.serviceBaseUrl, request);
  }

  async updateMappingWeight(id: string, weight: number): Promise<InterestTagMapping> {
    return httpService.put<InterestTagMapping>(`${this.serviceBaseUrl}/${id}`, { weight });
  }

  async deleteMapping(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`${this.serviceBaseUrl}/${id}`);
  }
}

export const interestTagMappingService = new InterestTagMappingService();
