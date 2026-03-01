import '../entities/interest.dart';

/// Interest Repository Interface
/// Domain contract for interest operations
abstract class InterestRepository {
  /// Get all available interests
  Future<List<Interest>> getAllInterests();

  /// Get current user's selected interests
  Future<List<Interest>> getUserInterests();

  /// Update current user's interests
  Future<void> updateUserInterests(List<String> interestIds);
}
