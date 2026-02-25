export interface Lesson {
  id: string;
  title: string;
  description?: string;
  duration: number;
  order: number;
  isCompleted?: boolean;
  photo?: string;
  courseId: string;
  instructorId?: string;
  instructor?: Instructor;
  createdAt?: string;
  updatedAt?: string;
}

export interface Instructor {
  id: string;
  firstName: string;
  lastName: string;
  bio?: string;
  expertises?: string[];
  yearsOfExperience?: number;
}