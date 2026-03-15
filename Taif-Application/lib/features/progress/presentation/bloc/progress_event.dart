import 'package:equatable/equatable.dart';

/// Progress Events
abstract class ProgressEvent extends Equatable {
  const ProgressEvent();

  @override
  List<Object?> get props => [];
}

/// Load progress data
class LoadProgressData extends ProgressEvent {
  const LoadProgressData();
}

/// Refresh progress data
class RefreshProgressData extends ProgressEvent {
  const RefreshProgressData();
}
