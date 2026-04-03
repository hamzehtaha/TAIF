part of 'lesson_bloc.dart';

/// Lesson States
abstract class LessonState extends Equatable {
  const LessonState();

  @override
  List<Object?> get props => [];
}

/// Lesson loading state
class LessonLoading extends LessonState {
  const LessonLoading();
}

/// Lesson loaded state
class LessonLoaded extends LessonState {
  final LessonModel lesson;
  final List<LessonItemModel> items;
  final LessonItemModel? currentItem;
  final int currentItemIndex;
  final ContentModel? currentContent;
  final bool isLoadingContent;
  final bool isMarkingComplete;
  final String? contentError;
  final String? errorMessage;

  const LessonLoaded({
    required this.lesson,
    required this.items,
    this.currentItem,
    this.currentItemIndex = -1,
    this.currentContent,
    this.isLoadingContent = false,
    this.isMarkingComplete = false,
    this.contentError,
    this.errorMessage,
  });

  LessonLoaded copyWith({
    LessonModel? lesson,
    List<LessonItemModel>? items,
    LessonItemModel? currentItem,
    int? currentItemIndex,
    ContentModel? currentContent,
    bool? isLoadingContent,
    bool? isMarkingComplete,
    String? contentError,
    String? errorMessage,
  }) {
    return LessonLoaded(
      lesson: lesson ?? this.lesson,
      items: items ?? this.items,
      currentItem: currentItem ?? this.currentItem,
      currentItemIndex: currentItemIndex ?? this.currentItemIndex,
      currentContent: currentContent ?? this.currentContent,
      isLoadingContent: isLoadingContent ?? this.isLoadingContent,
      isMarkingComplete: isMarkingComplete ?? this.isMarkingComplete,
      contentError: contentError,
      errorMessage: errorMessage,
    );
  }

  @override
  List<Object?> get props => [
        lesson,
        items,
        currentItem,
        currentItemIndex,
        currentContent,
        isLoadingContent,
        isMarkingComplete,
        contentError,
        errorMessage,
      ];
}

/// Lesson error state
class LessonError extends LessonState {
  final String message;

  const LessonError(this.message);

  @override
  List<Object?> get props => [message];
}
