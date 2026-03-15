import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/course_details_repository.dart';
import 'course_details_event.dart';
import 'course_details_state.dart';

/// Course Details BLoC
/// Manages state for the course details page
class CourseDetailsBloc extends Bloc<CourseDetailsEvent, CourseDetailsState> {
  final CourseDetailsRepository _repository;
  String? _currentCourseId;

  CourseDetailsBloc({CourseDetailsRepository? repository})
      : _repository = repository ?? CourseDetailsRepository(),
        super(const CourseDetailsInitial()) {
    on<LoadCourseDetails>(_onLoadCourseDetails);
    on<RefreshCourseDetails>(_onRefreshCourseDetails);
    on<ToggleLessonExpansion>(_onToggleLessonExpansion);
    on<EnrollInCourse>(_onEnrollInCourse);
    on<ToggleFavourite>(_onToggleFavourite);
    on<SubmitReview>(_onSubmitReview);
    on<LessonItemClicked>(_onLessonItemClicked);
    on<ResumeLearningClicked>(_onResumeLearningClicked);
  }

  /// Load course details
  Future<void> _onLoadCourseDetails(
    LoadCourseDetails event,
    Emitter<CourseDetailsState> emit,
  ) async {
    emit(const CourseDetailsLoading());
    _currentCourseId = event.courseId;

    try {
      AppLogger.info('BLoC: Loading course details for ${event.courseId}');
      final result = await _repository.getCourseDetails(event.courseId);

      emit(CourseDetailsLoaded(
        course: result.course,
        lessons: result.lessons,
        enrollment: result.enrollment,
        reviews: result.reviews,
        reviewStatistics: result.reviewStatistics,
        hasReviewed: result.hasReviewed,
      ));
      AppLogger.info('BLoC: Course details loaded successfully');
    } catch (e) {
      AppLogger.error('BLoC: Failed to load course details: $e');
      emit(CourseDetailsError(e.toString()));
    }
  }

  /// Refresh course details
  Future<void> _onRefreshCourseDetails(
    RefreshCourseDetails event,
    Emitter<CourseDetailsState> emit,
  ) async {
    if (_currentCourseId == null) return;

    // Only show loading if not already loaded
    if (state is! CourseDetailsLoaded) {
      emit(const CourseDetailsLoading());
    }

    try {
      AppLogger.info('BLoC: Refreshing course details for $_currentCourseId');
      final result = await _repository.getCourseDetails(_currentCourseId!);

      emit(CourseDetailsLoaded(
        course: result.course,
        lessons: result.lessons,
        enrollment: result.enrollment,
        reviews: result.reviews,
        reviewStatistics: result.reviewStatistics,
        hasReviewed: result.hasReviewed,
      ));
    } catch (e) {
      AppLogger.error('BLoC: Failed to refresh course details: $e');
      // Don't emit error on refresh, keep current state
    }
  }

  /// Toggle lesson expansion
  void _onToggleLessonExpansion(
    ToggleLessonExpansion event,
    Emitter<CourseDetailsState> emit,
  ) {
    if (state is! CourseDetailsLoaded) {
      AppLogger.info('BLoC: ToggleLessonExpansion - state is not loaded, returning');
      return;
    }

    final currentState = state as CourseDetailsLoaded;
    final isCurrentlyExpanded = currentState.expandedLessonId == event.lessonId;
    final newExpandedId = isCurrentlyExpanded ? null : event.lessonId;

    AppLogger.info('BLoC: ToggleLessonExpansion - lessonId=${event.lessonId}, currentExpanded=${currentState.expandedLessonId}, isCurrentlyExpanded=$isCurrentlyExpanded, newExpandedId=$newExpandedId');

    emit(currentState.copyWith(
      expandedLessonId: newExpandedId,
    ));
  }

  /// Enroll in course
  Future<void> _onEnrollInCourse(
    EnrollInCourse event,
    Emitter<CourseDetailsState> emit,
  ) async {
    if (state is! CourseDetailsLoaded || _currentCourseId == null) return;

    final currentState = state as CourseDetailsLoaded;
    emit(CourseDetailsEnrolling(
      course: currentState.course,
      lessons: currentState.lessons,
      enrollment: currentState.enrollment,
      reviews: currentState.reviews,
      reviewStatistics: currentState.reviewStatistics,
      hasReviewed: currentState.hasReviewed,
      expandedLessonId: currentState.expandedLessonId,
    ));

    try {
      AppLogger.info('BLoC: Enrolling in course $_currentCourseId');
      final enrollment = await _repository.enroll(_currentCourseId!);
      AppLogger.info('BLoC: Enrollment successful: ${enrollment.id}');

      // Reload course details after enrollment
      final courseDetails = await _repository.getCourseDetails(_currentCourseId!);

      emit(CourseDetailsLoaded(
        course: courseDetails.course,
        lessons: courseDetails.lessons,
        enrollment: courseDetails.enrollment,
        reviews: courseDetails.reviews,
        reviewStatistics: courseDetails.reviewStatistics,
        hasReviewed: courseDetails.hasReviewed,
      ));
      AppLogger.info('BLoC: Successfully enrolled in course');
    } catch (e) {
      AppLogger.error('BLoC: Failed to enroll: $e');
      emit(CourseDetailsError(e.toString()));
    }
  }

  /// Toggle favourite status
  Future<void> _onToggleFavourite(
    ToggleFavourite event,
    Emitter<CourseDetailsState> emit,
  ) async {
    if (state is! CourseDetailsLoaded || _currentCourseId == null) return;

    final currentState = state as CourseDetailsLoaded;
    emit(CourseDetailsTogglingFavourite(
      course: currentState.course,
      lessons: currentState.lessons,
      enrollment: currentState.enrollment,
      reviews: currentState.reviews,
      reviewStatistics: currentState.reviewStatistics,
      hasReviewed: currentState.hasReviewed,
      expandedLessonId: currentState.expandedLessonId,
    ));

    try {
      AppLogger.info('BLoC: Toggling favourite for $_currentCourseId');
      await _repository.toggleFavourite(_currentCourseId!);

      // Reload course details
      final result = await _repository.getCourseDetails(_currentCourseId!);

      emit(CourseDetailsLoaded(
        course: result.course,
        lessons: result.lessons,
        enrollment: result.enrollment,
        reviews: result.reviews,
        reviewStatistics: result.reviewStatistics,
        hasReviewed: result.hasReviewed,
      ));
    } catch (e) {
      AppLogger.error('BLoC: Failed to toggle favourite: $e');
      // Revert to previous state
      emit(currentState);
    }
  }

  /// Submit review
  Future<void> _onSubmitReview(
    SubmitReview event,
    Emitter<CourseDetailsState> emit,
  ) async {
    if (state is! CourseDetailsLoaded || _currentCourseId == null) return;

    final currentState = state as CourseDetailsLoaded;
    emit(CourseDetailsSubmittingReview(
      course: currentState.course,
      lessons: currentState.lessons,
      enrollment: currentState.enrollment,
      reviews: currentState.reviews,
      reviewStatistics: currentState.reviewStatistics,
      hasReviewed: currentState.hasReviewed,
      expandedLessonId: currentState.expandedLessonId,
    ));

    try {
      AppLogger.info('BLoC: Submitting review for $_currentCourseId');
      await _repository.submitReview(
        courseId: _currentCourseId!,
        rating: event.rating,
        comment: event.comment,
      );

      // Reload course details to get updated reviews
      final result = await _repository.getCourseDetails(_currentCourseId!);

      emit(CourseDetailsLoaded(
        course: result.course,
        lessons: result.lessons,
        enrollment: result.enrollment,
        reviews: result.reviews,
        reviewStatistics: result.reviewStatistics,
        hasReviewed: result.hasReviewed,
      ));
      AppLogger.info('BLoC: Review submitted successfully');
    } catch (e) {
      AppLogger.error('BLoC: Failed to submit review: $e');
      // Revert to previous state
      emit(currentState);
    }
  }

  /// Lesson item clicked (placeholder for future implementation)
  void _onLessonItemClicked(
    LessonItemClicked event,
    Emitter<CourseDetailsState> emit,
  ) {
    AppLogger.info('BLoC: Lesson item clicked - lessonId: ${event.lessonId}, itemId: ${event.itemId}');
    // TODO: Navigate to lesson item content page
    // For now, do nothing as per requirements
  }

  /// Resume learning clicked (placeholder for future implementation)
  void _onResumeLearningClicked(
    ResumeLearningClicked event,
    Emitter<CourseDetailsState> emit,
  ) {
    if (state is! CourseDetailsLoaded) return;

    final currentState = state as CourseDetailsLoaded;
    AppLogger.info('BLoC: Resume learning clicked');

    // Get the resume item ID
    final resumeItemId = _repository.getResumeLearningItemId(
      currentState.course,
      currentState.lessons,
    );

    if (resumeItemId != null) {
      // TODO: Navigate to lesson content
      AppLogger.info('BLoC: Would resume at item: $resumeItemId');
    }
  }
}
