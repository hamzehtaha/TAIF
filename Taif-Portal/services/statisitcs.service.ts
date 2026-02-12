export interface CourseStatistics {
  enrolledStudents: number;
}
class StatisticsService {

  async getCourseStatistics(courseId: string): Promise<CourseStatistics> {
    return { enrolledStudents: 2 };
  }


}

export const statisticsService = new StatisticsService();
