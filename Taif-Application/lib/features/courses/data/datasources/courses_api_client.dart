import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/utils/logger.dart';
import '../../../home/data/models/course_model.dart';
import '../models/category_model.dart';

/// Courses API Client
/// Handles all course-related API calls
class CoursesApiClient {
  final Dio _dio;

  CoursesApiClient() : _dio = NetworkClient().dio;

  /// GET /api/Course
  /// Get all published courses
  Future<List<CourseModel>> getCourses() async {
    try {
      AppLogger.info('GET /api/Course - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Course');
      AppLogger.info('GET /api/Course - Response status: ${response.statusCode}');
      
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => CourseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/Course - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load courses');
    }
  }

  /// GET /api/Course/category/{categoryId}
  /// Get courses by category ID
  Future<List<CourseModel>> getCoursesByCategory(String categoryId) async {
    try {
      AppLogger.info('GET /api/Course/category/$categoryId - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>(
        '/Course/category/$categoryId',
      );
      AppLogger.info('GET /api/Course/category/$categoryId - Response status: ${response.statusCode}');
      
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => CourseModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/Course/category/$categoryId - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load courses for category');
    }
  }

  /// GET /api/Category
  /// Get all categories
  Future<List<CategoryModel>> getCategories() async {
    try {
      AppLogger.info('GET /api/Category - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Category');
      AppLogger.info('GET /api/Category - Response status: ${response.statusCode}');
      
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => CategoryModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/Category - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load categories');
    }
  }

  /// GET /api/Course/recommended
  /// Get recommended courses for the current user
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
      // 404 means no recommendations available
      if (e.response?.statusCode == 404) {
        return [];
      }
      AppLogger.error('GET /api/Course/recommended - Error: ${e.message}');
      throw _handleDioError(e, 'Failed to load recommended courses');
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
