import '../../../home/data/models/course_model.dart';
import '../datasources/courses_api_client.dart';
import '../models/category_model.dart';

/// Courses Repository
/// Coordinates data fetching for courses and categories
/// Enriches courses with category names and recommendation status
class CoursesRepository {
  final CoursesApiClient _apiClient;

  CoursesRepository() : _apiClient = CoursesApiClient();

  /// Get all published courses enriched with category names and recommendation status
  Future<List<CourseModel>> getCourses() async {
    // Load courses, categories, and recommended courses in parallel
    final results = await Future.wait([
      _apiClient.getCourses(),
      _apiClient.getCategories(),
      _apiClient.getRecommendedCourses(),
    ]);

    final courses = results[0] as List<CourseModel>;
    final categories = results[1] as List<CategoryModel>;
    final recommended = results[2] as List<CourseModel>;

    // Enrich courses with category names and recommendation status
    return _enrichCourses(courses, categories, recommended);
  }

  /// Get courses by category ID
  Future<List<CourseModel>> getCoursesByCategory(String categoryId) async {
    if (categoryId.isEmpty) {
      return await getCourses();
    }
    
    // Load filtered courses, categories, and recommended courses
    final results = await Future.wait([
      _apiClient.getCoursesByCategory(categoryId),
      _apiClient.getCategories(),
      _apiClient.getRecommendedCourses(),
    ]);

    final courses = results[0] as List<CourseModel>;
    final categories = results[1] as List<CategoryModel>;
    final recommended = results[2] as List<CourseModel>;

    return _enrichCourses(courses, categories, recommended);
  }

  /// Get all categories
  Future<List<CategoryModel>> getCategories() async {
    return await _apiClient.getCategories();
  }

  /// Enrich courses with category names and recommendation status
  List<CourseModel> _enrichCourses(
    List<CourseModel> courses,
    List<CategoryModel> categories,
    List<CourseModel> recommendedCourses,
  ) {
    // Build category lookup map
    final categoryMap = {
      for (final cat in categories) cat.id: cat.name,
    };

    // Build recommended course IDs set
    final recommendedIds = {
      for (final rec in recommendedCourses) rec.id,
    };

    // Enrich each course with category name and recommendation status
    return courses.map((course) {
      // Get category name if missing
      String? categoryName = course.categoryName;
      if (categoryName == null || categoryName.isEmpty) {
        categoryName = categoryMap[course.categoryId];
      }

      // Check if course is recommended for this user
      final isRecommended = recommendedIds.contains(course.id);

      // Only create new instance if something changed
      if (categoryName != course.categoryName || isRecommended != course.isRecommended) {
        return CourseModel(
          id: course.id,
          title: course.title,
          description: course.description,
          imageUrl: course.imageUrl,
          categoryId: course.categoryId,
          categoryName: categoryName,
          durationInMinutes: course.durationInMinutes,
          rating: course.rating,
          reviewCount: course.reviewCount,
          progress: course.progress,
          isEnrolled: course.isEnrolled,
          isRecommended: isRecommended,
        );
      }
      return course;
    }).toList();
  }
}
