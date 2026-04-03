import '../datasources/lesson_api_client.dart';
import '../models/content_model.dart';
import '../models/lesson_model.dart';

/// Lesson Repository
/// Handles lesson data operations and business logic
class LessonRepository {
  final LessonApiClient _apiClient;

  LessonRepository(this._apiClient);

  /// Get lesson with its items (including user completion status)
  Future<LessonWithItems?> getLessonWithItems({
    required String lessonId,
    required String courseId,
  }) async {
    final lesson = await _apiClient.getLesson(lessonId);
    if (lesson == null) return null;

    final items = await _apiClient.getLessonItems(lessonId, courseId);
    
    return LessonWithItems(
      lesson: lesson,
      items: items,
    );
  }

  /// Get content for a lesson item
  Future<ContentModel?> getContent(String contentId) async {
    return await _apiClient.getContent(contentId);
  }

  /// Mark lesson item as completed
  Future<bool> markItemAsCompleted({
    required String courseId,
    required String lessonId,
    required String lessonItemId,
  }) async {
    return await _apiClient.markLessonItemAsCompleted(
      courseId: courseId,
      lessonId: lessonId,
      lessonItemId: lessonItemId,
    );
  }

  /// Update last accessed lesson item
  Future<bool> updateLastLessonItem({
    required String courseId,
    required String lessonItemId,
  }) async {
    return await _apiClient.updateLastLessonItem(
      courseId: courseId,
      lessonItemId: lessonItemId,
    );
  }

  /// Find the next incomplete item in a lesson
  LessonItemModel? findNextIncompleteItem(LessonModel lesson) {
    for (final item in lesson.items) {
      if (!item.isCompleted) {
        return item;
      }
    }
    return null;
  }

  /// Check if all items in a lesson are completed
  bool isLessonCompleted(LessonModel lesson) {
    if (lesson.items.isEmpty) return false;
    return lesson.items.every((item) => item.isCompleted);
  }
}

/// Lesson with Items Model
class LessonWithItems {
  final LessonModel lesson;
  final List<LessonItemModel> items;

  LessonWithItems({
    required this.lesson,
    required this.items,
  });
}
