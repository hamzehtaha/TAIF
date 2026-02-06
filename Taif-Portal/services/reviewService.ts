import { httpService } from "./httpService";
import {
  ReviewDto,
  CreateReviewRequest,
  ReviewStatisticsDto,
} from "@/dtos/review/ReviewDto";

export interface Review {
  id: string;
  courseId: string;
  userId: string;
  userName?: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewStatistics {
  averageRating: number;
  totalReviews: number;
}

class ReviewService {
  /**
   * Submit a new review for a course
   * POST /api/Review
   */
  async submitReview(courseId: string, rating: number, comment: string): Promise<Review> {
    const request: CreateReviewRequest = {
      courseId,
      rating,
      comment,
    };
    const dto = await httpService.post<ReviewDto>("/api/reviews", request);
    return this.mapDtoToModel(dto);
  }

  /**
   * Get all reviews for a specific course
   * GET /api/reviews/course/{courseId}
   */
  async getCourseReviews(courseId: string): Promise<Review[]> {
    const dtos = await httpService.get<ReviewDto[]>(`/api/reviews/course/${courseId}`);
    return dtos.map(this.mapDtoToModel);
  }

  /**
   * Check if current user has already reviewed a course
   * GET /api/reviews/course/{courseId}/has-reviewed
   */
  async hasUserReviewedCourse(courseId: string): Promise<boolean> {
    return httpService.get<boolean>(`/api/reviews/course/${courseId}/has-reviewed`);
  }

  /**
   * Get review statistics for a course (average rating and total reviews)
   * GET /api/reviews/course/{courseId}/statistics
   */
  async getCourseReviewStatistics(courseId: string): Promise<ReviewStatistics> {
    const dto = await httpService.get<ReviewStatisticsDto>(`/api/reviews/course/${courseId}/statistics`);
    return {
      averageRating: dto.averageRating,
      totalReviews: dto.totalReviews,
    };
  }

  /**
   * Map backend DTO to frontend model
   */
  private mapDtoToModel(dto: ReviewDto): Review {
    return {
      id: dto.id,
      courseId: dto.courseId,
      userId: dto.userId,
      userName: dto.userFirstName + " " + dto.userLastName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }
}

export const reviewService = new ReviewService();
