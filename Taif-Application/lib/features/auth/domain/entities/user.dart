import 'package:equatable/equatable.dart';

/// User Entity - Domain representation of a user
/// Follows Clean Architecture: Domain layer is independent of external concerns
class User extends Equatable {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final DateTime? birthday;
  final bool isActive;
  final bool isCompleted;
  final bool emailVerified;
  final String? userRoleType;
  final String? roleName;
  final String? organizationId;
  final String? organizationName;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.birthday,
    this.isActive = true,
    this.isCompleted = false,
    this.emailVerified = false,
    this.userRoleType,
    this.roleName,
    this.organizationId,
    this.organizationName,
    required this.createdAt,
    this.updatedAt,
  });

  /// Get full name
  String get fullName => '$firstName $lastName';

  /// Get display role name (roleName or userRoleType or 'Student')
  String get displayRole => roleName ?? userRoleType ?? 'Student';

  @override
  List<Object?> get props => [
        id,
        firstName,
        lastName,
        email,
        birthday,
        isActive,
        isCompleted,
        emailVerified,
        userRoleType,
        roleName,
        organizationId,
        organizationName,
        createdAt,
        updatedAt,
      ];
}
