import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../features/auth/domain/entities/user.dart';
import 'logger.dart';

/// TAIF User Storage
/// Stores current user information (name, email, etc.) securely
class UserStorage {
  static const _userIdKey = 'user_id';
  static const _firstNameKey = 'first_name';
  static const _lastNameKey = 'last_name';
  static const _emailKey = 'email';
  static const _roleNameKey = 'role_name';
  static const _organizationNameKey = 'organization_name';
  static const _birthdayKey = 'birthday';
  static const _isActiveKey = 'is_active';
  static const _isCompletedKey = 'is_completed';

  final FlutterSecureStorage _secureStorage;

  UserStorage()
      : _secureStorage = const FlutterSecureStorage();

  /// Store basic user information after login/register (fallback)
  Future<void> storeUserInfo({
    required String userId,
    required String firstName,
    required String lastName,
    required String email,
    String? role,
  }) async {
    try {
      await _secureStorage.write(key: _userIdKey, value: userId);
      await _secureStorage.write(key: _firstNameKey, value: firstName);
      await _secureStorage.write(key: _lastNameKey, value: lastName);
      await _secureStorage.write(key: _emailKey, value: email);
      if (role != null) {
        await _secureStorage.write(key: _roleNameKey, value: role);
      }
      AppLogger.info('User info stored: $firstName $lastName ($email)');
    } catch (e) {
      AppLogger.error('Failed to store user info: $e');
      await _secureStorage.deleteAll();
      // Retry once after clearing
      await _secureStorage.write(key: _userIdKey, value: userId);
      await _secureStorage.write(key: _firstNameKey, value: firstName);
      await _secureStorage.write(key: _lastNameKey, value: lastName);
      await _secureStorage.write(key: _emailKey, value: email);
    }
  }

  /// Store complete user data from /api/User/me API
  Future<void> storeUser(User user) async {
    try {
      await _secureStorage.write(key: _userIdKey, value: user.id);
      await _secureStorage.write(key: _firstNameKey, value: user.firstName);
      await _secureStorage.write(key: _lastNameKey, value: user.lastName);
      await _secureStorage.write(key: _emailKey, value: user.email);
      await _secureStorage.write(key: _roleNameKey, value: user.displayRole);
      if (user.birthday != null) {
        await _secureStorage.write(key: _birthdayKey, value: user.birthday!.toIso8601String());
      }
      await _secureStorage.write(key: _isActiveKey, value: user.isActive.toString());
      await _secureStorage.write(key: _isCompletedKey, value: user.isCompleted.toString());
      if (user.organizationName != null) {
        await _secureStorage.write(key: _organizationNameKey, value: user.organizationName!);
      }
      AppLogger.info('User data stored: ${user.fullName} (${user.displayRole})');
    } catch (e) {
      AppLogger.error('Failed to store user data: $e');
      await _secureStorage.deleteAll();
      // Retry once
      await _secureStorage.write(key: _userIdKey, value: user.id);
      await _secureStorage.write(key: _firstNameKey, value: user.firstName);
      await _secureStorage.write(key: _lastNameKey, value: user.lastName);
      await _secureStorage.write(key: _emailKey, value: user.email);
      await _secureStorage.write(key: _roleNameKey, value: user.displayRole);
    }
  }

  /// Get user's full name
  Future<String?> getUserFullName() async {
    try {
      final firstName = await _secureStorage.read(key: _firstNameKey);
      final lastName = await _secureStorage.read(key: _lastNameKey);
      if (firstName != null && lastName != null) {
        return '$firstName $lastName';
      }
      return firstName ?? lastName;
    } catch (e) {
      AppLogger.error('Failed to get user name: $e');
      return null;
    }
  }

  /// Get user email
  Future<String?> getUserEmail() async {
    try {
      return await _secureStorage.read(key: _emailKey);
    } catch (e) {
      AppLogger.error('Failed to get user email: $e');
      return null;
    }
  }

  /// Get user ID
  Future<String?> getUserId() async {
    try {
      return await _secureStorage.read(key: _userIdKey);
    } catch (e) {
      AppLogger.error('Failed to get user ID: $e');
      return null;
    }
  }

  /// Get user role name
  Future<String?> getUserRoleName() async {
    try {
      return await _secureStorage.read(key: _roleNameKey) ?? 'Student';
    } catch (e) {
      AppLogger.error('Failed to get user role: $e');
      return 'Student';
    }
  }

  /// Get user role (alias for getUserRoleName for compatibility)
  Future<String?> getUserRole() async => getUserRoleName();

  /// Clear all user data (on logout)
  Future<void> clearUserInfo() async {
    try {
      await _secureStorage.delete(key: _userIdKey);
      await _secureStorage.delete(key: _firstNameKey);
      await _secureStorage.delete(key: _lastNameKey);
      await _secureStorage.delete(key: _emailKey);
      await _secureStorage.delete(key: _roleNameKey);
      await _secureStorage.delete(key: _organizationNameKey);
      await _secureStorage.delete(key: _birthdayKey);
      await _secureStorage.delete(key: _isActiveKey);
      await _secureStorage.delete(key: _isCompletedKey);
      AppLogger.info('User info cleared');
    } catch (e) {
      AppLogger.error('Failed to clear user info: $e');
    }
  }
}
