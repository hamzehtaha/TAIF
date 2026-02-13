import 'package:logger/logger.dart';
import '../config/env.dart';

/// TAIF Structured Logging System
/// Environment-aware logging with proper log levels
class AppLogger {
  static late final Logger _logger;

  static void initialize() {
    _logger = Logger(
      printer: PrettyPrinter(
        errorMethodCount: 8,
        lineLength: 100,
        printTime: true,
      ),
      level: EnvConfig.current.enableLogging ? Level.debug : Level.nothing,
    );
  }

  static void debug(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.d(message, error: error, stackTrace: stackTrace);
  }

  static void info(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.i(message, error: error, stackTrace: stackTrace);
  }

  static void warning(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.w(message, error: error, stackTrace: stackTrace);
  }

  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    _logger.e(message, error: error, stackTrace: stackTrace);
  }

  static void network(String message) {
    if (EnvConfig.current.enableLogging) {
      _logger.i('🌐 NETWORK: $message');
    }
  }

  /// Safe logging - never logs sensitive data
  static void safeLog(String message) {
    // Sanitize message to remove potential tokens/secrets
    final sanitized = message
        .replaceAll(RegExp(r'Bearer\s+\S+'), 'Bearer [REDACTED]')
        .replaceAll(
            RegExp(r'Authorization:[^,\n]+'), 'Authorization: [REDACTED]')
        .replaceAll(RegExp(r'token[=:]\S+'), 'token=[REDACTED]')
        .replaceAll(RegExp(r'password[=:]\S+'), 'password=[REDACTED]');

    _logger.i(sanitized);
  }
}
