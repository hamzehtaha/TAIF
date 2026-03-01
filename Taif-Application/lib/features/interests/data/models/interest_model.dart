import '../../domain/entities/interest.dart';

/// Interest Response Model
/// Maps to Server-api DTO: InterestDto
class InterestModel {
  final String id;
  final String name;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  const InterestModel({
    required this.id,
    required this.name,
    this.createdAt,
    this.updatedAt,
  });

  factory InterestModel.fromJson(Map<String, dynamic> json) {
    return InterestModel(
      id: json['id'] as String,
      name: json['name'] as String,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
        if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
      };

  /// Convert to domain entity
  Interest toEntity() => Interest(
        id: id,
        name: name,
      );
}

/// Update Interests Request Model
/// Maps to Server-api DTO: UpdateInterestsRequest
class UpdateInterestsRequestModel {
  final List<String> interests;

  const UpdateInterestsRequestModel({
    required this.interests,
  });

  Map<String, dynamic> toJson() => {
        'interests': interests,
      };
}
