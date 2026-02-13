import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../entities/example_entity.dart';
import '../repositories/example_repository.dart';

/// TAIF UseCase Base Class
/// All usecases extend this for consistency
abstract class UseCase<Result, Params> {
  Future<Either<AppError, Result>> call(Params params);
}

/// No parameters usecase
class NoParams {
  const NoParams();
}

/// Get Example Data UseCase
/// Demonstrates the standard usecase pattern
class GetExampleDataUseCase
    extends UseCase<ExampleEntity, GetExampleDataParams> {
  final ExampleRepository _repository;

  GetExampleDataUseCase(this._repository);

  @override
  Future<Either<AppError, ExampleEntity>> call(
    GetExampleDataParams params,
  ) async =>
      await _repository.getExampleById(params.id);
}

class GetExampleDataParams {
  final String id;

  const GetExampleDataParams({required this.id});
}
