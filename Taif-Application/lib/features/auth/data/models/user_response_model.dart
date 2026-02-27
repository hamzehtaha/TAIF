import '../../domain/entities/user.dart';

/// User Response Model
/// Maps to Server-api DTO: TAIF.Application.DTOs.Responses.UserResponse
class UserResponseModel {
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

  const UserResponseModel({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.birthday,
    required this.isActive,
    required this.isCompleted,
    this.emailVerified = false,
    this.userRoleType,
    this.roleName,
    this.organizationId,
    this.organizationName,
    required this.createdAt,
    this.updatedAt,
  });

  factory UserResponseModel.fromJson(Map<String, dynamic> json) {
    return UserResponseModel(
      id: json['id'] as String,
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      birthday: json['birthday'] != null 
          ? DateTime.tryParse(json['birthday'] as String) 
          : null,
      isActive: json['isActive'] as bool? ?? true,
      isCompleted: json['isCompleted'] as bool? ?? false,
      emailVerified: json['emailVerified'] as bool? ?? false,
      userRoleType: json['userRoleType'] as String?,
      roleName: json['roleName'] as String?,
      organizationId: json['organizationId'] as String?,
      organizationName: json['organizationName'] as String?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.tryParse(json['updatedAt'] as String) 
          : null,
    );
  }

  /// Convert to domain entity
  User toEntity() => User(
        id: id,
        firstName: firstName,
        lastName: lastName,
        email: email,
        birthday: birthday,
        isActive: isActive,
        isCompleted: isCompleted,
        emailVerified: emailVerified,
        userRoleType: userRoleType,
        roleName: roleName,
        organizationId: organizationId,
        organizationName: organizationName,
        createdAt: createdAt,
        updatedAt: updatedAt,
      );
}
