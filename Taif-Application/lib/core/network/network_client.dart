import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import '../config/env.dart';
import '../utils/logger.dart';
import '../utils/token_storage.dart';

/// TAIF Network Client
/// Centralized Dio instance with interceptors for:
/// - Authentication (JWT + refresh tokens)
/// - Logging
/// - Retry logic
/// - Request/Response transformation
class NetworkClient {
  late final Dio _dio;

  NetworkClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.current.apiBaseUrl,
        connectTimeout: EnvConfig.current.apiTimeout,
        receiveTimeout: EnvConfig.current.apiReceiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Allow self-signed certificates for localhost development
    (_dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate =
        (client) {
      client.badCertificateCallback =
          (X509Certificate cert, String host, int port) => true;
      return client;
    };

    _setupInterceptors();
  }

  Dio get dio => _dio;

  void _setupInterceptors() {
    // Auth interceptor (token injection & refresh)
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onError: _onError,
      ),
    );

    // Logging interceptor (only in debug)
    if (EnvConfig.current.enableLogging) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          logPrint: (obj) => AppLogger.network(obj.toString()),
        ),
      );
    }
  }

  void _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Debug: log what headers we see
    AppLogger.info('Interceptor request to: ${options.path}');
    AppLogger.info('Interceptor headers present: ${options.headers.keys.toList()}');
    AppLogger.info('Interceptor extra present: ${options.extra.keys.toList()}');
    
    // Skip auth for login, register, and refresh endpoints (case-insensitive)
    final path = options.path.toLowerCase();
    final isAuthEndpoint = path.contains('/auth/login') || 
                          path.contains('/auth/register') || 
                          path.contains('/auth/refresh');
    
    AppLogger.info('Path lowercase: $path, isAuthEndpoint: $isAuthEndpoint');
    
    if (isAuthEndpoint) {
      AppLogger.info('Auth endpoint detected, skipping auth header: ${options.path}');
    } else if (options.headers.containsKey('Authorization')) {
      // Authorization header already set (e.g., from getCurrentUser), don't overwrite
      AppLogger.info('Authorization header already present (length: ${(options.headers['Authorization'] as String).length}), using existing token');
    } else if (options.extra.containsKey('auth_token')) {
      // Use token passed directly via extra
      final token = options.extra['auth_token'] as String?;
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
        AppLogger.info('Added auth header from extra token (length: ${token.length})');
      } else {
        AppLogger.warning('auth_token in extra is empty');
      }
    } else {
      // Try to get token from storage
      final tokenStorage = TokenStorage();
      final token = await tokenStorage.getAccessToken();
      
      AppLogger.info('No auth header in request, storage token: ${token != null ? 'exists' : 'null'}');
      
      if (token != null && token.isNotEmpty) {
        options.headers['Authorization'] = 'Bearer $token';
        AppLogger.info('Added auth header from storage');
      } else {
        AppLogger.warning('No token available for request to ${options.path}');
      }
    }

    // Add request ID for tracing
    options.headers['X-Request-ID'] = _generateRequestId();

    handler.next(options);
  }

  void _onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired - attempt refresh
      try {
        final tokenStorage = TokenStorage();
        final refreshToken = await tokenStorage.getRefreshToken();
        
        AppLogger.info('Token refresh attempted. Refresh token exists: ${refreshToken != null}');
        
        if (refreshToken != null && refreshToken.isNotEmpty) {
          // Try to refresh the token
          final response = await _dio.post<Map<String, dynamic>>(
            '/api/Auth/refresh',
            data: {'refreshToken': refreshToken}, // camelCase to match API
            options: Options(headers: {}), // Clear auth header for refresh
          );
          
          if (response.statusCode == 200 && response.data != null) {
            final newAccessToken = response.data?['accessToken'] as String?;
            final newRefreshToken = response.data?['refreshToken'] as String?;
            
            if (newAccessToken != null) {
              // Store new tokens
              await tokenStorage.storeAccessToken(newAccessToken);
              if (newRefreshToken != null) {
                await tokenStorage.storeRefreshToken(newRefreshToken);
              }
              
              // Retry original request with new token
              final opts = err.requestOptions;
              opts.headers['Authorization'] = 'Bearer $newAccessToken';
              final retryResponse = await _dio.fetch(opts);
              handler.resolve(retryResponse);
              return;
            }
          }
        } else {
          AppLogger.warning('No refresh token available, cannot refresh');
        }
      } catch (e) {
        AppLogger.error('Token refresh failed: $e');
        // Don't clear tokens on refresh failure - let the app handle it
      }
    }

    handler.next(err);
  }

  String _generateRequestId() =>
      '${DateTime.now().millisecondsSinceEpoch}-${_randomString(8)}';

  String _randomString(int length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    return List.generate(
      length,
      (_) => chars[DateTime.now().microsecond % chars.length],
    ).join();
  }

  /// Request cancellation token factory
  CancelToken createCancelToken() => CancelToken();
}
