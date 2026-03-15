import 'package:equatable/equatable.dart';
import '../../data/repositories/progress_repository.dart';

/// Progress States
abstract class ProgressState extends Equatable {
  const ProgressState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class ProgressInitial extends ProgressState {
  const ProgressInitial();
}

/// Loading state
class ProgressLoading extends ProgressState {
  const ProgressLoading();
}

/// Loaded state with data
class ProgressLoaded extends ProgressState {
  final UserProgressSummary summary;

  const ProgressLoaded({required this.summary});

  @override
  List<Object?> get props => [summary];
}

/// Error state
class ProgressError extends ProgressState {
  final String message;

  const ProgressError({required this.message});

  @override
  List<Object?> get props => [message];
}
