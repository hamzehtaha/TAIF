/// Enrollment Model
/// Represents a user's enrollment in a course with progress
class EnrollmentModel {
  final String id;
  final String userId;
  final String courseId;
  final DateTime enrolledAt;
  final bool isCompleted;
  final double? completedDurationInSeconds;
  final double? totalDurationInSeconds;
  final int? progressPercentage;

  EnrollmentModel({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.enrolledAt,
    this.isCompleted = false,
    this.completedDurationInSeconds,
    this.totalDurationInSeconds,
    this.progressPercentage,
  });

  factory EnrollmentModel.fromJson(Map<String, dynamic> json) {
    return EnrollmentModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      courseId: json['courseId'] as String? ?? '',
      enrolledAt: json['enrolledAt'] != null
          ? DateTime.tryParse(json['enrolledAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      isCompleted: json['isCompleted'] as bool? ?? false,
      completedDurationInSeconds: (json['completedDurationInSeconds'] as num?)?.toDouble(),
      totalDurationInSeconds: (json['totalDurationInSeconds'] as num?)?.toDouble(),
      progressPercentage: json['progressPercentage'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'courseId': courseId,
      'enrolledAt': enrolledAt.toIso8601String(),
      'isCompleted': isCompleted,
      'completedDurationInSeconds': completedDurationInSeconds,
      'totalDurationInSeconds': totalDurationInSeconds,
      'progressPercentage': progressPercentage,
    };
  }

  /// Calculate progress percentage based on completed vs total duration
  int get calculatedProgress {
    if (progressPercentage != null) return progressPercentage!;
    if (totalDurationInSeconds == null || totalDurationInSeconds == 0) return 0;
    if (completedDurationInSeconds == null) return 0;
    return ((completedDurationInSeconds! / totalDurationInSeconds!) * 100).round();
  }
}
