import 'package:equatable/equatable.dart';

/// Home Events
abstract class HomeEvent extends Equatable {
  const HomeEvent();

  @override
  List<Object?> get props => [];
}

/// Load home data event
class LoadHomeData extends HomeEvent {
  const LoadHomeData();
}

/// Refresh home data event
class RefreshHomeData extends HomeEvent {
  const RefreshHomeData();
}
