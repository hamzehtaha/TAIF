import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../../../core/errors/app_error.dart';
import '../../domain/entities/example_entity.dart';
import '../../domain/usecases/get_example_data.dart';

// ═══════════════════════════════════════════════════════════════════════════
// BLoC Pattern Implementation for TAIF
// This demonstrates the standard BLoC structure for features
// ═══════════════════════════════════════════════════════════════════════════

/// Events
abstract class ExampleEvent extends Equatable {
  const ExampleEvent();

  @override
  List<Object?> get props => [];
}

class LoadExampleData extends ExampleEvent {
  final String id;

  const LoadExampleData(this.id);

  @override
  List<Object?> get props => [id];
}

class RefreshExampleData extends ExampleEvent {
  const RefreshExampleData();
}

/// States
abstract class ExampleState extends Equatable {
  const ExampleState();

  @override
  List<Object?> get props => [];
}

class ExampleInitial extends ExampleState {}

class ExampleLoading extends ExampleState {}

class ExampleLoaded extends ExampleState {
  final ExampleEntity data;

  const ExampleLoaded(this.data);

  @override
  List<Object?> get props => [data];
}

class ExampleError extends ExampleState {
  final AppError error;

  const ExampleError(this.error);

  @override
  List<Object?> get props => [error];
}

/// BLoC
class ExampleBloc extends Bloc<ExampleEvent, ExampleState> {
  final GetExampleDataUseCase _getExampleData;

  ExampleBloc({
    required GetExampleDataUseCase getExampleData,
  })  : _getExampleData = getExampleData,
        super(ExampleInitial()) {
    on<LoadExampleData>(_onLoadExampleData);
    on<RefreshExampleData>(_onRefreshExampleData);
  }

  Future<void> _onLoadExampleData(
    LoadExampleData event,
    Emitter<ExampleState> emit,
  ) async {
    emit(ExampleLoading());

    final result = await _getExampleData(
      GetExampleDataParams(id: event.id),
    );

    result.fold(
      (error) => emit(ExampleError(error)),
      (data) => emit(ExampleLoaded(data)),
    );
  }

  Future<void> _onRefreshExampleData(
    RefreshExampleData event,
    Emitter<ExampleState> emit,
  ) async {
    // Keep current state while refreshing
    if (state is ExampleLoaded) {
      final currentData = (state as ExampleLoaded).data;
      
      final result = await _getExampleData(
        GetExampleDataParams(id: currentData.id),
      );

      result.fold(
        (error) => emit(ExampleError(error)),
        (data) => emit(ExampleLoaded(data)),
      );
    }
  }
}
