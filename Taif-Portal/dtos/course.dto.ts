export interface CourseDto {
  id: string;
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  rating?: number;
  reviewCount?: number;
  totalDurationInSeconds?: number;
  totalEnrolled?: number;
  isRecommended?: boolean;
  progress?: number;
}


export interface CreateCourseRequest {
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  tags: string[];
}

export interface UpdateCourseRequest {
  name?: string;
  description?: string;
  photo?: string;
  tags?: string[];
}
