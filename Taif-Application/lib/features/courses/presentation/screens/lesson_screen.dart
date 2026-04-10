import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/network/network_client.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../data/datasources/lesson_api_client.dart';
import '../../data/models/content_model.dart';
import '../../data/models/lesson_model.dart';
import '../../data/repositories/lesson_repository.dart';
import '../bloc/lesson_bloc.dart';

/// Lesson Screen
/// Displays lesson content with navigation between lesson items
/// Supports video, article, quiz, and assignment lesson types
class LessonScreen extends StatelessWidget {
  final String courseId;
  final String lessonId;
  final String? lessonItemId;

  const LessonScreen({
    super.key,
    required this.courseId,
    required this.lessonId,
    this.lessonItemId,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => LessonBloc(
        repository: LessonRepository(LessonApiClient(NetworkClient().dio)),
        courseId: courseId,
        lessonId: lessonId,
        initialLessonItemId: lessonItemId,
      ),
      child: const _LessonView(),
    );
  }
}

class _LessonView extends StatelessWidget {
  const _LessonView();

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      appBar: AppBar(
        backgroundColor: colorScheme.surface,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: BlocBuilder<LessonBloc, LessonState>(
          builder: (context, state) {
            if (state is LessonLoaded) {
              return Text(
                state.lesson.title,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              );
            }
            return const SizedBox.shrink();
          },
        ),
      ),
      body: BlocConsumer<LessonBloc, LessonState>(
        listener: (context, state) {
          if (state is LessonError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message)),
            );
          }
        },
        builder: (context, state) {
          if (state is LessonLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (state is LessonError) {
            return _buildErrorState(context, state);
          }

          if (state is LessonLoaded) {
            return _buildLessonContent(context, state);
          }

          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, LessonError state) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            'Failed to load lesson',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            state.message,
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              context.read<LessonBloc>().add(const LoadLesson());
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildLessonContent(BuildContext context, LessonLoaded state) {
    if (state.items.isEmpty) {
      return _buildEmptyLesson(context);
    }

    return Column(
      children: [
        // Progress indicator
        _buildProgressIndicator(context, state),

        // Content area
        Expanded(
          child: _buildItemContent(context, state),
        ),

        // Navigation controls
        _buildNavigationControls(context, state),
      ],
    );
  }

  Widget _buildProgressIndicator(BuildContext context, LessonLoaded state) {
    final colorScheme = Theme.of(context).colorScheme;
    final completedCount = state.items.where((item) => item.isCompleted).length;
    final progress = state.items.isEmpty ? 0.0 : completedCount / state.items.length;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        border: Border(
          bottom: BorderSide(
            color: colorScheme.outline.withAlpha(30),
          ),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progress',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: colorScheme.onSurface,
                ),
              ),
              Text(
                '$completedCount/${state.items.length} items',
                style: TextStyle(
                  fontSize: 12,
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: progress,
            backgroundColor: colorScheme.surfaceContainerHighest,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
            minHeight: 6,
            borderRadius: BorderRadius.circular(3),
          ),
        ],
      ),
    );
  }

  Widget _buildItemContent(BuildContext context, LessonLoaded state) {
    final currentItem = state.currentItem;

    if (currentItem == null) {
      return const Center(child: Text('No lesson items available'));
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Item header
          _buildItemHeader(context, currentItem, state.currentItemIndex, state.items.length),
          const SizedBox(height: 24),

          // Content based on type
          _buildContentByType(context, state, currentItem),
        ],
      ),
    );
  }

  Widget _buildItemHeader(BuildContext context, LessonItemModel item, int index, int total) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.primary.withAlpha(20),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'Item ${index + 1} of $total',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primary,
                ),
              ),
            ),
            const SizedBox(width: 8),
            if (item.isCompleted)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.green.withAlpha(20),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.check_circle, size: 12, color: Colors.green),
                    SizedBox(width: 4),
                    Text(
                      'Completed',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.green,
                      ),
                    ),
                  ],
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          item.name,
          style: TextStyle(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: colorScheme.onSurface,
          ),
        ),
        if (item.description != null && item.description!.isNotEmpty) ...[
          const SizedBox(height: 8),
          Text(
            item.description!,
            style: TextStyle(
              fontSize: 16,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildContentByType(BuildContext context, LessonLoaded state, LessonItemModel item) {
    final colorScheme = Theme.of(context).colorScheme;

    switch (item.type) {
      case LessonItemType.video:
        return _buildVideoContent(context, state, item);
      case LessonItemType.article:
        return _buildArticleContent(context, state, item);
      case LessonItemType.quiz:
        return _buildQuizContent(context, state, item);
      case LessonItemType.assignment:
        return _buildAssignmentContent(context, state, item);
    }
  }

  Widget _buildVideoContent(BuildContext context, LessonLoaded state, LessonItemModel item) {
    final colorScheme = Theme.of(context).colorScheme;

    if (state.isLoadingContent) {
      return const Center(child: CircularProgressIndicator());
    }

    final content = state.currentContent;
    if (content == null) {
      return _buildContentNotAvailable(context);
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Video placeholder
        AspectRatio(
          aspectRatio: 16 / 9,
          child: Container(
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.play_circle_filled,
                    size: 64,
                    color: AppColors.primary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    content.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                      color: colorScheme.onSurface,
                    ),
                  ),
                  if (content.durationInSeconds != null) ...[
                    const SizedBox(height: 8),
                    Text(
                      _formatDuration(content.durationInSeconds!),
                      style: TextStyle(
                        fontSize: 14,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
        const SizedBox(height: 24),
        if (content.description != null) ...[
          Text(
            content.description!,
            style: TextStyle(
              fontSize: 16,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 24),
        ],
        _buildMarkCompleteButton(context, state, item),
      ],
    );
  }

  Widget _buildArticleContent(BuildContext context, LessonLoaded state, LessonItemModel item) {
    final colorScheme = Theme.of(context).colorScheme;

    if (state.isLoadingContent) {
      return const Center(child: CircularProgressIndicator());
    }

    final content = state.currentContent;
    if (content == null) {
      return _buildContentNotAvailable(context);
    }

    // Get localized content
    final articleContent = content.getLocalizedContent();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (articleContent != null && articleContent.isNotEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: colorScheme.surfaceContainerHighest,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: colorScheme.outline.withAlpha(30),
              ),
            ),
            child: Text(
              articleContent,
              style: TextStyle(
                fontSize: 16,
                height: 1.6,
                color: colorScheme.onSurface,
              ),
            ),
          )
        else
          Text(
            'No content available',
            style: TextStyle(
              fontSize: 16,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        const SizedBox(height: 24),
        _buildMarkCompleteButton(context, state, item),
      ],
    );
  }

  Widget _buildQuizContent(BuildContext context, LessonLoaded state, LessonItemModel item) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.orange.withAlpha(20),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.quiz, color: Colors.orange),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Quiz questions will be displayed here',
                  style: TextStyle(
                    fontSize: 16,
                    color: colorScheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _buildMarkCompleteButton(context, state, item),
      ],
    );
  }

  Widget _buildAssignmentContent(BuildContext context, LessonLoaded state, LessonItemModel item) {
    final colorScheme = Theme.of(context).colorScheme;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.blue.withAlpha(20),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.assignment, color: Colors.blue),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Assignment details will be displayed here',
                  style: TextStyle(
                    fontSize: 16,
                    color: colorScheme.onSurface,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        _buildMarkCompleteButton(context, state, item),
      ],
    );
  }

  Widget _buildContentNotAvailable(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Icon(
            Icons.warning_amber_rounded,
            size: 48,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'Content not available',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w500,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'This content could not be loaded. Please try again.',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMarkCompleteButton(BuildContext context, LessonLoaded state, LessonItemModel item) {
    if (item.isCompleted) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      width: double.infinity,
      child: ElevatedButton.icon(
        onPressed: state.isMarkingComplete
            ? null
            : () {
                context.read<LessonBloc>().add(MarkItemCompleted(item.id));
              },
        icon: state.isMarkingComplete
            ? const SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            : const Icon(Icons.check_circle_outline),
        label: Text(state.isMarkingComplete ? 'Marking...' : 'Mark as Complete'),
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  Widget _buildNavigationControls(BuildContext context, LessonLoaded state) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: colorScheme.outline.withAlpha(30),
          ),
        ),
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Previous button
            Expanded(
              child: state.currentItemIndex > 0
                  ? OutlinedButton.icon(
                      onPressed: () {
                        context.read<LessonBloc>().add(const GoToPreviousItem());
                      },
                      icon: const Icon(Icons.arrow_back),
                      label: const Text('Previous'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        side: BorderSide(color: colorScheme.outline),
                      ),
                    )
                  : const SizedBox.shrink(),
            ),
            const SizedBox(width: 16),
            // Next button
            Expanded(
              child: state.currentItemIndex < state.items.length - 1
                  ? ElevatedButton.icon(
                      onPressed: () {
                        context.read<LessonBloc>().add(const GoToNextItem());
                      },
                      icon: const Text('Next'),
                      label: const Icon(Icons.arrow_forward),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    )
                  : ElevatedButton.icon(
                      onPressed: () {
                        // Finish lesson
                        context.pop();
                      },
                      icon: const Text('Finish'),
                      label: const Icon(Icons.check),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyLesson(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.folder_open_outlined,
            size: 64,
            color: colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 16),
          Text(
            'This lesson has no content',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w500,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Check back later for updates',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  String _formatDuration(int seconds) {
    final minutes = seconds ~/ 60;
    final remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return '${minutes}m ${remainingSeconds}s';
    }
    return '${remainingSeconds}s';
  }
}
