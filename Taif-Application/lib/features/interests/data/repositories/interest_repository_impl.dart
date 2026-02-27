import '../../domain/entities/interest.dart';
import '../../domain/repositories/interest_repository.dart';
import '../datasources/interest_api_client.dart';

/// Interest Repository Implementation
/// Implements the domain contract using InterestApiClient
class InterestRepositoryImpl implements InterestRepository {
  final InterestApiClient _apiClient;

  InterestRepositoryImpl() : _apiClient = InterestApiClient();

  @override
  Future<List<Interest>> getAllInterests() async {
    final models = await _apiClient.getAllInterests();
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<List<Interest>> getUserInterests() async {
    final models = await _apiClient.getUserInterests();
    return models.map((model) => model.toEntity()).toList();
  }

  @override
  Future<void> updateUserInterests(List<String> interestIds) async {
    await _apiClient.updateUserInterests(interestIds);
  }
}
