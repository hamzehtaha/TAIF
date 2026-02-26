import { Lesson } from "@/models/lesson.model";

export type CourseStatus = 'draft' | 'published' | 'archived';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
  status?: CourseStatus;
  isEnrolled?: boolean;
  isFavourite?: boolean;
  isRecommended?: boolean;
  isCompleted?: boolean;
  lessons?: Lesson[];
  rating?: number;
  reviewCount?: number;
  durationInMinutes?: number;
  progress?: number;
  totalEnrolled?: number;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}
