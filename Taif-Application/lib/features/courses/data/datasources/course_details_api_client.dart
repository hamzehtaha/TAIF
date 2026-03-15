import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/utils/logger.dart';
import '../../../home/data/models/course_model.dart';
import '../models/enrollment_model.dart';
import '../models/lesson_model.dart';
import '../models/review_model.dart';

/// Course Details API Client
/// Handles all course details related API calls including:
/// - Course details by ID
/// - Lessons and lesson items
/// - Enrollment status
/// - Reviews
class CourseDetailsApiClient {
  final Dio _dio;

  CourseDetailsApiClient() : _dio = NetworkClient().dio;

  /// GET /api/Course/{id}
  /// Get course details by ID
  Future<CourseModel> getCourseById(String id) async {
    try {
      AppLogger.info('GET /api/Course/$id - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Course/$id');
      AppLogger.info('GET /api/Course/$id - Response status: ${response.statusCode}');

      final data = response.data?['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return CourseModel.fromJson(data);
      }
      throw Exception('Invalid response format');
    } on DioException catch (e) {
      AppLogger.error('GET /api/Course/$id - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load course details');
    }
  }

  /// GET /api/Lesson/course/{courseId}
  /// Get lessons for a course
  Future<List<LessonModel>> getLessonsByCourse(String courseId) async {
    try {
      AppLogger.info('GET /api/Lesson/course/$courseId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Lesson/course/$courseId');
      AppLogger.info('GET /api/Lesson/course/$courseId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => LessonModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/Lesson/course/$courseId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load lessons');
    }
  }

  /// GET /api/LessonItem/lesson/{lessonId}
  /// Get lesson items for a lesson (without progress)
  Future<List<LessonItemModel>> getLessonItems(String lessonId) async {
    try {
      AppLogger.info('GET /api/LessonItem/lesson/$lessonId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/LessonItem/lesson/$lessonId');
      AppLogger.info('GET /api/LessonItem/lesson/$lessonId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => LessonItemModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/LessonItem/lesson/$lessonId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load lesson items');
    }
  }

  /// GET /api/LessonItem/lessonProgress/{lessonId}
  /// Get lesson items with progress for enrolled users
  Future<List<LessonItemModel>> getLessonItemsWithProgress(String lessonId) async {
    try {
      AppLogger.info('GET /api/LessonItem/lessonProgress/$lessonId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/LessonItem/lessonProgress/$lessonId');
      AppLogger.info('GET /api/LessonItem/lessonProgress/$lessonId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => LessonItemModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/LessonItem/lessonProgress/$lessonId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load lesson items with progress');
    }
  }

  /// GET /api/enrollments/details/{courseId}
  /// Get enrollment details for a course
  Future<EnrollmentModel?> getEnrollmentByCourse(String courseId) async {
    try {
      AppLogger.info('GET /api/enrollments/details/$courseId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/enrollments/details/$courseId');
      AppLogger.info('GET /api/enrollments/details/$courseId - Response status: ${response.statusCode}');

      final data = response.data?['data'] ?? response.data;
      AppLogger.info('GET /api/enrollments/details/$courseId - Raw data: $data');
      if (data is Map<String, dynamic>) {
        final enrollment = EnrollmentModel.fromJson(data);
        AppLogger.info('GET /api/enrollments/details/$courseId - Parsed: id=${enrollment.id}, courseId=${enrollment.courseId}');
        return enrollment;
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      AppLogger.error('GET /api/enrollments/details/$courseId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load enrollment details');
    }
  }

  /// GET /api/enrollments/user
  /// Get user's enrolled courses
  Future<List<String>> getUserEnrolledCourseIds() async {
    try {
      AppLogger.info('GET /api/enrollments/user - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/enrollments/user');
      AppLogger.info('GET /api/enrollments/user - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => (json as Map<String, dynamic>)['id'] as String? ?? '')
          .where((id) => id.isNotEmpty)
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/enrollments/user - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load enrolled courses');
    }
  }

  /// GET /api/enrollments/favourite/course
  /// Get user's favourite courses
  Future<List<String>> getUserFavouriteCourseIds() async {
    try {
      AppLogger.info('GET /api/enrollments/favourite/course - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/enrollments/favourite/course');
      AppLogger.info('GET /api/enrollments/favourite/course - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => (json as Map<String, dynamic>)['id'] as String? ?? '')
          .where((id) => id.isNotEmpty)
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/enrollments/favourite/course - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load favourite courses');
    }
  }

  /// POST /api/enrollments
  /// Enroll in a course
  Future<EnrollmentModel> enroll(String courseId) async {
    try {
      AppLogger.info('POST /api/enrollments - Enrolling in course: $courseId');
      final response = await _dio.post<Map<String, dynamic>>(
        '/enrollments',
        data: {'courseId': courseId},
      );
      AppLogger.info('POST /api/enrollments - Response status: ${response.statusCode}');

      final data = response.data?['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return EnrollmentModel.fromJson(data);
      }
      throw Exception('Invalid response format');
    } on DioException catch (e) {
      AppLogger.error('POST /api/enrollments - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to enroll in course');
    }
  }

  /// PUT /api/enrollments/toggleFavourite
  /// Toggle favourite status for a course
  Future<bool> toggleFavourite(String courseId) async {
    try {
      AppLogger.info('PUT /api/enrollments/toggleFavourite - Toggling favourite for: $courseId');
      final response = await _dio.put<Map<String, dynamic>>(
        '/enrollments/toggleFavourite',
        data: {'courseId': courseId},
      );
      AppLogger.info('PUT /api/enrollments/toggleFavourite - Response status: ${response.statusCode}');

      return response.data?['data'] as bool? ?? false;
    } on DioException catch (e) {
      AppLogger.error('PUT /api/enrollments/toggleFavourite - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to toggle favourite');
    }
  }

  /// GET /api/reviews/course/{courseId}
  /// Get reviews for a course
  Future<List<ReviewModel>> getCourseReviews(String courseId) async {
    try {
      AppLogger.info('GET /api/reviews/course/$courseId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/reviews/course/$courseId');
      AppLogger.info('GET /api/reviews/course/$courseId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => ReviewModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/reviews/course/$courseId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load reviews');
    }
  }

  /// GET /api/reviews/course/{courseId}/statistics
  /// Get review statistics for a course
  Future<ReviewStatisticsModel?> getCourseReviewStatistics(String courseId) async {
    try {
      AppLogger.info('GET /api/reviews/course/$courseId/statistics - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/reviews/course/$courseId/statistics');
      AppLogger.info('GET /api/reviews/course/$courseId/statistics - Response status: ${response.statusCode}');

      final data = response.data?['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return ReviewStatisticsModel.fromJson(data);
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null;
      }
      AppLogger.error('GET /api/reviews/course/$courseId/statistics - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load review statistics');
    }
  }

  /// GET /api/reviews/course/{courseId}/has-reviewed
  /// Check if user has reviewed a course
  Future<bool> hasUserReviewedCourse(String courseId) async {
    try {
      AppLogger.info('GET /api/reviews/course/$courseId/has-reviewed - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/reviews/course/$courseId/has-reviewed');
      AppLogger.info('GET /api/reviews/course/$courseId/has-reviewed - Response status: ${response.statusCode}');

      return response.data?['data'] as bool? ?? false;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return false;
      }
      AppLogger.error('GET /api/reviews/course/$courseId/has-reviewed - Error: ${e.message}');
      return false;
    }
  }

  /// POST /api/reviews
  /// Submit a review for a course
  Future<ReviewModel> submitReview({
    required String courseId,
    required int rating,
    required String comment,
  }) async {
    try {
      AppLogger.info('POST /api/reviews - Submitting review for: $courseId');
      final response = await _dio.post<Map<String, dynamic>>(
        '/reviews',
        data: {
          'courseId': courseId,
          'rating': rating,
          'comment': comment,
        },
      );
      AppLogger.info('POST /api/reviews - Response status: ${response.statusCode}');

      final data = response.data?['data'] ?? response.data;
      if (data is Map<String, dynamic>) {
        return ReviewModel.fromJson(data);
      }
      throw Exception('Invalid response format');
    } on DioException catch (e) {
      AppLogger.error('POST /api/reviews - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to submit review');
    }
  }

  Exception _handleDioError(DioException e, String defaultMessage) {
    if (e.response != null) {
      final statusCode = e.response?.statusCode;
      final data = e.response?.data;

      if (data is Map<String, dynamic> && data.containsKey('message')) {
        return Exception(data['message'] as String);
      }

      switch (statusCode) {
        case 401:
          return Exception('Session expired. Please sign in again.');
        case 403:
          return Exception('Not authorized to perform this action.');
        case 404:
          return Exception('Resource not found.');
        case 500:
          return Exception('Server error. Please try again later.');
        default:
          return Exception('$defaultMessage (Error $statusCode)');
      }
    }

    if (e.type == DioExceptionType.connectionTimeout) {
      return Exception('Connection timeout. Please check your internet.');
    }

    if (e.type == DioExceptionType.connectionError) {
      return Exception('No internet connection. Please check your network.');
    }

    return Exception(defaultMessage);
  }
}
