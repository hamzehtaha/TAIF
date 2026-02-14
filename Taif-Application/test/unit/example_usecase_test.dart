import 'package:flutter_test/flutter_test.dart';
import 'package:mocktail/mocktail.dart';
import 'package:dartz/dartz.dart';
import 'package:taif/core/errors/app_error.dart';
import 'package:taif/features/example_feature/domain/entities/example_entity.dart';
import 'package:taif/features/example_feature/domain/repositories/example_repository.dart';
import 'package:taif/features/example_feature/domain/usecases/get_example_data.dart';

class MockExampleRepository extends Mock implements ExampleRepository {}

void main() {
  late GetExampleDataUseCase useCase;
  late MockExampleRepository mockRepository;

  setUp(() {
    mockRepository = MockExampleRepository();
    useCase = GetExampleDataUseCase(mockRepository);
  });

  final tExample = ExampleEntity(
    id: '1',
    title: 'Test Title',
    description: 'Test Description',
    createdAt: DateTime.now(),
  );

  group('GetExampleDataUseCase', () {
    test('should return ExampleEntity when repository call is successful',
        () async {
      // Arrange
      when(() => mockRepository.getExampleById(any()))
          .thenAnswer((_) async => Right<AppError, ExampleEntity>(tExample));

      // Act
      final result = await useCase(const GetExampleDataParams(id: '1'));

      // Assert
      expect(result, Right<AppError, ExampleEntity>(tExample));
      verify(() => mockRepository.getExampleById('1'));
    });

    test('should return AppError when repository call fails', () async {
      // Arrange
      const tError = NetworkError(message: 'Server error', code: '500');
      when(() => mockRepository.getExampleById(any()))
          .thenAnswer((_) async => const Left<AppError, ExampleEntity>(tError));

      // Act
      final result = await useCase(const GetExampleDataParams(id: '1'));

      // Assert
      expect(result, const Left<AppError, ExampleEntity>(tError));
    });
  });
}
