/**
 * Backend DTOs - Matches backend User entity
 */

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  birthday?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
