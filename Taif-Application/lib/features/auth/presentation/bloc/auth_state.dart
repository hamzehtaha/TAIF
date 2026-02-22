import 'package:equatable/equatable.dart';

/// Auth States
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

/// Initial state
class AuthInitial extends AuthState {
  const AuthInitial();
}

/// Loading state - during login/register
class AuthLoading extends AuthState {
  const AuthLoading();
}

/// Authenticated state - user is logged in
class Authenticated extends AuthState {
  final String accessToken;

  const Authenticated({required this.accessToken});

  @override
  List<Object?> get props => [accessToken];
}

/// Unauthenticated state - user is logged out
class Unauthenticated extends AuthState {
  const Unauthenticated();
}

/// Error state - auth operation failed
class AuthError extends AuthState {
  final String message;

  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}
