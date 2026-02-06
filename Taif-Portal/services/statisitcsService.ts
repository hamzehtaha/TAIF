export interface CourseStatistics {
  enrolledStudents: number;
}
class StatisticsService {
  /**
   * Get course statistics
   * GET /api/statistics/course/{courseId}
   */

  

  async getCourseStatistics(courseId: string): Promise<CourseStatistics> {
    return { enrolledStudents: 2 };
  }

 
}

export const statisticsService = new StatisticsService();
