import 'package:dio/dio.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/utils/logger.dart';
import '../models/interest_model.dart';

/// Interest API Client
/// Handles all interest-related API calls
/// Following Server-api pattern: endpoints at /api/Interest/*
class InterestApiClient {
  final Dio _dio;

  InterestApiClient() : _dio = NetworkClient().dio;

  /// GET /api/Interest
  /// Get all available interests
  Future<List<InterestModel>> getAllInterests() async {
    try {
      AppLogger.info('GET /api/Interest - Requesting...');
      final response = await _dio.get<Map<String, dynamic>>('/Interest');
      AppLogger.info('GET /api/Interest - Response status: ${response.statusCode}');
      AppLogger.info('GET /api/Interest - Response data: ${response.data}');
      
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => InterestModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      AppLogger.error('GET /api/Interest - DioException: ${e.message}');
      AppLogger.error('GET /api/Interest - Response: ${e.response?.data}');
      throw _handleDioError(e, 'Failed to load interests');
    } catch (e) {
      AppLogger.error('GET /api/Interest - Unexpected error: $e');
      throw Exception('Failed to load interests: $e');
    }
  }

  /// GET /api/Interest/user
  /// Get current user's selected interests
  Future<List<InterestModel>> getUserInterests() async {
    try {
      final response = await _dio.get<Map<String, dynamic>>('/Interest/user');
      final data = response.data?['data'] as List<dynamic>? ?? [];
      return data
          .map((json) => InterestModel.fromJson(json as Map<String, dynamic>))
          .toList();
    } on DioException catch (e) {
      throw _handleDioError(e, 'Failed to load user interests');
    }
  }

  /// PUT /api/User/interests
  /// Update current user's interests
  Future<void> updateUserInterests(List<String> interestIds) async {
    try {
      final request = UpdateInterestsRequestModel(interests: interestIds);
      await _dio.put<Map<String, dynamic>>(
        '/User/interests',
        data: request.toJson(),
      );
    } on DioException catch (e) {
      throw _handleDioError(e, 'Failed to save interests');
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
        case 401:
          return Exception('Session expired. Please sign in again.');
        case 403:
          return Exception('Not authorized to perform this action.');
        case 404:
          return Exception('Resource not found.');
        case 500:
          return Exception('Server error. Please try again later.');
        default:
          return Exception('$defaultMessage (Error $statusCode)');
      }
    }

    if (e.type == DioExceptionType.connectionTimeout) {
      return Exception('Connection timeout. Please check your internet.');
    }

    if (e.type == DioExceptionType.connectionError) {
      return Exception('No internet connection. Please check your network.');
    }

    return Exception(defaultMessage);
  }
}
