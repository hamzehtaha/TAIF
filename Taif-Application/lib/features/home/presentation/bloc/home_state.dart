import 'package:equatable/equatable.dart';
import '../../data/models/course_model.dart';

/// Home Stats
/// Contains dashboard statistics
class HomeStats extends Equatable {
  final int coursesCount;
  final double hoursLearned;
  final int certificatesCount;
  final int completionRate;

  const HomeStats({
    required this.coursesCount,
    required this.hoursLearned,
    required this.certificatesCount,
    required this.completionRate,
  });

  @override
  List<Object?> get props => [coursesCount, hoursLearned, certificatesCount, completionRate];
}

/// Home States
abstract class HomeState extends Equatable {
  const HomeState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class HomeInitial extends HomeState {
  const HomeInitial();
}

/// Loading state
class HomeLoading extends HomeState {
  const HomeLoading();
}

/// Loaded state with data
class HomeLoaded extends HomeState {
  final String userName;
  final List<CourseModel> myCourses;
  final List<CourseModel> recommendedCourses;
  final HomeStats stats;

  const HomeLoaded({
    required this.userName,
    required this.myCourses,
    required this.recommendedCourses,
    required this.stats,
  });

  @override
  List<Object?> get props => [userName, myCourses, recommendedCourses, stats];
}

/// Error state
class HomeError extends HomeState {
  final String message;

  const HomeError({required this.message});

  @override
  List<Object?> get props => [message];
}
