/// Enrollment Model
/// Represents a user's enrollment in a course
class EnrollmentModel {
  final String id;
  final String userId;
  final String courseId;
  final DateTime enrolledAt;
  final DateTime? completedAt;
  final DateTime? lastAccessedAt;
  final String? lastLessonItemId;
  final int progressPercentage;
  final bool isCompleted;
  final bool isFavourite;
  final double? completedDurationInSeconds;
  final int? totalDurationInSeconds;

  EnrollmentModel({
    required this.id,
    required this.userId,
    required this.courseId,
    required this.enrolledAt,
    this.completedAt,
    this.lastAccessedAt,
    this.lastLessonItemId,
    this.progressPercentage = 0,
    this.isCompleted = false,
    this.isFavourite = false,
    this.completedDurationInSeconds,
    this.totalDurationInSeconds,
  });

  factory EnrollmentModel.fromJson(Map<String, dynamic> json) {
    return EnrollmentModel(
      id: json['id'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      courseId: json['courseId'] as String? ?? '',
      enrolledAt: json['enrolledAt'] != null 
          ? DateTime.parse(json['enrolledAt'] as String)
          : DateTime.now(),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      lastAccessedAt: json['lastAccessedAt'] != null 
          ? DateTime.parse(json['lastAccessedAt'] as String)
          : null,
      lastLessonItemId: json['lastLessonItemId'] as String?,
      progressPercentage: json['progressPercentage'] as int? ?? 0,
      isCompleted: json['isCompleted'] as bool? ?? false,
      isFavourite: json['isFavourite'] as bool? ?? false,
      completedDurationInSeconds: (json['completedDurationInSeconds'] as num?)?.toDouble(),
      totalDurationInSeconds: json['totalDurationInSeconds'] as int?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'courseId': courseId,
      'enrolledAt': enrolledAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'lastAccessedAt': lastAccessedAt?.toIso8601String(),
      'lastLessonItemId': lastLessonItemId,
      'progressPercentage': progressPercentage,
      'isCompleted': isCompleted,
      'isFavourite': isFavourite,
      'completedDurationInSeconds': completedDurationInSeconds,
      'totalDurationInSeconds': totalDurationInSeconds,
    };
  }

  /// Check if user has started learning (has any progress)
  bool get hasStartedLearning {
    return progressPercentage > 0 || lastLessonItemId != null || (completedDurationInSeconds != null && completedDurationInSeconds! > 0);
  }

  /// Calculate progress percentage based on duration if available
  int get calculatedProgress {
    if (progressPercentage > 0) {
      return progressPercentage;
    }
    if (totalDurationInSeconds != null && 
        totalDurationInSeconds! > 0 && 
        completedDurationInSeconds != null) {
      return ((completedDurationInSeconds! / totalDurationInSeconds!) * 100).round();
    }
    return 0;
  }

  /// Get completed hours as formatted string
  String get completedHoursFormatted {
    if (completedDurationInSeconds == null || completedDurationInSeconds! <= 0) {
      return '0';
    }
    final hours = completedDurationInSeconds! / 3600;
    return hours.toStringAsFixed(1);
  }
}

/// Enrollment Request Model
/// Used for enrolling in a course
class EnrollRequest {
  final String courseId;

  EnrollRequest({required this.courseId});

  Map<String, dynamic> toJson() {
    return {
      'courseId': courseId,
    };
  }
}

/// Toggle Favourite Request Model
/// Used for toggling favourite status
class ToggleFavouriteRequest {
  final String courseId;

  ToggleFavouriteRequest({required this.courseId});

  Map<String, dynamic> toJson() {
    return {
      'courseId': courseId,
    };
  }
}
