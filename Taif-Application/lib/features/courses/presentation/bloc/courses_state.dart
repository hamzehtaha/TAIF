import 'package:equatable/equatable.dart';
import '../../../home/data/models/course_model.dart';
import '../../data/models/category_model.dart';

// Sentinel value to distinguish between "not passed" and "passed as null"
const _sentinel = Object();

// ═══════════════════════════════════════════════════════════════════════════
// Courses BLoC States
// ═══════════════════════════════════════════════════════════════════════════

abstract class CoursesState extends Equatable {
  const CoursesState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class CoursesInitial extends CoursesState {
  const CoursesInitial();
}

/// Loading state
class CoursesLoading extends CoursesState {
  const CoursesLoading();
}

/// Loaded state with data
class CoursesLoaded extends CoursesState {
  final List<CourseModel> allCourses;
  final List<CourseModel> filteredCourses;
  final List<CategoryModel> categories;
  final String? selectedCategoryId;
  final String searchTerm;

  const CoursesLoaded({
    required this.allCourses,
    required this.filteredCourses,
    required this.categories,
    this.selectedCategoryId,
    this.searchTerm = '',
  });

  @override
  List<Object?> get props => [
    allCourses,
    filteredCourses,
    categories,
    selectedCategoryId,
    searchTerm,
  ];

  CoursesLoaded copyWith({
    List<CourseModel>? allCourses,
    List<CourseModel>? filteredCourses,
    List<CategoryModel>? categories,
    Object? selectedCategoryId = _sentinel,
    String? searchTerm,
  }) {
    return CoursesLoaded(
      allCourses: allCourses ?? this.allCourses,
      filteredCourses: filteredCourses ?? this.filteredCourses,
      categories: categories ?? this.categories,
      selectedCategoryId: selectedCategoryId == _sentinel 
          ? this.selectedCategoryId 
          : selectedCategoryId as String?,
      searchTerm: searchTerm ?? this.searchTerm,
    );
  }
}

/// Error state
class CoursesError extends CoursesState {
  final String message;

  const CoursesError(this.message);

  @override
  List<Object?> get props => [message];
}
