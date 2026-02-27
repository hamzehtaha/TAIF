import 'package:equatable/equatable.dart';

/// Interest BLoC Events
abstract class InterestEvent extends Equatable {
  const InterestEvent();

  @override
  List<Object?> get props => [];
}

/// Load interests on screen init
class LoadInterests extends InterestEvent {
  const LoadInterests();
}

/// Toggle interest selection
class ToggleInterestSelection extends InterestEvent {
  final String interestId;

  const ToggleInterestSelection(this.interestId);

  @override
  List<Object?> get props => [interestId];
}

/// Save selected interests
class SaveInterests extends InterestEvent {
  const SaveInterests();
}

/// Skip interests selection
class SkipInterests extends InterestEvent {
  const SkipInterests();
}

/// Clear error state
class ClearInterestError extends InterestEvent {
  const ClearInterestError();
}
