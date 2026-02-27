import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/utils/logger.dart';
import '../models/course_model.dart';
import '../models/enrollment_model.dart';

/// Home API Client
/// Handles all home/dashboard-related API calls
class HomeApiClient {
  final Dio _dio;

  HomeApiClient() : _dio = NetworkClient().dio;

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

  /// GET /api/Course/recommended
  /// Get recommended courses based on user interests
  /// Returns empty list if 404 (no recommendations available)
  Future<List<CourseModel>> getRecommendedCourses({int limit = 10}) async {
    try {
      AppLogger.info('GET /api/Course/recommended - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>(
        '/Course/recommended',
        queryParameters: {'limit': limit},
      );
      AppLogger.info('GET /api/Course/recommended - Response status: ${response.statusCode}');
      
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => CourseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      // 404 means no recommendations available (user has no interests)
      if (e.response?.statusCode == 404) {
        AppLogger.info('GET /api/Course/recommended - No recommendations available (404)');
        return [];
      }
      AppLogger.error('GET /api/Course/recommended - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load recommended courses');
    }
  }

  /// GET /api/enrollments/details/{courseId}/progress
  /// Get enrollment details with progress for a specific course
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
      AppLogger.error('GET /api/enrollments/details/$courseId/progress - Error: ${e.message}');
      return null;
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
