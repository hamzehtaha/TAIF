import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../../home/data/models/course_model.dart';
import '../../data/models/category_model.dart';
import '../../data/repositories/courses_repository.dart';
import 'courses_event.dart';
import 'courses_state.dart';

// ═══════════════════════════════════════════════════════════════════════════
// Courses BLoC
// Manages courses list state with search and filter functionality
// ═══════════════════════════════════════════════════════════════════════════

class CoursesBloc extends Bloc<CoursesEvent, CoursesState> {
  final CoursesRepository _repository;

  CoursesBloc() : _repository = CoursesRepository(), super(const CoursesInitial()) {
    on<LoadCourses>(_onLoadCourses);
    on<RefreshCourses>(_onRefreshCourses);
    on<SearchCourses>(_onSearchCourses);
    on<FilterByCategory>(_onFilterByCategory);
    on<ClearFilters>(_onClearFilters);
  }

  /// Load courses and categories
  Future<void> _onLoadCourses(
    LoadCourses event,
    Emitter<CoursesState> emit,
  ) async {
    emit(const CoursesLoading());

    try {
      AppLogger.info('CoursesBloc: Loading courses and categories...');
      
      // Load courses and categories in parallel
      final results = await Future.wait([
        _repository.getCourses(),
        _repository.getCategories(),
      ]);

      final courses = results[0] as List<CourseModel>;
      final categories = results[1] as List<CategoryModel>;

      AppLogger.info('CoursesBloc: Loaded ${courses.length} courses and ${categories.length} categories');

      // Apply initial filtering (search and category)
      final filteredCourses = _applyFilters(
        courses: courses,
        searchTerm: '',
        categoryId: null,
      );

      emit(CoursesLoaded(
        allCourses: courses,
        filteredCourses: filteredCourses,
        categories: categories,
        selectedCategoryId: null,
        searchTerm: '',
      ));
    } catch (e) {
      AppLogger.error('CoursesBloc: Failed to load courses: $e');
      emit(CoursesError(e.toString()));
    }
  }

  /// Refresh courses data
  Future<void> _onRefreshCourses(
    RefreshCourses event,
    Emitter<CoursesState> emit,
  ) async {
    if (state is CoursesLoaded) {
      final currentState = state as CoursesLoaded;
      
      try {
        AppLogger.info('CoursesBloc: Refreshing courses...');
        
        final results = await Future.wait([
          _repository.getCourses(),
          _repository.getCategories(),
        ]);

        final courses = results[0] as List<CourseModel>;
        final categories = results[1] as List<CategoryModel>;

        // Re-apply current filters
        final filteredCourses = _applyFilters(
          courses: courses,
          searchTerm: currentState.searchTerm,
          categoryId: currentState.selectedCategoryId,
        );

        emit(currentState.copyWith(
          allCourses: courses,
          filteredCourses: filteredCourses,
          categories: categories,
        ));
      } catch (e) {
        AppLogger.error('CoursesBloc: Failed to refresh courses: $e');
        // Keep current state on refresh error
      }
    }
  }

  /// Handle search input
  Future<void> _onSearchCourses(
    SearchCourses event,
    Emitter<CoursesState> emit,
  ) async {
    if (state is CoursesLoaded) {
      final currentState = state as CoursesLoaded;
      
      final filteredCourses = _applyFilters(
        courses: currentState.allCourses,
        searchTerm: event.searchTerm,
        categoryId: currentState.selectedCategoryId,
      );

      emit(currentState.copyWith(
        searchTerm: event.searchTerm,
        filteredCourses: filteredCourses,
      ));
    }
  }

  /// Handle category filter selection
  Future<void> _onFilterByCategory(
    FilterByCategory event,
    Emitter<CoursesState> emit,
  ) async {
    if (state is CoursesLoaded) {
      final currentState = state as CoursesLoaded;
      
      final filteredCourses = _applyFilters(
        courses: currentState.allCourses,
        searchTerm: currentState.searchTerm,
        categoryId: event.categoryId,
      );

      emit(currentState.copyWith(
        selectedCategoryId: event.categoryId,
        filteredCourses: filteredCourses,
      ));
    }
  }

  /// Clear all filters
  Future<void> _onClearFilters(
    ClearFilters event,
    Emitter<CoursesState> emit,
  ) async {
    if (state is CoursesLoaded) {
      final currentState = state as CoursesLoaded;
      
      emit(currentState.copyWith(
        searchTerm: '',
        selectedCategoryId: null,
        filteredCourses: currentState.allCourses,
      ));
    }
  }

  /// Apply search and category filters to courses list
  List<CourseModel> _applyFilters({
    required List<CourseModel> courses,
    required String searchTerm,
    required String? categoryId,
  }) {
    var filtered = courses;

    // Filter by search term
    if (searchTerm.isNotEmpty) {
      final searchLower = searchTerm.toLowerCase();
      filtered = filtered.where((course) {
        final titleMatch = course.title.toLowerCase().contains(searchLower);
        final descMatch = course.description?.toLowerCase().contains(searchLower) ?? false;
        return titleMatch || descMatch;
      }).toList();
    }

    // Filter by category
    if (categoryId != null && categoryId.isNotEmpty) {
      filtered = filtered.where((course) => course.categoryId == categoryId).toList();
    }

    return filtered;
  }
}
