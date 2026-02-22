import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../../../core/utils/token_storage.dart';
import '../../data/repositories/auth_repository_impl.dart';
import '../../domain/entities/auth_tokens.dart';
import '../../domain/repositories/auth_repository.dart';
import 'auth_event.dart';
import 'auth_state.dart';

/// Auth BLoC
/// Manages authentication state following BLoC pattern
/// Handles login, register, logout, and token management
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepository;
  final TokenStorage _tokenStorage;

  AuthBloc()
      : _authRepository = AuthRepositoryImpl(),
        _tokenStorage = TokenStorage(),
        super(const AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<RegisterRequested>(_onRegisterRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
    on<ClearAuthError>(_onClearAuthError);
  }

  /// Handle login request
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      final tokens = await _authRepository.login(
        email: event.email,
        password: event.password,
      );

      // Store tokens securely
      await _storeTokens(tokens);

      AppLogger.info('User logged in: ${event.email}');
      emit(Authenticated(accessToken: tokens.accessToken));
    } catch (e) {
      AppLogger.error('Login failed: $e');
      emit(AuthError(e.toString()));
    }
  }

  /// Handle register request
  Future<void> _onRegisterRequested(
    RegisterRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      final tokens = await _authRepository.register(
        firstName: event.firstName,
        lastName: event.lastName,
        email: event.email,
        password: event.password,
        birthday: event.birthday,
      );

      // Store tokens securely
      await _storeTokens(tokens);

      AppLogger.info('User registered: ${event.email}');
      emit(Authenticated(accessToken: tokens.accessToken));
    } catch (e) {
      AppLogger.error('Registration failed: $e');
      emit(AuthError(e.toString()));
    }
  }

  /// Handle logout request
  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(const AuthLoading());

    try {
      // Call API logout
      await _authRepository.logout();

      // Clear stored tokens
      await _tokenStorage.clearTokens();

      AppLogger.info('User logged out');
      emit(const Unauthenticated());
    } catch (e) {
      AppLogger.error('Logout error: $e');
      // Still clear tokens and emit unauthenticated
      await _tokenStorage.clearTokens();
      emit(const Unauthenticated());
    }
  }

  /// Check authentication status on app start
  Future<void> _onCheckAuthStatus(
    CheckAuthStatus event,
    Emitter<AuthState> emit,
  ) async {
    final isAuthenticated = await _tokenStorage.isAuthenticated();

    if (isAuthenticated) {
      final token = await _tokenStorage.getAccessToken();
      if (token != null) {
        emit(Authenticated(accessToken: token));
        return;
      }
    }

    emit(const Unauthenticated());
  }

  /// Clear error state
  void _onClearAuthError(
    ClearAuthError event,
    Emitter<AuthState> emit,
  ) {
    emit(const AuthInitial());
  }

  /// Store tokens in secure storage
  Future<void> _storeTokens(AuthTokens tokens) async {
    await _tokenStorage.storeAccessToken(tokens.accessToken);
    await _tokenStorage.storeRefreshToken(tokens.refreshToken);
    await _tokenStorage.storeTokenExpiry(
      tokens.accessTokenExpiresAt.millisecondsSinceEpoch ~/ 1000,
    );
  }
}
