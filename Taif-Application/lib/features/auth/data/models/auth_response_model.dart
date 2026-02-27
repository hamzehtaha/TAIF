import '../../domain/entities/auth_tokens.dart';

/// Auth Response Model
/// Maps to Server-api DTO: TAIF.Application.DTOs.Responses.AuthResponse
class AuthResponseModel {
  final String accessToken;
  final DateTime accessTokenExpiresAt;
  final String refreshToken;
  final DateTime refreshTokenExpiresAt;

  const AuthResponseModel({
    required this.accessToken,
    required this.accessTokenExpiresAt,
    required this.refreshToken,
    required this.refreshTokenExpiresAt,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['accessToken'] as String? ?? '',
      accessTokenExpiresAt: json['accessTokenExpiresAt'] != null
          ? DateTime.tryParse(json['accessTokenExpiresAt'] as String) ?? DateTime.now().add(const Duration(hours: 1))
          : DateTime.now().add(const Duration(hours: 1)),
      refreshToken: json['refreshToken'] as String? ?? '',
      refreshTokenExpiresAt: json['refreshTokenExpiresAt'] != null
          ? DateTime.tryParse(json['refreshTokenExpiresAt'] as String) ?? DateTime.now().add(const Duration(days: 7))
          : DateTime.now().add(const Duration(days: 7)),
    );
  }

  /// Convert to domain entity
  AuthTokens toEntity() => AuthTokens(
        accessToken: accessToken,
        accessTokenExpiresAt: accessTokenExpiresAt,
        refreshToken: refreshToken,
        refreshTokenExpiresAt: refreshTokenExpiresAt,
      );
}
