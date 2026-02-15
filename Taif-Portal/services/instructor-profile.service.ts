import { httpService } from "@/services/http.service";

export interface InstructorProfileResponse {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday: string;
  role: number;
  organizationId?: string;
  organizationName?: string;
  bio?: string;
  expertises: string[];
  yearsOfExperience: number;
  rating: number;
  coursesCount: number;
  isActive: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateInstructorProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertises?: string[];
  yearsOfExperience?: number;
}

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

class InstructorProfileService {
  private readonly baseUrl = "/api/InstructorProfile";

  async getCurrentProfile(): Promise<InstructorProfileResponse> {
    return await httpService.get<InstructorProfileResponse>(
      `${this.baseUrl}/current-profile`
    );
  }

  async updateCurrentProfile(
    request: UpdateInstructorProfileRequest
  ): Promise<InstructorProfileResponse> {
    return await httpService.put<InstructorProfileResponse>(
      `${this.baseUrl}/current-profile`,
      request
    );
  }

  async getProfileByUserId(userId: string): Promise<InstructorProfileResponse> {
    return await httpService.get<InstructorProfileResponse>(
      `${this.baseUrl}/user/${userId}`
    );
  }
}

export const instructorProfileService = new InstructorProfileService();
