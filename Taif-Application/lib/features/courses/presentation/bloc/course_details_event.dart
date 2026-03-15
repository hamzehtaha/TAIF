import 'package:equatable/equatable.dart';

/// Course Details Events
abstract class CourseDetailsEvent extends Equatable {
  const CourseDetailsEvent();

  @override
  List<Object?> get props => [];
}

/// Load course details
class LoadCourseDetails extends CourseDetailsEvent {
  final String courseId;

  const LoadCourseDetails(this.courseId);

  @override
  List<Object?> get props => [courseId];
}

/// Refresh course details
class RefreshCourseDetails extends CourseDetailsEvent {
  const RefreshCourseDetails();
}

/// Toggle lesson expansion
class ToggleLessonExpansion extends CourseDetailsEvent {
  final String lessonId;

  const ToggleLessonExpansion(this.lessonId);

  @override
  List<Object?> get props => [lessonId];
}

/// Enroll in course
class EnrollInCourse extends CourseDetailsEvent {
  const EnrollInCourse();
}

/// Toggle favourite status
class ToggleFavourite extends CourseDetailsEvent {
  const ToggleFavourite();
}

/// Submit review
class SubmitReview extends CourseDetailsEvent {
  final int rating;
  final String comment;

  const SubmitReview({
    required this.rating,
    required this.comment,
  });

  @override
  List<Object?> get props => [rating, comment];
}

/// Lesson item clicked
class LessonItemClicked extends CourseDetailsEvent {
  final String lessonId;
  final String itemId;

  const LessonItemClicked({
    required this.lessonId,
    required this.itemId,
  });

  @override
  List<Object?> get props => [lessonId, itemId];
}

/// Resume learning clicked
class ResumeLearningClicked extends CourseDetailsEvent {
  const ResumeLearningClicked();
}
