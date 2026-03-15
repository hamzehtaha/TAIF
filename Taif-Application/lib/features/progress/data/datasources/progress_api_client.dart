import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/utils/logger.dart';
import '../../../../features/home/data/models/course_model.dart';
import '../../../../features/courses/data/models/enrollment_model.dart';

/// Progress API Client
/// Handles all progress-related API calls
class ProgressApiClient {
  final Dio _dio;

  ProgressApiClient() : _dio = NetworkClient().dio;

  /// GET /api/enrollments/user
  /// Get current user's enrolled courses
  Future<List<CourseModel>> getUserCourses() async {
    try {
      AppLogger.info('GET /api/enrollments/user - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/enrollments/user');
      AppLogger.info('GET /api/enrollments/user - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => CourseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/enrollments/user - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load your courses');
    }
  }

  /// GET /api/enrollments/details/{courseId}/progress
  /// Get enrollment details with progress for a specific course
  /// Includes completedDurationInSeconds for hours calculation
  Future<EnrollmentModel?> getEnrollmentProgress(String courseId) async {
    try {
      AppLogger.info('GET /api/enrollments/details/$courseId/progress - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>(
        '/enrollments/details/$courseId/progress',
      );
      AppLogger.info('GET /api/enrollments/details/$courseId/progress - Response status: ${response.statusCode}');

      final data = response.data?['data'] as Map<String, dynamic>?;
      if (data != null) {
        return EnrollmentModel.fromJson(data);
      }
      return null;
    } on DioException catch (e) {
      // Return null if no enrollment found
      if (e.response?.statusCode == 404) {
        return null;
      }
      AppLogger.error('GET /api/enrollments/details/$courseId/progress - Error: ${e.message}');
      return null;
    }
  }

  /// GET /api/Lesson/course/{courseId}
  /// Get lessons for a course to calculate total items
  Future<List<Map<String, dynamic>>> getLessonsByCourse(String courseId) async {
    try {
      AppLogger.info('GET /api/Lesson/course/$courseId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Lesson/course/$courseId');
      AppLogger.info('GET /api/Lesson/course/$courseId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data.map((json) => json as Map<String, dynamic>).toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/Lesson/course/$courseId - Error: ${e.message}');
      return [];
    }
  }

  /// GET /api/LessonItem/lesson/{lessonId}
  /// Get lesson items for a lesson
  Future<List<Map<String, dynamic>>> getLessonItems(String lessonId) async {
    try {
      AppLogger.info('GET /api/LessonItem/lesson/$lessonId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/LessonItem/lesson/$lessonId');
      AppLogger.info('GET /api/LessonItem/lesson/$lessonId - Response status: ${response.statusCode}');

      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data.map((json) => json as Map<String, dynamic>).toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/LessonItem/lesson/$lessonId - Error: ${e.message}');
      return [];
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
