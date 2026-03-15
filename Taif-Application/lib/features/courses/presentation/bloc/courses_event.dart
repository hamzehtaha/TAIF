import 'package:equatable/equatable.dart';

// ═══════════════════════════════════════════════════════════════════════════
// Courses BLoC Events
// ═══════════════════════════════════════════════════════════════════════════

abstract class CoursesEvent extends Equatable {
  const CoursesEvent();

  @override
  List<Object?> get props => [];
}

/// Load initial courses data
class LoadCourses extends CoursesEvent {
  const LoadCourses();
}

/// Refresh courses data
class RefreshCourses extends CoursesEvent {
  const RefreshCourses();
}

/// Search courses by term
class SearchCourses extends CoursesEvent {
  final String searchTerm;

  const SearchCourses(this.searchTerm);

  @override
  List<Object?> get props => [searchTerm];
}

/// Filter courses by category
class FilterByCategory extends CoursesEvent {
  final String? categoryId;

  const FilterByCategory(this.categoryId);

  @override
  List<Object?> get props => [categoryId];
}

/// Clear search and filters
class ClearFilters extends CoursesEvent {
  const ClearFilters();
}
