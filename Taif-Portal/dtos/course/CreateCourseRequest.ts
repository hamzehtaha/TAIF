export interface CreateCourseRequest {
  name: string;
  description: string;
  photo: string;
  categoryId: string;
  tags: string[];
}
