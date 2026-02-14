import 'package:equatable/equatable.dart';

/// TAIF Unified Error Model
/// All errors in the app use this model for consistent handling
abstract class AppError extends Equatable {
  final String message;
  final String? code;
  final dynamic details;

  const AppError({
    required this.message,
    this.code,
    this.details,
  });

  @override
  List<Object?> get props => [message, code, details];
}

/// Network-related errors
class NetworkError extends AppError {
  final int? statusCode;

  const NetworkError({
    required super.message,
    super.code,
    super.details,
    this.statusCode,
  });

  bool get isUnauthorized => statusCode == 401;
  bool get isForbidden => statusCode == 403;
  bool get isNotFound => statusCode == 404;
  bool get isServerError => statusCode != null && statusCode! >= 500;
}

/// Server error with specific API error response
class ServerError extends AppError {
  final Map<String, dynamic>? errorResponse;

  const ServerError({
    required super.message,
    super.code,
    this.errorResponse,
  });
}

/// Cache/persistence errors
class CacheError extends AppError {
  const CacheError({
    required super.message,
    super.code,
    super.details,
  });
}

/// Validation errors (form input, etc.)
class ValidationError extends AppError {
  final Map<String, String>? fieldErrors;

  const ValidationError({
    required super.message,
    this.fieldErrors,
    super.code,
  });
}

/// Authentication errors
class AuthError extends AppError {
  const AuthError({
    required super.message,
    super.code,
    super.details,
  });
}

/// Unexpected/unknown errors
class UnexpectedError extends AppError {
  final StackTrace? stackTrace;

  const UnexpectedError({
    required super.message,
    this.stackTrace,
    super.details,
  });
}

/// No internet connection
class NoInternetError extends NetworkError {
  const NoInternetError() : super(
    message: 'No internet connection',
    code: 'NO_INTERNET',
  );
}

/// Request timeout
class TimeoutError extends NetworkError {
  const TimeoutError() : super(
    message: 'Request timed out',
    code: 'TIMEOUT',
  );
}
