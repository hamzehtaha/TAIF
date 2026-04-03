part of 'lesson_bloc.dart';

/// Lesson Events
abstract class LessonEvent extends Equatable {
  const LessonEvent();

  @override
  List<Object?> get props => [];
}

/// Load lesson
class LoadLesson extends LessonEvent {
  const LoadLesson();
}

/// Load lesson content
class LoadLessonContent extends LessonEvent {
  final String contentId;

  const LoadLessonContent(this.contentId);

  @override
  List<Object?> get props => [contentId];
}

/// Mark item as completed
class MarkItemCompleted extends LessonEvent {
  final String itemId;

  const MarkItemCompleted(this.itemId);

  @override
  List<Object?> get props => [itemId];
}

/// Navigate to specific item
class NavigateToItem extends LessonEvent {
  final int itemIndex;

  const NavigateToItem(this.itemIndex);

  @override
  List<Object?> get props => [itemIndex];
}

/// Go to next item
class GoToNextItem extends LessonEvent {
  const GoToNextItem();
}

/// Go to previous item
class GoToPreviousItem extends LessonEvent {
  const GoToPreviousItem();
}
