import 'dart:io';

/// Centralized environment configuration for TAIF
/// Single source of truth for all environment-specific settings
enum Environment { dev, staging, prod }

class EnvConfig {
  final String apiBaseUrl;
  final String appName;
  final bool enableLogging;
  final bool enableAnalytics;
  final bool enableCrashReporting;
  final Duration apiTimeout;
  final Duration apiReceiveTimeout;
  final int maxRetryAttempts;

  const EnvConfig._({
    required this.apiBaseUrl,
    required this.appName,
    required this.enableLogging,
    required this.enableAnalytics,
    required this.enableCrashReporting,
    required this.apiTimeout,
    required this.apiReceiveTimeout,
    required this.maxRetryAttempts,
  });

  /// Get base URL - uses 10.0.2.2 for Android emulator, localhost for others
  static String get _baseUrl {
    if (Platform.isAndroid) {
      // Android emulator uses 10.0.2.2 to reach host localhost
      return 'https://10.0.2.2:7277/api';
    }
    // Windows, iOS, macOS, Linux use localhost
    return 'https://localhost:7277/api';
  }

  /// Development environment
  static EnvConfig get dev => EnvConfig._(
    apiBaseUrl: _baseUrl,
    appName: 'TAIF Dev',
    enableLogging: true,
    enableAnalytics: false,
    enableCrashReporting: false,
    apiTimeout: Duration(seconds: 30),
    apiReceiveTimeout: Duration(seconds: 30),
    maxRetryAttempts: 1,
  );

  /// Staging environment
  static EnvConfig get staging => EnvConfig._(
    apiBaseUrl: _baseUrl,
    appName: 'TAIF Staging',
    enableLogging: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    apiTimeout: Duration(seconds: 30),
    apiReceiveTimeout: Duration(seconds: 30),
    maxRetryAttempts: 3,
  );

  /// Production environment
  static EnvConfig get prod => EnvConfig._(
    apiBaseUrl: _baseUrl,
    appName: 'TAIF',
    enableLogging: false,
    enableAnalytics: true,
    enableCrashReporting: true,
    apiTimeout: Duration(seconds: 30),
    apiReceiveTimeout: Duration(seconds: 30),
    maxRetryAttempts: 3,
  );

  static late EnvConfig _current;

  static EnvConfig get current => _current;

  static void initialize(Environment env) {
    _current = switch (env) {
      Environment.dev => dev,
      Environment.staging => staging,
      Environment.prod => prod,
    };
  }
}
