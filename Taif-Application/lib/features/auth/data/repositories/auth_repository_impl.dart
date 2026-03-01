import 'package:dio/dio.dart';
import '../../domain/entities/auth_tokens.dart';
import '../../domain/entities/user.dart';
import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_api_client.dart';
import '../models/login_request_model.dart';
import '../models/register_request_model.dart';

/// Auth Repository Implementation
/// Implements the domain contract using AuthApiClient
/// Also handles token storage via TokenStorage
class AuthRepositoryImpl implements AuthRepository {
  final AuthApiClient _apiClient;

  AuthRepositoryImpl() : _apiClient = AuthApiClient();

  @override
  Future<AuthTokens> login({
    required String email,
    required String password,
  }) async {
    final request = LoginRequestModel(
      email: email,
      password: password,
    );
    final response = await _apiClient.login(request);
    return response.toEntity();
  }

  @override
  Future<AuthTokens> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
    DateTime? birthday,
  }) async {
    final request = RegisterRequestModel(
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: password,
      birthday: birthday,
    );
    final response = await _apiClient.register(request);
    return response.toEntity();
  }

  @override
  Future<AuthTokens> refreshToken(String refreshToken) async {
    final response = await _apiClient.refreshToken(refreshToken);
    return response.toEntity();
  }

  @override
  Future<void> logout() async {
    // Clear tokens from secure storage
    // Token clearing will be handled by a separate TokenStorage service
    // This is just the API call to invalidate the token
    try {
      await Dio().post<Map<String, dynamic>>('/auth/logout');
    } catch (_) {
      // Ignore logout errors - token will be cleared locally anyway
    }
  }

  @override
  Future<User> getCurrentUser({String? authToken}) async {
    final response = await _apiClient.getCurrentUser(authToken: authToken);
    return response.toEntity();
  }

  @override
  Future<bool> isAuthenticated() async {
    // This will be implemented with TokenStorage
    // For now, return false as default
    return false;
  }
}
