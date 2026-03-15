import 'package:equatable/equatable.dart';
import '../../../home/data/models/course_model.dart';
import '../../data/models/enrollment_model.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/review_model.dart';

/// Course Details States
abstract class CourseDetailsState extends Equatable {
  const CourseDetailsState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class CourseDetailsInitial extends CourseDetailsState {
  const CourseDetailsInitial();
}

/// Loading state
class CourseDetailsLoading extends CourseDetailsState {
  const CourseDetailsLoading();
}

/// Sentinel value for expandedLessonId to distinguish between "not passed" and "set to null"
const Object _expandedLessonIdSentinel = Object();

/// Loaded state with all course details
class CourseDetailsLoaded extends CourseDetailsState {
  final CourseModel course;
  final List<LessonModel> lessons;
  final EnrollmentModel? enrollment;
  final List<ReviewModel> reviews;
  final ReviewStatisticsModel? reviewStatistics;
  final bool hasReviewed;
  final String? expandedLessonId;

  const CourseDetailsLoaded({
    required this.course,
    required this.lessons,
    this.enrollment,
    required this.reviews,
    this.reviewStatistics,
    required this.hasReviewed,
    this.expandedLessonId,
  });

  /// Check if user is enrolled
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

  /// Get CTA button text
  String get ctaButtonText {
    if (!isEnrolled) return 'Enroll Now';
    if (hasStartedLearning) return 'Continue Learning';
    return 'Start Learning';
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

  /// Get enrolled students count
  int get enrolledCount => course.reviewCount ?? 0;

  /// Check if a lesson is expanded
  bool isLessonExpanded(String lessonId) => expandedLessonId == lessonId;

  CourseDetailsLoaded copyWith({
    CourseModel? course,
    List<LessonModel>? lessons,
    EnrollmentModel? enrollment,
    List<ReviewModel>? reviews,
    ReviewStatisticsModel? reviewStatistics,
    bool? hasReviewed,
    Object? expandedLessonId = _expandedLessonIdSentinel,
  }) {
    return CourseDetailsLoaded(
      course: course ?? this.course,
      lessons: lessons ?? this.lessons,
      enrollment: enrollment ?? this.enrollment,
      reviews: reviews ?? this.reviews,
      reviewStatistics: reviewStatistics ?? this.reviewStatistics,
      hasReviewed: hasReviewed ?? this.hasReviewed,
      expandedLessonId: expandedLessonId == _expandedLessonIdSentinel
          ? this.expandedLessonId
          : expandedLessonId as String?,
    );
  }

  @override
  List<Object?> get props => [
    course,
    lessons,
    enrollment,
    reviews,
    reviewStatistics,
    hasReviewed,
    expandedLessonId,
  ];
}

/// Error state
class CourseDetailsError extends CourseDetailsState {
  final String message;

  const CourseDetailsError(this.message);

  @override
  List<Object?> get props => [message];
}

/// Enrolling state (loading while enrolling)
class CourseDetailsEnrolling extends CourseDetailsLoaded {
  const CourseDetailsEnrolling({
    required super.course,
    required super.lessons,
    super.enrollment,
    required super.reviews,
    super.reviewStatistics,
    required super.hasReviewed,
    super.expandedLessonId,
  });
}

/// Submitting review state
class CourseDetailsSubmittingReview extends CourseDetailsLoaded {
  const CourseDetailsSubmittingReview({
    required super.course,
    required super.lessons,
    super.enrollment,
    required super.reviews,
    super.reviewStatistics,
    required super.hasReviewed,
    super.expandedLessonId,
  });
}

/// Toggling favourite state
class CourseDetailsTogglingFavourite extends CourseDetailsLoaded {
  const CourseDetailsTogglingFavourite({
    required super.course,
    required super.lessons,
    super.enrollment,
    required super.reviews,
    super.reviewStatistics,
    required super.hasReviewed,
    super.expandedLessonId,
  });
}
