import 'package:equatable/equatable.dart';

/// Auth Tokens Entity - Domain representation of authentication tokens
class AuthTokens extends Equatable {
  final String accessToken;
  final DateTime accessTokenExpiresAt;
  final String refreshToken;
  final DateTime refreshTokenExpiresAt;

  const AuthTokens({
    required this.accessToken,
    required this.accessTokenExpiresAt,
    required this.refreshToken,
    required this.refreshTokenExpiresAt,
  });

  /// Check if access token is expired
  bool get isAccessTokenExpired => DateTime.now().isAfter(accessTokenExpiresAt);

  /// Check if refresh token is expired
  bool get isRefreshTokenExpired => DateTime.now().isAfter(refreshTokenExpiresAt);

  @override
  List<Object?> get props => [
        accessToken,
        accessTokenExpiresAt,
        refreshToken,
        refreshTokenExpiresAt,
      ];
}
