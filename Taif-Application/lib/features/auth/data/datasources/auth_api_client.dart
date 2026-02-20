import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../models/auth_response_model.dart';
import '../models/login_request_model.dart';
import '../models/register_request_model.dart';
import '../models/user_response_model.dart';

/// Auth API Client
/// Handles all authentication-related API calls
/// Following Server-api pattern: endpoints at /auth/*
class AuthApiClient {
  final Dio _dio;

  AuthApiClient() : _dio = NetworkClient().dio;

  /// POST /Auth/login
  Future<AuthResponseModel> login(LoginRequestModel request) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/Auth/login',
        data: request.toJson(),
      );
      return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Login failed');
    }
  }

  /// POST /Auth/register
  Future<AuthResponseModel> register(RegisterRequestModel request) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/Auth/register',
        data: request.toJson(),
      );
      return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Registration failed');
    }
  }

  /// POST /Auth/refresh
  Future<AuthResponseModel> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post<Map<String, dynamic>>(
        '/Auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      return AuthResponseModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Token refresh failed');
    }
  }

  /// GET /Auth/me
  Future<UserResponseModel> getCurrentUser() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/Auth/me');
      return UserResponseModel.fromJson(response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      throw _handleDioError(e, 'Failed to get user profile');
    }
  }

  Exception _handleDioError(DioException e, String defaultMessage) {
    if (e.response != null) {
      final statusCode = e.response?.statusCode;
      final data = e.response?.data;

      if (data is Map<String, dynamic> && data.containsKey('message')) {
        return Exception(data['message'] as String);
      }

      switch (statusCode) {
        case 400:
          return Exception('Invalid request. Please check your input.');
        case 401:
          return Exception('Invalid credentials. Please try again.');
        case 409:
          return Exception('An account with this email already exists.');
        case 500:
          return Exception('Server error. Please try again later.');
        default:
          return Exception('$defaultMessage (Error $statusCode)');
      }
    }

    if (e.type == DioExceptionType.connectionTimeout) {
      return Exception('Connection timeout. Please check your internet.');
    }

    return Exception(defaultMessage);
  }
}
