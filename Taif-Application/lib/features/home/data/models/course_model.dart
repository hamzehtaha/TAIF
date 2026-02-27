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
  });

  factory CourseModel.fromJson(Map<String, dynamic> json) {
    return CourseModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? '',
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
}
