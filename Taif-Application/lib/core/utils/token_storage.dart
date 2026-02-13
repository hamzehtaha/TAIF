import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// TAIF Secure Token Storage
/// Handles JWT and refresh token storage securely
/// Uses flutter_secure_storage for encrypted local storage
class TokenStorage {
  static const _accessTokenKey = 'access_token';
  static const _refreshTokenKey = 'refresh_token';
  static const _tokenExpiryKey = 'token_expiry';

  final FlutterSecureStorage _secureStorage;

  TokenStorage()
      : _secureStorage = const FlutterSecureStorage(
          aOptions: AndroidOptions(
            encryptedSharedPreferences: true,
          ),
          iOptions: IOSOptions(
            accountName: 'taif_tokens',
            accessibility: KeychainAccessibility.first_unlock_this_device,
          ),
        );

  /// Store access token securely
  Future<void> storeAccessToken(String token) async {
    await _secureStorage.write(key: _accessTokenKey, value: token);
  }

  /// Get stored access token
  Future<String?> getAccessToken() async =>
      await _secureStorage.read(key: _accessTokenKey);

  /// Store refresh token securely
  Future<void> storeRefreshToken(String token) async {
    await _secureStorage.write(key: _refreshTokenKey, value: token);
  }

  /// Get stored refresh token
  Future<String?> getRefreshToken() async =>
      await _secureStorage.read(key: _refreshTokenKey);

  /// Store token expiry timestamp
  Future<void> storeTokenExpiry(int expiryTimestamp) async {
    await _secureStorage.write(
      key: _tokenExpiryKey,
      value: expiryTimestamp.toString(),
    );
  }

  /// Get token expiry timestamp
  Future<int?> getTokenExpiry() async {
    final expiryStr = await _secureStorage.read(key: _tokenExpiryKey);
    return expiryStr != null ? int.tryParse(expiryStr) : null;
  }

  /// Check if token is expired
  Future<bool> isTokenExpired() async {
    final expiry = await getTokenExpiry();
    if (expiry == null) return true;

    final expiryDate = DateTime.fromMillisecondsSinceEpoch(expiry * 1000);
    return DateTime.now().isAfter(expiryDate);
  }

  /// Clear all stored tokens (logout)
  Future<void> clearTokens() async {
    await _secureStorage.delete(key: _accessTokenKey);
    await _secureStorage.delete(key: _refreshTokenKey);
    await _secureStorage.delete(key: _tokenExpiryKey);
  }

  /// Check if user is authenticated
  Future<bool> isAuthenticated() async {
    final token = await getAccessToken();
    return token != null && !await isTokenExpired();
  }
}
