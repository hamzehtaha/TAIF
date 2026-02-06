/**
 * Backend DTOs - Matches backend Interest entity
 */

export interface InterestDto {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateInterestsRequest {
  interests: string[];
}
