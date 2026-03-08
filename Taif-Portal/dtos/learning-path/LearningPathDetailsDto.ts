import { LearningPathSectionDto } from "./index";


export interface LearningPathDetailsDto {
  id: string;
  name: string;
  description?: string;
  photo?: string;
  totalEnrolled: number;
  durationInSeconds: number;
  createdAt: string;
  isEnrolled: boolean;
  sections: LearningPathSectionDto[];
}
