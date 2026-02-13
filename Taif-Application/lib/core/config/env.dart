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

  /// Development environment
  static const EnvConfig dev = EnvConfig._(
    apiBaseUrl: 'https://api-dev.taif.app/v1',
    appName: 'TAIF Dev',
    enableLogging: true,
    enableAnalytics: false,
    enableCrashReporting: false,
    apiTimeout: Duration(seconds: 30),
    apiReceiveTimeout: Duration(seconds: 30),
    maxRetryAttempts: 1,
  );

  /// Staging environment
  static const EnvConfig staging = EnvConfig._(
    apiBaseUrl: 'https://api-staging.taif.app/v1',
    appName: 'TAIF Staging',
    enableLogging: true,
    enableAnalytics: true,
    enableCrashReporting: true,
    apiTimeout: Duration(seconds: 30),
    apiReceiveTimeout: Duration(seconds: 30),
    maxRetryAttempts: 3,
  );

  /// Production environment
  static const EnvConfig prod = EnvConfig._(
    apiBaseUrl: 'https://api.taif.app/v1',
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
