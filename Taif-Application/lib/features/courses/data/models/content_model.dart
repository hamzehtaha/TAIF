/// Content Model
/// Represents content for lesson items (video, article, etc.)
class ContentModel {
  final String id;
  final String title;
  final String? description;
  final ContentType type;
  final String? videoUrl;
  final String? articleContent;
  final String? articleContentAr;
  final int? durationInSeconds;
  final DateTime createdAt;
  final DateTime updatedAt;

  ContentModel({
    required this.id,
    required this.title,
    this.description,
    required this.type,
    this.videoUrl,
    this.articleContent,
    this.articleContentAr,
    this.durationInSeconds,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ContentModel.fromJson(Map<String, dynamic> json) {
    return ContentModel(
      id: json['id'] as String? ?? '',
      title: json['title'] as String? ?? json['name'] as String? ?? '',
      description: json['description'] as String?,
      type: _parseContentType(json['type'] as int? ?? 0),
      videoUrl: json['videoUrl'] as String? ?? json['videoURL'] as String?,
      articleContent: json['articleContent'] as String?,
      articleContentAr: json['articleContentAr'] as String? ?? json['articleContentAR'] as String?,
      durationInSeconds: json['durationInSeconds'] as int?,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'] as String) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'] as String) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'type': type.value,
      'videoUrl': videoUrl,
      'articleContent': articleContent,
      'articleContentAr': articleContentAr,
      'durationInSeconds': durationInSeconds,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  /// Get the appropriate content based on language preference
  String? getLocalizedContent({bool isArabic = false}) {
    if (isArabic && articleContentAr != null && articleContentAr!.isNotEmpty) {
      return articleContentAr;
    }
    return articleContent;
  }

  static ContentType _parseContentType(int value) {
    switch (value) {
      case 0:
        return ContentType.video;
      case 1:
        return ContentType.article;
      default:
        return ContentType.video;
    }
  }
}

/// Content Type Enum
enum ContentType {
  video(0),
  article(1);

  final int value;
  const ContentType(this.value);
}
