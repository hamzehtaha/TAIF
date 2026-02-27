import 'package:equatable/equatable.dart';
import '../../domain/entities/interest.dart';

/// Interest BLoC States
abstract class InterestState extends Equatable {
  const InterestState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class InterestInitial extends InterestState {
  const InterestInitial();
}

/// Loading interests
class InterestLoading extends InterestState {
  const InterestLoading();
}

/// Interests loaded successfully
class InterestsLoaded extends InterestState {
  final List<Interest> allInterests;
  final Set<String> selectedInterestIds;

  const InterestsLoaded({
    required this.allInterests,
    required this.selectedInterestIds,
  });

  int get selectedCount => selectedInterestIds.length;

  @override
  List<Object?> get props => [allInterests, selectedInterestIds];
}

/// Saving interests
class InterestsSaving extends InterestState {
  final List<Interest> allInterests;
  final Set<String> selectedInterestIds;

  const InterestsSaving({
    required this.allInterests,
    required this.selectedInterestIds,
  });

  @override
  List<Object?> get props => [allInterests, selectedInterestIds];
}

/// Interests saved successfully - navigation should occur
class InterestsSaved extends InterestState {
  const InterestsSaved();
}

/// Skipped interests - navigation should occur
class InterestsSkipped extends InterestState {
  const InterestsSkipped();
}

/// Error state
class InterestError extends InterestState {
  final String message;
  final List<Interest> allInterests;
  final Set<String> selectedInterestIds;

  const InterestError({
    required this.message,
    this.allInterests = const [],
    this.selectedInterestIds = const {},
  });

  @override
  List<Object?> get props => [message, allInterests, selectedInterestIds];
}
