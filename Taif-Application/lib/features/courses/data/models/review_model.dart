/// Review Model
/// Represents a course review
class ReviewModel {
  final String id;
  final String courseId;
  final String userId;
  final String? userName;
  final int rating;
  final String comment;
  final DateTime createdAt;
  final DateTime? updatedAt;

  ReviewModel({
    required this.id,
    required this.courseId,
    required this.userId,
    this.userName,
    required this.rating,
    required this.comment,
    required this.createdAt,
    this.updatedAt,
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['id'] as String? ?? '',
      courseId: json['courseId'] as String? ?? '',
      userId: json['userId'] as String? ?? '',
      userName: json['userName'] as String? ?? 
                '${json['userFirstName'] ?? ''} ${json['userLastName'] ?? ''}'.trim(),
      rating: json['rating'] as int? ?? 0,
      comment: json['comment'] as String? ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseId': courseId,
      'userId': userId,
      'userName': userName,
      'rating': rating,
      'comment': comment,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  /// Get formatted date string
  String get formattedDate {
    final day = createdAt.day;
    final month = _getMonthName(createdAt.month);
    final year = createdAt.year;
    return '$month $day, $year';
  }

  String _getMonthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return months[month - 1];
  }
}

/// Review Statistics Model
/// Represents review statistics for a course
class ReviewStatisticsModel {
  final double averageRating;
  final int totalReviews;

  ReviewStatisticsModel({
    required this.averageRating,
    required this.totalReviews,
  });

  factory ReviewStatisticsModel.fromJson(Map<String, dynamic> json) {
    return ReviewStatisticsModel(
      averageRating: (json['averageRating'] as num?)?.toDouble() ?? 0.0,
      totalReviews: json['totalReviews'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'averageRating': averageRating,
      'totalReviews': totalReviews,
    };
  }
}
