import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../data/models/content_model.dart';
import '../../data/models/lesson_model.dart';
import '../../data/repositories/lesson_repository.dart';

part 'lesson_event.dart';
part 'lesson_state.dart';

/// Lesson BLoC
/// Manages lesson state including content loading, progress tracking, and navigation
class LessonBloc extends Bloc<LessonEvent, LessonState> {
  final LessonRepository _repository;
  final String courseId;
  final String lessonId;
  final String? initialLessonItemId;

  LessonBloc({
    required LessonRepository repository,
    required this.courseId,
    required this.lessonId,
    this.initialLessonItemId,
  })  : _repository = repository,
        super(const LessonLoading()) {
    on<LoadLesson>(_onLoadLesson);
    on<LoadLessonContent>(_onLoadLessonContent);
    on<MarkItemCompleted>(_onMarkItemCompleted);
    on<NavigateToItem>(_onNavigateToItem);
    on<GoToNextItem>(_onGoToNextItem);
    on<GoToPreviousItem>(_onGoToPreviousItem);

    // Load lesson immediately
    add(const LoadLesson());
  }

  Future<void> _onLoadLesson(
    LoadLesson event,
    Emitter<LessonState> emit,
  ) async {
    emit(const LessonLoading());
    
    try {
      final lessonWithItems = await _repository.getLessonWithItems(
        lessonId: lessonId,
        courseId: courseId,
      );
      
      if (lessonWithItems == null) {
        emit(const LessonError('Failed to load lesson'));
        return;
      }

      // Find current item based on initialLessonItemId, or first incomplete, or first
      final items = lessonWithItems.items;
      LessonItemModel? currentItem;
      
      if (initialLessonItemId != null && initialLessonItemId!.isNotEmpty) {
        // Try to find the specified item
        currentItem = items.firstWhere(
          (item) => item.id == initialLessonItemId,
          orElse: () => items.firstWhere(
            (item) => !item.isCompleted,
            orElse: () => items.first,
          ),
        );
      } else if (items.isNotEmpty) {
        currentItem = items.firstWhere(
          (item) => !item.isCompleted,
          orElse: () => items.first,
        );
      }

      // Use embedded content from the current item (no API call needed)
      final currentContent = currentItem?.content;

      emit(LessonLoaded(
        lesson: lessonWithItems.lesson,
        items: items,
        currentItem: currentItem,
        currentItemIndex: currentItem != null
            ? items.indexOf(currentItem)
            : -1,
        currentContent: currentContent,
      ));
    } catch (e) {
      AppLogger.error('Error loading lesson: $e');
      emit(LessonError('Error loading lesson: $e'));
    }
  }

  Future<void> _onLoadLessonContent(
    LoadLessonContent event,
    Emitter<LessonState> emit,
  ) async {
    // Content is already embedded in lesson items - no API call needed
    // This method is kept for compatibility but does nothing
    final currentState = state;
    if (currentState is! LessonLoaded) return;

    // Content should already be loaded from the item's embedded content
    // If not, it means the item doesn't have content
    if (currentState.currentContent == null) {
      emit(currentState.copyWith(
        contentError: 'Content not available',
      ));
    }
  }

  Future<void> _onMarkItemCompleted(
    MarkItemCompleted event,
    Emitter<LessonState> emit,
  ) async {
    final currentState = state;
    if (currentState is! LessonLoaded) return;

    emit(currentState.copyWith(isMarkingComplete: true));

    try {
      final success = await _repository.markItemAsCompleted(
        courseId: courseId,
        lessonId: lessonId,
        lessonItemId: event.itemId,
      );

      if (success) {
        // Update local item status
        final updatedItems = currentState.items.map((item) {
          if (item.id == event.itemId) {
            return LessonItemModel(
              id: item.id,
              lessonId: item.lessonId,
              name: item.name,
              description: item.description,
              type: item.type,
              order: item.order,
              durationInSeconds: item.durationInSeconds,
              isCompleted: true,
              contentId: item.contentId,
              content: item.content,
            );
          }
          return item;
        }).toList();

        // Find the updated current item
        final updatedCurrentItem = updatedItems.firstWhere(
          (item) => item.id == currentState.currentItem?.id,
          orElse: () => currentState.currentItem!,
        );

        emit(currentState.copyWith(
          items: updatedItems,
          currentItem: updatedCurrentItem,
          isMarkingComplete: false,
        ));

        // Update last accessed item
        await _repository.updateLastLessonItem(
          courseId: courseId,
          lessonItemId: event.itemId,
        );
      } else {
        emit(currentState.copyWith(
          isMarkingComplete: false,
          errorMessage: 'Failed to mark as completed',
        ));
      }
    } catch (e) {
      AppLogger.error('Error marking item as completed: $e');
      emit(currentState.copyWith(
        isMarkingComplete: false,
        errorMessage: 'Error: $e',
      ));
    }
  }

  void _onNavigateToItem(
    NavigateToItem event,
    Emitter<LessonState> emit,
  ) {
    final currentState = state;
    if (currentState is! LessonLoaded) return;

    if (event.itemIndex < 0 || event.itemIndex >= currentState.items.length) {
      return;
    }

    final item = currentState.items[event.itemIndex];
    final itemContent = item.content;
    
    emit(currentState.copyWith(
      currentItem: item,
      currentItemIndex: event.itemIndex,
      currentContent: itemContent,
      contentError: itemContent == null ? 'Content not available' : null,
    ));

    // Update last accessed item
    _repository.updateLastLessonItem(
      courseId: courseId,
      lessonItemId: item.id,
    );
  }

  void _onGoToNextItem(
    GoToNextItem event,
    Emitter<LessonState> emit,
  ) {
    final currentState = state;
    if (currentState is! LessonLoaded) return;

    final nextIndex = currentState.currentItemIndex + 1;
    if (nextIndex < currentState.items.length) {
      add(NavigateToItem(nextIndex));
    }
  }

  void _onGoToPreviousItem(
    GoToPreviousItem event,
    Emitter<LessonState> emit,
  ) {
    final currentState = state;
    if (currentState is! LessonLoaded) return;

    final prevIndex = currentState.currentItemIndex - 1;
    if (prevIndex >= 0) {
      add(NavigateToItem(prevIndex));
    }
  }
}
