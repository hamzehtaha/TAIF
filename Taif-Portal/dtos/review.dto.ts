export interface ReviewDto {
  id: string;
  courseId: string;
  userId: string;
  userFirstName?: string;
  userLastName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  courseId: string;
  rating: number;
  comment: string;
}

export interface ReviewStatisticsDto {
  averageRating: number;
  totalReviews: number;
}
