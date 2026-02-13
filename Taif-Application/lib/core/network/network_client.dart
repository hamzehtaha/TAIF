import 'package:dio/dio.dart';
import '../config/env.dart';
import '../utils/logger.dart';

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
        baseUrl: EnvConfig.current.apiBaseUrl, // Centralized Base URL
        connectTimeout: EnvConfig.current.apiTimeout,
        receiveTimeout: EnvConfig.current.apiReceiveTimeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

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
    // Add auth token if available
    // final token = await _tokenStorage.getAccessToken();
    // if (token != null) {
    //   options.headers['Authorization'] = 'Bearer $token';
    // }

    // Add request ID for tracing
    options.headers['X-Request-ID'] = _generateRequestId();

    handler.next(options);
  }

  void _onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Token expired - attempt refresh
      // final refreshed = await _refreshToken();
      // if (refreshed) {
      //   // Retry original request
      //   final opts = err.requestOptions;
      //   final response = await _dio.fetch(opts);
      //   handler.resolve(response);
      //   return;
      // }
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
