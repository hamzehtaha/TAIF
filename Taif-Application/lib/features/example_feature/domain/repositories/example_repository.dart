import 'package:dartz/dartz.dart';
import '../../../../core/errors/app_error.dart';
import '../entities/example_entity.dart';

/// TAIF Example Repository Interface
/// Defines the contract for data operations
abstract class ExampleRepository {
  Future<Either<AppError, ExampleEntity>> getExampleById(String id);
  Future<Either<AppError, List<ExampleEntity>>> getAllExamples();
}
