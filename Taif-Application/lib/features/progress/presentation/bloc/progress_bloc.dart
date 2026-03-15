import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/progress_repository.dart';
import 'progress_event.dart';
import 'progress_state.dart';

/// Progress BLoC
/// Manages state for the progress screen
class ProgressBloc extends Bloc<ProgressEvent, ProgressState> {
  final ProgressRepository _repository;

  ProgressBloc() : _repository = ProgressRepository(), super(const ProgressInitial()) {
    on<LoadProgressData>(_onLoadProgressData);
    on<RefreshProgressData>(_onRefreshProgressData);
  }

  Future<void> _onLoadProgressData(
    LoadProgressData event,
    Emitter<ProgressState> emit,
  ) async {
    emit(const ProgressLoading());

    try {
      AppLogger.info('ProgressBloc: Loading progress data...');
      final summary = await _repository.getUserProgressSummary();
      AppLogger.info(
        'ProgressBloc: Loaded - ${summary.enrolledCount} courses, '
        '${summary.totalHoursFormatted} hours, '
        '${summary.averageProgress}% avg progress, '
        '${summary.certificatesCount} certificates',
      );
      emit(ProgressLoaded(summary: summary));
    } catch (e) {
      AppLogger.error('ProgressBloc: Error loading progress data: $e');
      emit(ProgressError(message: e.toString()));
    }
  }

  Future<void> _onRefreshProgressData(
    RefreshProgressData event,
    Emitter<ProgressState> emit,
  ) async {
    if (state is ProgressLoaded) {
      // Keep existing data while refreshing
      final currentSummary = (state as ProgressLoaded).summary;

      try {
        AppLogger.info('ProgressBloc: Refreshing progress data...');
        final summary = await _repository.getUserProgressSummary();
        AppLogger.info('ProgressBloc: Refreshed successfully');
        emit(ProgressLoaded(summary: summary));
      } catch (e) {
        AppLogger.error('ProgressBloc: Error refreshing progress data: $e');
        // On refresh error, keep existing data
        emit(ProgressLoaded(summary: currentSummary));
      }
    } else {
      // If not loaded yet, do a full load
      add(const LoadProgressData());
    }
  }
}
