import '../datasources/progress_api_client.dart';
import '../../../../features/home/data/models/course_model.dart';
import '../../../../features/courses/data/models/enrollment_model.dart';
import '../../../../features/courses/data/models/lesson_model.dart';

/// Course Progress Data
/// Contains course information with enrollment progress details
class CourseProgressData {
  final CourseModel course;
  final EnrollmentModel? enrollment;
  final int completedItems;
  final int totalItems;

  CourseProgressData({
    required this.course,
    this.enrollment,
    this.completedItems = 0,
    this.totalItems = 0,
  });

  /// Calculate progress percentage
  int get progressPercentage {
    if (enrollment != null && enrollment!.calculatedProgress > 0) {
      return enrollment!.calculatedProgress;
    }
    if (totalItems > 0) {
      return ((completedItems / totalItems) * 100).round();
    }
    return 0;
  }

  /// Get formatted completed items text (e.g., "1/7 items completed")
  String get completedItemsText {
    return '$completedItems/$totalItems items completed';
  }

  /// Check if course is completed
  bool get isCompleted => enrollment?.isCompleted ?? false;

  /// Get completed hours from enrollment
  double get completedHours {
    if (enrollment?.completedDurationInSeconds != null) {
      return enrollment!.completedDurationInSeconds! / 3600;
    }
    return 0;
  }
}

/// User Progress Summary
/// Contains aggregated progress statistics
class UserProgressSummary {
  final int enrolledCount;
  final double totalHours;
  final int averageProgress;
  final int certificatesCount;
  final List<CourseProgressData> courses;

  UserProgressSummary({
    this.enrolledCount = 0,
    this.totalHours = 0,
    this.averageProgress = 0,
    this.certificatesCount = 0,
    this.courses = const [],
  });

  /// Get formatted total hours (e.g., "5.2")
  String get totalHoursFormatted => totalHours.toStringAsFixed(1);

  /// Get formatted average progress with % (e.g., "5%")
  String get averageProgressFormatted => '$averageProgress%';
}

/// Progress Repository
/// Handles data operations for the progress screen
class ProgressRepository {
  final ProgressApiClient _apiClient;

  ProgressRepository() : _apiClient = ProgressApiClient();

  /// Get user's progress summary with all enrolled courses
  Future<UserProgressSummary> getUserProgressSummary() async {
    // Get user's enrolled courses
    final courses = await _apiClient.getUserCourses();

    if (courses.isEmpty) {
      return UserProgressSummary();
    }

    // Fetch detailed progress for each course
    final coursesProgress = await Future.wait(
      courses.map((course) => _getCourseProgressData(course)),
    );

    // Calculate summary statistics
    final enrolledCount = courses.length;
    final totalHours = coursesProgress.fold<double>(
      0,
      (sum, cp) => sum + cp.completedHours,
    );
    final averageProgress = coursesProgress.isEmpty
        ? 0
        : coursesProgress.fold<int>(
              0,
              (sum, cp) => sum + cp.progressPercentage,
            ) ~/
            coursesProgress.length;
    final certificatesCount = coursesProgress.where((cp) => cp.isCompleted).length;

    return UserProgressSummary(
      enrolledCount: enrolledCount,
      totalHours: double.parse(totalHours.toStringAsFixed(1)),
      averageProgress: averageProgress,
      certificatesCount: certificatesCount,
      courses: coursesProgress,
    );
  }

  /// Get progress data for a specific course
  Future<CourseProgressData> _getCourseProgressData(CourseModel course) async {
    // Get enrollment progress with duration data
    final enrollment = await _apiClient.getEnrollmentProgress(course.id);

    // Get lessons for this course
    final lessonsData = await _apiClient.getLessonsByCourse(course.id);

    // Calculate total items and completed items
    int totalItems = 0;
    int completedItems = 0;

    for (final lessonJson in lessonsData) {
      final lesson = LessonModel.fromJson(lessonJson);

      // Get items for this lesson
      final itemsData = await _apiClient.getLessonItems(lesson.id);
      totalItems += itemsData.length;

      // Count completed items based on progress
      // This is a simplified calculation - in reality, you'd check each item's completion status
      // For now, we estimate based on overall progress percentage
    }

    // If we have enrollment with duration-based progress, use that to estimate completed items
    if (enrollment != null && enrollment.calculatedProgress > 0 && totalItems > 0) {
      completedItems = ((enrollment.calculatedProgress / 100) * totalItems).round();
    }

    return CourseProgressData(
      course: course,
      enrollment: enrollment,
      completedItems: completedItems,
      totalItems: totalItems,
    );
  }
}
