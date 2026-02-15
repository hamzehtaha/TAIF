export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  isActive: boolean;
  isCompleted: boolean;
  interests?: string[];
  role: number;
  organizationId?: string;
  organizationName?: string;
  createdAt?: string;
  updatedAt?: string;
}