import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../data/repositories/interest_repository_impl.dart';
import '../../domain/repositories/interest_repository.dart';
import 'interest_event.dart';
import 'interest_state.dart';

/// Interest BLoC
/// Manages interest selection state following BLoC pattern
/// Handles loading, selecting, and saving user interests
class InterestBloc extends Bloc<InterestEvent, InterestState> {
  final InterestRepository _interestRepository;

  InterestBloc()
      : _interestRepository = InterestRepositoryImpl(),
        super(const InterestInitial()) {
    on<LoadInterests>(_onLoadInterests);
    on<ToggleInterestSelection>(_onToggleInterestSelection);
    on<SaveInterests>(_onSaveInterests);
    on<SkipInterests>(_onSkipInterests);
    on<ClearInterestError>(_onClearInterestError);
  }

  /// Handle loading interests
  Future<void> _onLoadInterests(
    LoadInterests event,
    Emitter<InterestState> emit,
  ) async {
    emit(const InterestLoading());

    try {
      // Load all interests and user's selected interests in parallel
      final results = await Future.wait([
        _interestRepository.getAllInterests(),
        _interestRepository.getUserInterests().catchError((_) => <Never>[]),
      ]);

      final allInterests = results[0];
      final userInterests = results[1];

      final userInterestIds = userInterests.map((i) => i.id).toSet();

      AppLogger.info('Loaded ${allInterests.length} interests, user has ${userInterestIds.length} selected');
      emit(InterestsLoaded(
        allInterests: allInterests,
        selectedInterestIds: userInterestIds,
      ));
    } catch (e) {
      AppLogger.error('Failed to load interests: $e');
      emit(InterestError(message: e.toString()));
    }
  }

  /// Handle toggling interest selection
  void _onToggleInterestSelection(
    ToggleInterestSelection event,
    Emitter<InterestState> emit,
  ) {
    if (state is InterestsLoaded) {
      final currentState = state as InterestsLoaded;
      final newSelection = Set<String>.from(currentState.selectedInterestIds);

      if (newSelection.contains(event.interestId)) {
        newSelection.remove(event.interestId);
      } else {
        newSelection.add(event.interestId);
      }

      emit(InterestsLoaded(
        allInterests: currentState.allInterests,
        selectedInterestIds: newSelection,
      ));
    } else if (state is InterestError) {
      final currentState = state as InterestError;
      final newSelection = Set<String>.from(currentState.selectedInterestIds);

      if (newSelection.contains(event.interestId)) {
        newSelection.remove(event.interestId);
      } else {
        newSelection.add(event.interestId);
      }

      emit(InterestsLoaded(
        allInterests: currentState.allInterests,
        selectedInterestIds: newSelection,
      ));
    }
  }

  /// Handle saving interests
  Future<void> _onSaveInterests(
    SaveInterests event,
    Emitter<InterestState> emit,
  ) async {
    if (state is! InterestsLoaded) return;

    final currentState = state as InterestsLoaded;

    // If no interests selected, just navigate without API call
    if (currentState.selectedInterestIds.isEmpty) {
      AppLogger.info('No interests selected, skipping save');
      emit(const InterestsSaved());
      return;
    }

    emit(InterestsSaving(
      allInterests: currentState.allInterests,
      selectedInterestIds: currentState.selectedInterestIds,
    ));

    try {
      await _interestRepository.updateUserInterests(
        currentState.selectedInterestIds.toList(),
      );
      AppLogger.info('Saved ${currentState.selectedInterestIds.length} interests');
      emit(const InterestsSaved());
    } catch (e) {
      AppLogger.error('Failed to save interests: $e');
      emit(InterestError(
        message: e.toString(),
        allInterests: currentState.allInterests,
        selectedInterestIds: currentState.selectedInterestIds,
      ));
    }
  }

  /// Handle skipping interests
  void _onSkipInterests(
    SkipInterests event,
    Emitter<InterestState> emit,
  ) {
    AppLogger.info('User skipped interests selection');
    emit(const InterestsSkipped());
  }

  /// Handle clearing error state
  void _onClearInterestError(
    ClearInterestError event,
    Emitter<InterestState> emit,
  ) {
    if (state is InterestError) {
      final currentState = state as InterestError;
      emit(InterestsLoaded(
        allInterests: currentState.allInterests,
        selectedInterestIds: currentState.selectedInterestIds,
      ));
    }
  }
}
