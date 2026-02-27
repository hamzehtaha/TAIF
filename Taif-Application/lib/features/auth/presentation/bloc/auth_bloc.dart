import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../../../core/utils/token_storage.dart';
import '../../../../core/utils/user_storage.dart';
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
  final UserStorage _userStorage;

  AuthBloc()
      : _authRepository = AuthRepositoryImpl(),
        _tokenStorage = TokenStorage(),
        _userStorage = UserStorage(),
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
      
      // Small delay to ensure token is written to storage
      await Future<void>.delayed(const Duration(milliseconds: 50));

      // Fetch and store complete user data from /api/User/me
      // Pass token directly to avoid flutter_secure_storage race condition on Windows
      AppLogger.info('Token from login - accessToken exists: ${tokens.accessToken.isNotEmpty}, refreshToken exists: ${tokens.refreshToken.isNotEmpty}');
      try {
        AppLogger.info('About to call getCurrentUser with token length: ${tokens.accessToken.length}');
        final user = await _authRepository.getCurrentUser(authToken: tokens.accessToken);
        AppLogger.info('getCurrentUser returned successfully');
        await _userStorage.storeUser(user);
        AppLogger.info('User logged in: ${user.fullName} (${user.displayRole})');
      } catch (userError) {
        // Fallback: store basic info if API call fails
        AppLogger.warning('Failed to fetch user details: $userError');
        await _userStorage.storeUserInfo(
          userId: event.email,
          firstName: '',
          lastName: '',
          email: event.email,
        );
      }

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

      // Fetch and store complete user data from /api/User/me
      // Pass token directly to avoid flutter_secure_storage race condition on Windows
      try {
        final user = await _authRepository.getCurrentUser(authToken: tokens.accessToken);
        await _userStorage.storeUser(user);
        AppLogger.info('User registered: ${user.fullName} (${user.displayRole})');
      } catch (userError) {
        // Fallback: store basic info from registration data
        AppLogger.warning('Failed to fetch user details: $userError');
        await _userStorage.storeUserInfo(
          userId: event.email,
          firstName: event.firstName,
          lastName: event.lastName,
          email: event.email,
        );
      }

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

      // Clear user info
      await _userStorage.clearUserInfo();

      AppLogger.info('User logged out');
      emit(const Unauthenticated());
    } catch (e) {
      AppLogger.error('Logout error: $e');
      // Still clear tokens and emit unauthenticated
      await _tokenStorage.clearTokens();
      await _userStorage.clearUserInfo();
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
