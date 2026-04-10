import 'package:dio/dio.dart';
import '../../../../core/utils/logger.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/content_model.dart';

/// Lesson API Client
/// Handles all lesson-related API calls
class LessonApiClient {
  final Dio _dio;

  LessonApiClient(this._dio);

  /// Get lesson by ID
  Future<LessonModel?> getLesson(String lessonId) async {
    try {
      AppLogger.info('API: Getting lesson $lessonId');
      final response = await _dio.get('/Lesson/$lessonId');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return LessonModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      AppLogger.error('API Error getting lesson: ${e.message}');
      return null;
    } catch (e) {
      AppLogger.error('Unexpected error getting lesson: $e');
      return null;
    }
  }

  /// Get lesson items by lesson ID
  Future<List<LessonItemModel>> getLessonItems(
    String lessonId,
    String courseId,
  ) async {
    try {
      AppLogger.info('API: Getting lesson items for lesson $lessonId with course $courseId');
      final response = await _dio.get(
        '/LessonItem/lessonProgress/$lessonId',
        queryParameters: {'courseId': courseId},
      );
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data?['data'] as List<dynamic>? ?? [];
        AppLogger.info(
            'GET /Lesson/$lessonId/items?courseId=$courseId - Raw response data: $data');
        return data
            .map((e) => LessonItemModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      AppLogger.error('API Error getting lesson items: ${e.message}');
      return [];
    } catch (e) {
      AppLogger.error('Unexpected error getting lesson items: $e');
      return [];
    }
  }

  /// Get content by ID
  Future<ContentModel?> getContent(String contentId) async {
    try {
      AppLogger.info('API: Getting content $contentId');
      final response = await _dio.get('/Content/$contentId');
      
      if (response.statusCode == 200 && response.data != null) {
        final data = response.data['data'] ?? response.data;
        if (data is Map<String, dynamic>) {
          return ContentModel.fromJson(data);
        }
      }
      return null;
    } on DioException catch (e) {
      AppLogger.error('API Error getting content: ${e.message}');
      return null;
    } catch (e) {
      AppLogger.error('Unexpected error getting content: $e');
      return null;
    }
  }

  /// Mark lesson item as completed
  Future<bool> markLessonItemAsCompleted({
    required String courseId,
    required String lessonId,
    required String lessonItemId,
  }) async {
    try {
      AppLogger.info('API: Marking lesson item $lessonItemId as completed');
      final response = await _dio.post(
        '/LessonItemProgress',
        data: {
          'courseId': courseId,
          'lessonId': lessonId,
          'lessonItemId': lessonItemId,
        },
      );
      
      return response.statusCode == 200 || response.statusCode == 201;
    } on DioException catch (e) {
      AppLogger.error('API Error marking lesson item as completed: ${e.message}');
      return false;
    } catch (e) {
      AppLogger.error('Unexpected error marking lesson item as completed: $e');
      return false;
    }
  }

  /// Update last accessed lesson item
  Future<bool> updateLastLessonItem({
    required String courseId,
    required String lessonItemId,
  }) async {
    try {
      AppLogger.info('API: Updating last lesson item to $lessonItemId');
      final response = await _dio.put(
        '/LessonItemProgress/updateLastLessonItem',
        data: {
          'courseId': courseId,
          'lessonItemId': lessonItemId,
        },
      );
      
      return response.statusCode == 200 || response.statusCode == 204;
    } on DioException catch (e) {
      AppLogger.error('API Error updating last lesson item: ${e.message}');
      return false;
    } catch (e) {
      AppLogger.error('Unexpected error updating last lesson item: $e');
      return false;
    }
  }
}
