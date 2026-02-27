import '../entities/auth_tokens.dart';
import '../entities/user.dart';

/// Auth Repository Interface - Domain contract for authentication
/// Implemented in the data layer
abstract class AuthRepository {
  /// Login with email and password
  /// Returns AuthTokens on success, throws exception on failure
  Future<AuthTokens> login({
    required String email,
    required String password,
  });

  /// Register new user
  /// Returns AuthTokens on success, throws exception on failure
  Future<AuthTokens> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    DateTime? birthday,
  });

  /// Refresh access token using refresh token
  /// Returns new AuthTokens on success
  Future<AuthTokens> refreshToken(String refreshToken);

  /// Logout - clear tokens
  Future<void> logout();

  /// Get current user profile
  /// Optionally pass authToken to bypass storage (for immediate use after login)
  Future<User> getCurrentUser({String? authToken});

  /// Check if user is authenticated
  Future<bool> isAuthenticated();
}
