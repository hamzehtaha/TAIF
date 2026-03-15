/// Lesson Model
/// Represents a lesson in a course
class LessonModel {
  final String id;
  final String courseId;
  final String title;
  final String? description;
  final int order;
  final int? durationInMinutes;
  final List<LessonItemModel> items;

  LessonModel({
    required this.id,
    required this.courseId,
    required this.title,
    this.description,
    required this.order,
    this.durationInMinutes,
    this.items = const [],
  });

  factory LessonModel.fromJson(Map<String, dynamic> json) {
    return LessonModel(
      id: json['id'] as String? ?? '',
      courseId: json['courseId'] as String? ?? json['courseID'] as String? ?? '',
      title: json['title'] as String? ?? json['name'] as String? ?? '',
      description: json['description'] as String?,
      order: json['order'] as int? ?? 0,
      durationInMinutes: json['durationInMinutes'] as int?,
      items: (json['items'] as List<dynamic>?)
          ?.map((e) => LessonItemModel.fromJson(e as Map<String, dynamic>))
          .toList() ??
          const [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'courseId': courseId,
      'title': title,
      'description': description,
      'order': order,
      'durationInMinutes': durationInMinutes,
      'items': items.map((e) => e.toJson()).toList(),
    };
  }

  /// Get total duration from lesson items
  int get totalDurationInSeconds {
    return items.fold<int>(
      0,
      (sum, item) => sum + (item.durationInSeconds ?? 0),
    );
  }

  /// Get formatted duration string
  String get formattedDuration {
    final totalSeconds = totalDurationInSeconds;
    if (totalSeconds == 0) return '';
    
    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    
    if (hours > 0 && minutes > 0) {
      return '${hours}h ${minutes}m';
    } else if (hours > 0) {
      return '${hours}h';
    } else {
      return '${minutes}m';
    }
  }

  /// Get completed items count
  int get completedItemsCount {
    return items.where((item) => item.isCompleted).length;
  }

  /// Get progress percentage for this lesson
  double get progressPercentage {
    if (items.isEmpty) return 0.0;
    return (completedItemsCount / items.length) * 100;
  }

  /// Create a copy of this lesson with modified fields
  LessonModel copyWith({
    String? id,
    String? courseId,
    String? title,
    String? description,
    int? order,
    int? durationInMinutes,
    List<LessonItemModel>? items,
  }) {
    return LessonModel(
      id: id ?? this.id,
      courseId: courseId ?? this.courseId,
      title: title ?? this.title,
      description: description ?? this.description,
      order: order ?? this.order,
      durationInMinutes: durationInMinutes ?? this.durationInMinutes,
      items: items ?? this.items,
    );
  }
}

/// Lesson Item Model
/// Represents a lesson item (video, article, quiz, etc.)
class LessonItemModel {
  final String id;
  final String lessonId;
  final String name;
  final String? description;
  final LessonItemType type;
  final int order;
  final int? durationInSeconds;
  final bool isCompleted;
  final String? contentId;

  LessonItemModel({
    required this.id,
    required this.lessonId,
    required this.name,
    this.description,
    required this.type,
    required this.order,
    this.durationInSeconds,
    this.isCompleted = false,
    this.contentId,
  });

  factory LessonItemModel.fromJson(Map<String, dynamic> json) {
    return LessonItemModel(
      id: json['id'] as String? ?? '',
      lessonId: json['lessonId'] as String? ?? '',
      name: json['name'] as String? ?? '',
      description: json['description'] as String?,
      type: _parseLessonItemType(json['type'] as int? ?? 0),
      order: json['order'] as int? ?? 0,
      durationInSeconds: json['durationInSeconds'] as int?,
      isCompleted: json['isCompleted'] as bool? ?? false,
      contentId: json['contentId'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'lessonId': lessonId,
      'name': name,
      'description': description,
      'type': type.value,
      'order': order,
      'durationInSeconds': durationInSeconds,
      'isCompleted': isCompleted,
      'contentId': contentId,
    };
  }

  /// Parse lesson item type from int
  static LessonItemType _parseLessonItemType(int value) {
    switch (value) {
      case 0:
        return LessonItemType.video;
      case 1:
        return LessonItemType.article;
      case 2:
        return LessonItemType.quiz;
      case 3:
        return LessonItemType.assignment;
      default:
        return LessonItemType.video;
    }
  }

  /// Get icon based on type
  String get iconData {
    switch (type) {
      case LessonItemType.video:
        return 'play_circle';
      case LessonItemType.article:
        return 'article';
      case LessonItemType.quiz:
        return 'quiz';
      case LessonItemType.assignment:
        return 'assignment';
    }
  }

  /// Get formatted duration
  String get formattedDuration {
    if (durationInSeconds == null) return '';
    final minutes = durationInSeconds! ~/ 60;
    final seconds = durationInSeconds! % 60;
    if (minutes > 0) {
      return '${minutes}m ${seconds}s';
    }
    return '${seconds}s';
  }
}

/// Lesson Item Type Enum
enum LessonItemType {
  video(0),
  article(1),
  quiz(2),
  assignment(3);

  final int value;
  const LessonItemType(this.value);
}
