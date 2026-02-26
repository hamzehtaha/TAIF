import { httpService } from "@/services/http.service";

export enum UserRoleType {
  SuperAdmin = 0,
  Admin = 1,
  ContentCreator = 2,
  Student = 3
}

export const RoleLabels: Record<number, string> = {
  0: "Super Admin",
  1: "Admin",
  2: "Content Creator",
  3: "Student"
};

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRoleType;
  roleName: string;
  isActive: boolean;
  emailVerified: boolean;
  organizationId?: string;
  createdAt?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRoleType;
  isActive?: boolean;
  organizationId?: string | null; // null to clear, undefined to keep unchanged
}

export interface UpdateUserRoleRequest {
  role: UserRoleType;
}

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRoleType;
  birthday?: string;
}

class UserService {
  async getAll(): Promise<User[]> {
    return httpService.get<User[]>("/api/User");
  }

  async getAllStudents(): Promise<User[]> {
    return httpService.get<User[]>("/api/User/students");
  }

  async create(request: CreateUserRequest): Promise<User> {
    return httpService.post<User>("/api/User", request);
  }

  async getById(id: string): Promise<User> {
    return httpService.get<User>(`/api/User/${id}`);
  }

  async update(id: string, request: UpdateUserRequest): Promise<User> {
    return httpService.put<User>(`/api/User/${id}`, request);
  }

  async updateRole(id: string, role: UserRoleType): Promise<User> {
    return httpService.put<User>(`/api/User/${id}/role`, { role });
  }

  async delete(id: string): Promise<boolean> {
    return httpService.delete<boolean>(`/api/User/${id}`);
  }
}

export const userService = new UserService();
