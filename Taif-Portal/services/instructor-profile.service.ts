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

export interface CreateInstructorProfileRequest {
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

  async createProfile(request: CreateInstructorProfileRequest = {}): Promise<InstructorProfileResponse> {
    return await httpService.post<InstructorProfileResponse>(
      this.baseUrl,
      request
    );
  }

  async getOrCreateCurrentProfile(): Promise<InstructorProfileResponse> {
    try {
      return await this.getCurrentProfile();
    } catch (error: unknown) {
      // If 404, create the profile
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404')) {
        return await this.createProfile({});
      }
      throw error;
    }
  }
}

export const instructorProfileService = new InstructorProfileService();
