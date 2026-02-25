import { httpService } from "@/services/http.service";

export interface Organization {
  id: string;
  name: string;
  slug?: string;
  identity?: string;
  type: number;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  website?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrganizationRequest {
  name: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  logo?: string;
  description?: string;
  email?: string;
  phone?: string;
  isActive?: boolean;
}

class OrganizationService {
  async getAll(): Promise<Organization[]> {
    return httpService.get<Organization[]>("/api/Organization");
  }

  async getById(id: string): Promise<Organization> {
    return httpService.get<Organization>(`/api/Organization/${id}`);
  }

  async create(request: CreateOrganizationRequest): Promise<Organization> {
    return httpService.post<Organization>("/api/Organization", request);
  }

  async update(id: string, request: UpdateOrganizationRequest): Promise<Organization> {
    return httpService.put<Organization>(`/api/Organization/${id}`, request);
  }

  async delete(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/Organization/${id}`);
  }
}

export const organizationService = new OrganizationService();
