export type CourseStatus = 'draft' | 'published' | 'archived';

export interface CourseDto {
  id: string;
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  };
  tags?: string[];
  status?: number; // 0=Draft, 1=Published, 2=Archived
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
  categoryId?: string;
  tags?: string[];
}
