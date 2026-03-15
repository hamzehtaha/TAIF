/// Course Model
/// Represents a course in the system
class CourseModel {
  final String id;
  final String title;
  final String? description;
  final String? imageUrl;
  final String categoryId;
  final String? categoryName;
  final int? durationInMinutes;
  final double? rating;
  final int? reviewCount;
  final int progress;
  final bool isEnrolled;
  final bool isFavourite;
  final bool isRecommended;

  CourseModel({
    required this.id,
    required this.title,
    this.description,
    this.imageUrl,
    required this.categoryId,
    this.categoryName,
    this.durationInMinutes,
    this.rating,
    this.reviewCount,
    this.progress = 0,
    this.isEnrolled = false,
    this.isFavourite = false,
    this.isRecommended = false,
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? json['name'] as String? ?? '',
      description: json['description'] as String?,
      imageUrl: json['imageUrl'] as String? ?? 
                json['thumbnailUrl'] as String? ?? 
                json['photo'] as String?,
      categoryId: json['categoryId'] as String? ?? '',
      categoryName: json['categoryName'] as String?,
      durationInMinutes: json['durationInMinutes'] as int?,
      rating: (json['rating'] as num?)?.toDouble(),
      reviewCount: json['reviewCount'] as int?,
      progress: json['progress'] as int? ?? 0,
      isEnrolled: json['isEnrolled'] as bool? ?? false,
      isFavourite: json['isFavourite'] as bool? ?? false,
      isRecommended: json['isRecommended'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'imageUrl': imageUrl,
      'categoryId': categoryId,
      'categoryName': categoryName,
      'durationInMinutes': durationInMinutes,
      'rating': rating,
      'reviewCount': reviewCount,
      'progress': progress,
      'isEnrolled': isEnrolled,
      'isFavourite': isFavourite,
      'isRecommended': isRecommended,
    };
  }

  String get formattedDuration {
    if (durationInMinutes == null) return '';
    final hours = durationInMinutes! ~/ 60;
    final minutes = durationInMinutes! % 60;
    if (hours > 0 && minutes > 0) {
      return '${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h';
    } else {
      return '${minutes}m';
    }
  }

  /// Create a copy of this course with modified fields
  CourseModel copyWith({
    String? id,
    String? title,
    String? description,
    String? imageUrl,
    String? categoryId,
    String? categoryName,
    int? durationInMinutes,
    double? rating,
    int? reviewCount,
    int? progress,
    bool? isEnrolled,
    bool? isFavourite,
    bool? isRecommended,
  }) {
    return CourseModel(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      imageUrl: imageUrl ?? this.imageUrl,
      categoryId: categoryId ?? this.categoryId,
      categoryName: categoryName ?? this.categoryName,
      durationInMinutes: durationInMinutes ?? this.durationInMinutes,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      progress: progress ?? this.progress,
      isEnrolled: isEnrolled ?? this.isEnrolled,
      isFavourite: isFavourite ?? this.isFavourite,
      isRecommended: isRecommended ?? this.isRecommended,
    );
  }
}
