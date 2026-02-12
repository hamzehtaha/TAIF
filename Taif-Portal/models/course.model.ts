import { Lesson } from "@/models/lesson.model";


export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  imageUrl?: string;
  categoryId: string;
  categoryName?: string;
  isEnrolled?: boolean;
  isFavourite?: boolean;
  isRecommended?: boolean;
  lessons?: Lesson[];
  rating?: number;
  reviewCount?: number;
  durationInMinutes?: number;
  progress?: number;
  totalEnrolled?: number;
}
