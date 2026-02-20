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
  final String? userRoleType;
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
    this.userRoleType,
    required this.createdAt,
    this.updatedAt,
  });

  /// Get full name
  String get fullName => '$firstName $lastName';

  @override
  List<Object?> get props => [
        id,
        firstName,
        lastName,
        email,
        birthday,
        isActive,
        isCompleted,
        userRoleType,
        createdAt,
        updatedAt,
      ];
}
