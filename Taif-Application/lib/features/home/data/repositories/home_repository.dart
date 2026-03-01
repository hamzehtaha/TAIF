import '../datasources/home_api_client.dart';
import '../models/course_model.dart';
import '../../../auth/domain/entities/user.dart';
import '../../../auth/data/repositories/auth_repository_impl.dart';

/// Home Repository
/// Handles data operations for the home screen
class HomeRepository {
  final HomeApiClient _apiClient;
  final AuthRepositoryImpl _authRepository;

  HomeRepository() 
      : _apiClient = HomeApiClient(),
        _authRepository = AuthRepositoryImpl();

  /// Get current user
  Future<User?> getCurrentUser() async {
    try {
      return await _authRepository.getCurrentUser();
    } catch (e) {
      return null;
    }
  }

  /// Get user's enrolled courses with progress
  Future<List<CourseModel>> getUserCoursesWithProgress() async {
    final courses = await _apiClient.getUserCourses();
    
    // Fetch progress for each course
    final coursesWithProgress = await Future.wait(
      courses.map((course) async {
        final enrollment = await _apiClient.getEnrollmentProgress(course.id);
        if (enrollment != null && enrollment.totalDurationInSeconds != null && enrollment.totalDurationInSeconds! > 0) {
          final progress = enrollment.calculatedProgress;
          return CourseModel(
            id: course.id,
            title: course.title,
            description: course.description,
            imageUrl: course.imageUrl,
            categoryId: course.categoryId,
            categoryName: course.categoryName,
            durationInMinutes: course.durationInMinutes,
            rating: course.rating,
            reviewCount: course.reviewCount,
            progress: progress,
            isEnrolled: true,
          );
        }
        return course;
      }),
    );
    
    return coursesWithProgress;
  }

  /// Get recommended courses
  Future<List<CourseModel>> getRecommendedCourses() async {
    return await _apiClient.getRecommendedCourses(limit: 10);
  }
}
