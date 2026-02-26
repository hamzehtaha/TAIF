import { httpService } from "@/services/http.service";

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  expertises?: string[];
  yearsOfExperience?: number;
  organizationId?: string;
}

export interface CreateInstructorRequest {
  firstName: string;
  lastName: string;
  bio?: string;
  expertises?: string[];
  yearsOfExperience?: number;
}

export interface UpdateInstructorRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  expertises?: string[];
  yearsOfExperience?: number;
}

class InstructorService {
  async getAll(): Promise<Instructor[]> {
    return httpService.get<Instructor[]>("/api/Instructor");
  }

  async getById(id: string): Promise<Instructor> {
    return httpService.get<Instructor>(`/api/Instructor/${id}`);
  }

  async create(request: CreateInstructorRequest): Promise<Instructor> {
    return httpService.post<Instructor>("/api/Instructor", request);
  }

  async update(id: string, request: UpdateInstructorRequest): Promise<Instructor> {
    return httpService.put<Instructor>(`/api/Instructor/${id}`, request);
  }

  async delete(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Instructor/${id}`);
  }
}

export const instructorService = new InstructorService();
