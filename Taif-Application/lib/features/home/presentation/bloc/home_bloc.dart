import 'package:flutter_bloc/flutter_bloc.dart';
import '../../data/models/course_model.dart';
import '../../data/repositories/home_repository.dart';
import 'home_event.dart';
import 'home_state.dart';

/// Home BLoC
/// Manages state for the home/dashboard screen
class HomeBloc extends Bloc<HomeEvent, HomeState> {
  final HomeRepository _repository;

  HomeBloc() : _repository = HomeRepository(), super(const HomeInitial()) {
    on<LoadHomeData>(_onLoadHomeData);
    on<RefreshHomeData>(_onRefreshHomeData);
  }

  Future<void> _onLoadHomeData(LoadHomeData event, Emitter<HomeState> emit) async {
    emit(const HomeLoading());
    
    try {
      final user = await _repository.getCurrentUser();
      final myCourses = await _repository.getUserCoursesWithProgress();
      final recommendedCourses = await _repository.getRecommendedCourses();
      
      // Calculate stats
      final stats = _calculateStats(myCourses);
      
      emit(HomeLoaded(
        userName: user?.firstName ?? '',
        myCourses: myCourses,
        recommendedCourses: recommendedCourses,
        stats: stats,
      ));
    } catch (e) {
      emit(HomeError(message: e.toString()));
    }
  }

  Future<void> _onRefreshHomeData(RefreshHomeData event, Emitter<HomeState> emit) async {
    if (state is HomeLoaded) {
      emit(const HomeLoading());
      
      try {
        final user = await _repository.getCurrentUser();
        final myCourses = await _repository.getUserCoursesWithProgress();
        final recommendedCourses = await _repository.getRecommendedCourses();
        
        final stats = _calculateStats(myCourses);
        
        emit(HomeLoaded(
          userName: user?.firstName ?? '',
          myCourses: myCourses,
          recommendedCourses: recommendedCourses,
          stats: stats,
        ));
      } catch (e) {
        emit(HomeError(message: e.toString()));
      }
    }
  }

  HomeStats _calculateStats(List<CourseModel> courses) {
    final totalCourses = courses.length;
    final totalHours = courses.fold<double>(0, (sum, c) => sum + (c.durationInMinutes ?? 0) / 60);
    final avgProgress = courses.isEmpty 
        ? 0 
        : courses.fold<int>(0, (sum, c) => sum + c.progress) ~/ courses.length;
    
    return HomeStats(
      coursesCount: totalCourses,
      hoursLearned: double.parse(totalHours.toStringAsFixed(1)),
      certificatesCount: 0, // Not implemented yet
      completionRate: avgProgress,
    );
  }
}
