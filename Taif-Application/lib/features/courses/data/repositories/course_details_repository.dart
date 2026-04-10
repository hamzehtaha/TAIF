import '../datasources/course_details_api_client.dart';
import '../models/enrollment_model.dart';
import '../models/lesson_model.dart';
import '../models/review_model.dart';
import '../../../home/data/models/course_model.dart';
import '../../../../core/utils/logger.dart';

/// Course Details Repository
/// Handles all course details related data operations
class CourseDetailsRepository {
  final CourseDetailsApiClient _apiClient;

  CourseDetailsRepository() : _apiClient = CourseDetailsApiClient();

  /// Get full course details including:
  /// - Course info
  /// - Lessons with items
  /// - Enrollment status
  /// - Reviews and statistics
  Future<CourseDetailsResult> getCourseDetails(String courseId) async {
    try {
      AppLogger.info('Repository: Loading course details for: $courseId');

      // Load course, enrollment, reviews, and review stats in parallel
      final results = await Future.wait([
        _apiClient.getCourseById(courseId),
        _apiClient.getEnrollmentByCourse(courseId),
        _apiClient.getCourseReviews(courseId),
        _apiClient.getCourseReviewStatistics(courseId),
        _apiClient.hasUserReviewedCourse(courseId),
      ]);

      final course = results[0] as CourseModel;
      final enrollment = results[1] as EnrollmentModel?;
      final reviews = results[2] as List<ReviewModel>;
      final reviewStats = results[3] as ReviewStatisticsModel?;
      final hasReviewed = results[4] as bool;

      AppLogger.info('Repository: Parallel loaded - enrollment=${enrollment?.id}, enrollmentCourseId=${enrollment?.courseId}, requestedCourseId=$courseId');
      AppLogger.info('Repository: Course loaded - course.id=${course.id}, course.title=${course.title}');

      // Load lessons
      final lessonsData = await _apiClient.getLessonsByCourse(courseId);

      // Determine if user is enrolled
      // Enrollment is valid only if it has a non-empty id and courseId matches
      final isEnrolled = enrollment != null && 
                         enrollment.id.isNotEmpty && 
                         enrollment.courseId == courseId;
      
      AppLogger.info('Repository: Enrollment check - enrollmentId=${enrollment?.id}, enrollmentCourseId=${enrollment?.courseId}, currentCourseId=$courseId, isEnrolled=$isEnrolled');

      // Load lesson items for each lesson (with progress if enrolled)
      final lessonsWithItems = await Future.wait(
        lessonsData.map((lesson) async {
          try {
            List<LessonItemModel> items;
            if (isEnrolled) {
              // Try to get items with progress first, fallback to regular items on error
              try {
                items = await _apiClient.getLessonItemsWithProgress(lesson.id);
              } catch (_) {
                // Fallback to regular items silently (like Taif_Portal)
                items = await _apiClient.getLessonItems(lesson.id);
              }
            } else {
              items = await _apiClient.getLessonItems(lesson.id);
            }
            AppLogger.info('Repository: Lesson ${lesson.id} - loaded ${items.length} items');
            return lesson.copyWith(items: items);
          } catch (e) {
            AppLogger.error('Failed to load items for lesson ${lesson.id}: $e');
            return lesson;
          }
        }),
      );
      
      // Log summary
      for (final lesson in lessonsWithItems) {
        AppLogger.info('Repository: Lesson "${lesson.title}" has ${lesson.items.length} items');
      }

      // Enrich course with additional data
      final enrichedCourse = course.copyWith(
        isEnrolled: isEnrolled,
        isFavourite: enrollment?.isFavourite ?? false,
      );

      AppLogger.info('Repository: Course details loaded successfully');

      return CourseDetailsResult(
        course: enrichedCourse,
        lessons: lessonsWithItems,
        enrollment: enrollment,
        reviews: reviews,
        reviewStatistics: reviewStats,
        hasReviewed: hasReviewed,
      );
    } catch (e) {
      AppLogger.error('Repository: Failed to load course details: $e');
      rethrow;
    }
  }

  /// Enroll in a course
  Future<EnrollmentModel> enroll(String courseId) async {
    try {
      AppLogger.info('Repository: Enrolling in course: $courseId');
      return await _apiClient.enroll(courseId);
    } catch (e) {
      AppLogger.error('Repository: Failed to enroll: $e');
      rethrow;
    }
  }

  /// Toggle favourite status
  Future<bool> toggleFavourite(String courseId) async {
    try {
      AppLogger.info('Repository: Toggling favourite for: $courseId');
      return await _apiClient.toggleFavourite(courseId);
    } catch (e) {
      AppLogger.error('Repository: Failed to toggle favourite: $e');
      rethrow;
    }
  }

  /// Submit a review
  Future<ReviewModel> submitReview({
    required String courseId,
    required int rating,
    required String comment,
  }) async {
    try {
      AppLogger.info('Repository: Submitting review for: $courseId');
      return await _apiClient.submitReview(
        courseId: courseId,
        rating: rating,
        comment: comment,
      );
    } catch (e) {
      AppLogger.error('Repository: Failed to submit review: $e');
      rethrow;
    }
  }

  /// Check if user has any progress in the course
  bool hasAnyProgress(List<LessonModel> lessons) {
    return lessons.any((lesson) =>
      lesson.items.any((item) => item.isCompleted)
    );
  }

  /// Calculate total course progress percentage
  double calculateTotalProgress(List<LessonModel> lessons) {
    if (lessons.isEmpty) return 0.0;
    
    int totalItems = 0;
    int completedItems = 0;
    
    for (final lesson in lessons) {
      for (final item in lesson.items) {
        totalItems++;
        if (item.isCompleted) {
          completedItems++;
        }
      }
    }
    
    if (totalItems == 0) return 0.0;
    return (completedItems / totalItems) * 100;
  }

  /// Get the resume learning URL/location
  /// Returns the lesson ID to navigate to based on:
  /// 1. Last accessed lesson item ID from enrollment (if available)
  /// 2. First lesson with incomplete items
  /// 3. First lesson (fallback)
  String? getResumeLearningLessonId(
    EnrollmentModel? enrollment,
    List<LessonModel> lessons,
  ) {
    if (lessons.isEmpty) return null;

    // If there's a last accessed item ID, find which lesson contains it
    final lastItemId = enrollment?.lastLessonItemId;
    if (lastItemId != null && lastItemId.isNotEmpty) {
      for (final lesson in lessons) {
        if (lesson.items.any((item) => item.id == lastItemId)) {
          return lesson.id;
        }
      }
    }

    // Find first lesson with incomplete items
    for (final lesson in lessons) {
      if (lesson.items.any((item) => !item.isCompleted)) {
        return lesson.id;
      }
    }

    // All completed, return first lesson
    return lessons.first.id;
  }
}

/// Course Details Result
/// Aggregates all data needed for the course details page
class CourseDetailsResult {
  final CourseModel course;
  final List<LessonModel> lessons;
  final EnrollmentModel? enrollment;
  final List<ReviewModel> reviews;
  final ReviewStatisticsModel? reviewStatistics;
  final bool hasReviewed;

  CourseDetailsResult({
    required this.course,
    required this.lessons,
    this.enrollment,
    required this.reviews,
    this.reviewStatistics,
    required this.hasReviewed,
  });

  /// Check if user is enrolled in this specific course
  /// Enrollment is valid only if it has a non-empty id and courseId matches
  bool get isEnrolled => enrollment != null && 
                         enrollment!.id.isNotEmpty && 
                         enrollment!.courseId == course.id;

  /// Check if user has started learning (has any progress)
  bool get hasStartedLearning {
    if (!isEnrolled) return false;
    return lessons.any((lesson) =>
      lesson.items.any((item) => item.isCompleted)
    );
  }

  /// Get total lesson count
  int get totalLessons => lessons.length;

  /// Get total lesson items count
  int get totalItems {
    return lessons.fold<int>(0, (sum, lesson) => sum + lesson.items.length);
  }

  /// Get completed items count
  int get completedItemsCount {
    int count = 0;
    for (final lesson in lessons) {
      count += lesson.completedItemsCount;
    }
    return count;
  }

  /// Get overall progress percentage
  double get overallProgress {
    if (totalItems == 0) return 0.0;
    return (completedItemsCount / totalItems) * 100;
  }
}
