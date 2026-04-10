import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/logger.dart';
import '../../data/models/lesson_model.dart';
import '../../data/models/review_model.dart';
import '../bloc/course_details_bloc.dart';
import '../bloc/course_details_event.dart';
import '../bloc/course_details_state.dart';

// Route observer for refreshing when returning from LessonScreen
final RouteObserver<PageRoute> routeObserver = RouteObserver<PageRoute>();

/// Course Details Screen
/// Displays comprehensive information about a course including:
/// - Course image and header
/// - Title, description, category
/// - Course stats (lessons, duration, enrolled, rating)
/// - Enroll/Start/Continue Learning CTA button
/// - Collapsible lessons with lesson items
/// - Reviews section
class CourseDetailsScreen extends StatelessWidget {
  final String courseId;

  const CourseDetailsScreen({
    super.key,
    required this.courseId,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => CourseDetailsBloc()
        ..add(LoadCourseDetails(courseId)),
      child: _CourseDetailsView(courseId: courseId),
    );
  }
}

class _CourseDetailsView extends StatefulWidget {
  final String courseId;

  const _CourseDetailsView({required this.courseId});

  @override
  State<_CourseDetailsView> createState() => _CourseDetailsViewState();
}

class _CourseDetailsViewState extends State<_CourseDetailsView>
    with RouteAware {
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      routeObserver.subscribe(this, route);
    }
  }

  @override
  void dispose() {
    routeObserver.unsubscribe(this);
    super.dispose();
  }

  @override
  void didPopNext() {
    // Refresh when coming back from LessonScreen
    AppLogger.info('CourseDetails: didPopNext triggered - refreshing data');
    context.read<CourseDetailsBloc>().add(const RefreshCourseDetails());
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: BlocListener<CourseDetailsBloc, CourseDetailsState>(
        listener: (context, state) {
          if (state is CourseDetailsNavigateToLesson) {
            context.push(AppRoutes.lessonPath(widget.courseId, state.lessonId));
          }
        },
        child: BlocBuilder<CourseDetailsBloc, CourseDetailsState>(
          builder: (context, state) {
            if (state is CourseDetailsLoading) {
              return const Center(child: CircularProgressIndicator());
            }

            if (state is CourseDetailsError) {
              return _buildErrorState(context, state);
            }

            if (state is CourseDetailsLoaded) {
              return _buildCourseDetails(context, state);
            }

            return const SizedBox.shrink();
          },
        ),
      ),
    );
  }

  Widget _buildErrorState(BuildContext context, CourseDetailsError state) {
    final colorScheme = Theme.of(context).colorScheme;

    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.error_outline, size: 64, color: AppColors.error),
          const SizedBox(height: 16),
          Text(
            'Failed to load course',
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
              context.read<CourseDetailsBloc>().add(const RefreshCourseDetails());
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseDetails(BuildContext context, CourseDetailsLoaded state) {
    final colorScheme = Theme.of(context).colorScheme;
    final course = state.course;

    return CustomScrollView(
      slivers: [
        // App Bar with Course Image
        SliverAppBar(
          expandedHeight: 240,
          pinned: true,
          backgroundColor: colorScheme.surface,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
          actions: [
            if (state.isEnrolled)
              IconButton(
                icon: Icon(
                  course.isFavourite ? Icons.favorite : Icons.favorite_border,
                  color: course.isFavourite ? Colors.red : null,
                ),
                onPressed: () {
                  context.read<CourseDetailsBloc>().add(const ToggleFavourite());
                },
              ),
          ],
          flexibleSpace: FlexibleSpaceBar(
            background: _buildCourseImage(course.imageUrl, colorScheme),
          ),
        ),

        // Course Content
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Category Badge
                if (course.categoryName != null)
                  _buildCategoryBadge(course.categoryName!, colorScheme),

                const SizedBox(height: 16),

                // Course Title
                Text(
                  course.title,
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),

                const SizedBox(height: 16),

                // Course Stats
                _buildCourseStats(state, colorScheme),

                const SizedBox(height: 24),

                // Description
                Text(
                  'Description',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: colorScheme.onSurface,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  course.description ?? 'No description available.',
                  style: TextStyle(
                    fontSize: 16,
                    color: colorScheme.onSurfaceVariant,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 24),

                // CTA Button
                _buildCTAButton(context, state, colorScheme),

                const SizedBox(height: 32),

                // Lessons Section
                _buildLessonsSection(context, state, colorScheme),

                const SizedBox(height: 32),

                // Reviews Section
                _buildReviewsSection(context, state, colorScheme),

                const SizedBox(height: 100),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCourseImage(String? imageUrl, ColorScheme colorScheme) {
    return Container(
      color: colorScheme.surfaceContainer,
      child: imageUrl != null && imageUrl.isNotEmpty
          ? Image.network(
              imageUrl,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
              errorBuilder: (_, __, ___) => _buildPlaceholderImage(colorScheme),
            )
          : _buildPlaceholderImage(colorScheme),
    );
  }

  Widget _buildPlaceholderImage(ColorScheme colorScheme) {
    return Container(
      color: colorScheme.surfaceContainer,
      child: Center(
        child: Icon(
          Icons.image_outlined,
          size: 64,
          color: colorScheme.onSurfaceVariant,
        ),
      ),
    );
  }

  Widget _buildCategoryBadge(String category, ColorScheme colorScheme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.primary.withOpacity(0.3)),
      ),
      child: Text(
        category,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: AppColors.primary,
        ),
      ),
    );
  }

  Widget _buildCourseStats(CourseDetailsLoaded state, ColorScheme colorScheme) {
    final stats = [
      if (state.totalLessons > 0)
        _StatItem(
          icon: Icons.book_outlined,
          value: '${state.totalLessons}',
          label: state.totalLessons == 1 ? 'Lesson' : 'Lessons',
        ),
      if (state.totalItems > 0)
        _StatItem(
          icon: Icons.check_circle_outline,
          value: '${state.completedItemsCount}/${state.totalItems}',
          label: 'Items',
        ),
      if (state.reviewStatistics != null)
        _StatItem(
          icon: Icons.star,
          value: state.reviewStatistics!.averageRating.toStringAsFixed(1),
          label: '(${state.reviewStatistics!.totalReviews})',
          iconColor: Colors.amber,
        ),
    ];

    if (stats.isEmpty) return const SizedBox.shrink();

    return Wrap(
      spacing: 16,
      runSpacing: 12,
      children: stats
          .map((stat) => _buildStatItem(stat, colorScheme))
          .toList(),
    );
  }

  Widget _buildStatItem(_StatItem stat, ColorScheme colorScheme) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          stat.icon,
          size: 20,
          color: stat.iconColor ?? colorScheme.onSurfaceVariant,
        ),
        const SizedBox(width: 4),
        Text(
          stat.value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            color: colorScheme.onSurface,
          ),
        ),
        const SizedBox(width: 4),
        Text(
          stat.label,
          style: TextStyle(
            fontSize: 14,
            color: colorScheme.onSurfaceVariant,
          ),
        ),
      ],
    );
  }

  Widget _buildCTAButton(
    BuildContext context,
    CourseDetailsLoaded state,
    ColorScheme colorScheme,
  ) {
    final isLoading = state is CourseDetailsEnrolling;

    // Debug logging
    AppLogger.info('UI: isEnrolled=${state.isEnrolled}, hasStartedLearning=${state.hasStartedLearning}, ctaText=${state.ctaButtonText}');
    AppLogger.info('UI: enrollment=${state.enrollment?.id}, enrollmentCourseId=${state.enrollment?.courseId}, courseId=${state.course.id}');

    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        onPressed: isLoading
            ? null
            : () {
                if (state.isEnrolled) {
                  context
                      .read<CourseDetailsBloc>()
                      .add(const ResumeLearningClicked());
                } else {
                  context
                      .read<CourseDetailsBloc>()
                      .add(const EnrollInCourse());
                }
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: state.isEnrolled ? AppColors.primary : AppColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : Text(
                state.ctaButtonText,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
      ),
    );
  }

  Widget _buildLessonsSection(
    BuildContext context,
    CourseDetailsLoaded state,
    ColorScheme colorScheme,
  ) {
    // Debug logging
    AppLogger.info('UI LessonsSection: expandedLessonId=${state.expandedLessonId}');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Lessons (${state.totalLessons})',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
            if (state.overallProgress > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${state.overallProgress.toStringAsFixed(0)}%',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: AppColors.primary,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 16),
        if (state.lessons.isEmpty)
          Text(
            'No lessons available yet.',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          )
        else
          ...state.lessons.asMap().entries.map((entry) {
            final index = entry.key;
            final lesson = entry.value;
            return _buildLessonCard(
              context,
              lesson,
              index + 1,
              state.isLessonExpanded(lesson.id),
              state.isEnrolled,
              colorScheme,
              widget.courseId,
            );
          }),
      ],
    );
  }

  Widget _buildLessonCard(
    BuildContext context,
    LessonModel lesson,
    int lessonNumber,
    bool isExpanded,
    bool isEnrolled,
    ColorScheme colorScheme,
    String courseId,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isExpanded
              ? AppColors.primary.withOpacity(0.3)
              : Colors.transparent,
        ),
      ),
      child: Column(
        children: [
          // Lesson Header (clickable)
          InkWell(
            onTap: () {
              context
                  .read<CourseDetailsBloc>()
                  .add(ToggleLessonExpansion(lesson.id));
            },
            borderRadius: BorderRadius.circular(16),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  // Lesson Number
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      color: lesson.progressPercentage == 100
                          ? Colors.green.withOpacity(0.1)
                          : AppColors.primary.withOpacity(0.1),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: lesson.progressPercentage == 100
                          ? const Icon(Icons.check, color: Colors.green, size: 20)
                          : Text(
                              '$lessonNumber',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.primary,
                              ),
                            ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  // Lesson Title & Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          lesson.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: colorScheme.onSurface,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${lesson.items.length} items${lesson.formattedDuration.isNotEmpty ? ' • ${lesson.formattedDuration}' : ''}',
                          style: TextStyle(
                            fontSize: 13,
                            color: colorScheme.onSurfaceVariant,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Progress & Expand Icon
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (isEnrolled && lesson.progressPercentage > 0)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            '${lesson.progressPercentage.toStringAsFixed(0)}%',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      Icon(
                        isExpanded ? Icons.expand_less : Icons.expand_more,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          // Lesson Items (shown when expanded)
          if (isExpanded)
            Container(
              decoration: BoxDecoration(
                color: colorScheme.surface.withOpacity(0.5),
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(16),
                ),
              ),
              child: Column(
                children: lesson.items.asMap().entries.map((entry) {
                  final item = entry.value;
                  return _buildLessonItem(
                    context,
                    lesson.id,
                    courseId,
                    item,
                    isEnrolled,
                    colorScheme,
                  );
                }).toList(),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildLessonItem(
    BuildContext context,
    String lessonId,
    String courseId,
    LessonItemModel item,
    bool isEnrolled,
    ColorScheme colorScheme,
  ) {
    return InkWell(
      onTap: () {
        if (isEnrolled) {
          // Navigate to lesson with specific item ID
          final path = '${AppRoutes.lessonPath(courseId, lessonId)}?itemId=${item.id}';
          context.push(path);
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            // Item Icon
            Icon(
              _getItemIcon(item.type),
              size: 20,
              color: item.isCompleted ? Colors.green : colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 12),
            // Item Name
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.name,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: item.isCompleted
                          ? colorScheme.onSurfaceVariant
                          : colorScheme.onSurface,
                    ),
                  ),
                  if (item.formattedDuration.isNotEmpty)
                    Text(
                      item.formattedDuration,
                      style: TextStyle(
                        fontSize: 12,
                        color: colorScheme.onSurfaceVariant,
                      ),
                    ),
                ],
              ),
            ),
            // Completion Status
            if (isEnrolled)
              Icon(
                item.isCompleted ? Icons.check_circle : Icons.radio_button_unchecked,
                size: 20,
                color: item.isCompleted ? Colors.green : colorScheme.outline,
              ),
          ],
        ),
      ),
    );
  }

  IconData _getItemIcon(LessonItemType type) {
    switch (type) {
      case LessonItemType.video:
        return Icons.play_circle_outline;
      case LessonItemType.article:
        return Icons.article_outlined;
      case LessonItemType.quiz:
        return Icons.quiz_outlined;
      case LessonItemType.assignment:
        return Icons.assignment_outlined;
    }
  }

  Widget _buildReviewsSection(
    BuildContext context,
    CourseDetailsLoaded state,
    ColorScheme colorScheme,
  ) {
    final reviews = state.reviews;
    final canAddReview = state.isEnrolled && !state.hasReviewed;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'Reviews',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: colorScheme.onSurface,
              ),
            ),
            if (state.reviewStatistics != null)
              Row(
                children: [
                  const Icon(Icons.star, size: 18, color: Colors.amber),
                  const SizedBox(width: 4),
                  Text(
                    '${state.reviewStatistics!.averageRating.toStringAsFixed(1)} (${state.reviewStatistics!.totalReviews})',
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: colorScheme.onSurface,
                    ),
                  ),
                ],
              ),
          ],
        ),
        const SizedBox(height: 16),

        // Show review form if user can add review
        if (canAddReview) ...[
          _buildAddReviewForm(context, state, colorScheme),
          const SizedBox(height: 16),
        ],

        // Show existing reviews
        if (reviews.isEmpty)
          Text(
            'No reviews yet.',
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
            ),
          )
        else
          ...reviews.map((review) => _buildReviewCard(review, colorScheme)),
      ],
    );
  }

  Widget _buildAddReviewForm(
    BuildContext context,
    CourseDetailsLoaded state,
    ColorScheme colorScheme,
  ) {
    return _AddReviewForm(
      onSubmit: (rating, comment) {
        context.read<CourseDetailsBloc>().add(
          SubmitReview(rating: rating, comment: comment),
        );
      },
      isLoading: state is CourseDetailsSubmittingReview,
    );
  }

  Widget _buildReviewCard(ReviewModel review, ColorScheme colorScheme) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                review.userName ?? 'Anonymous',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: colorScheme.onSurface,
                ),
              ),
              Text(
                review.formattedDate,
                style: TextStyle(
                  fontSize: 12,
                  color: colorScheme.onSurfaceVariant,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: List.generate(5, (index) {
              return Icon(
                index < review.rating ? Icons.star : Icons.star_border,
                size: 16,
                color: Colors.amber,
              );
            }),
          ),
          const SizedBox(height: 8),
          Text(
            review.comment,
            style: TextStyle(
              fontSize: 14,
              color: colorScheme.onSurfaceVariant,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _StatItem {
  final IconData icon;
  final String value;
  final String label;
  final Color? iconColor;

  _StatItem({
    required this.icon,
    required this.value,
    required this.label,
    this.iconColor,
  });
}

/// Star rating input widget
class _StarRatingInput extends StatefulWidget {
  final ValueChanged<int> onRatingChanged;

  const _StarRatingInput({required this.onRatingChanged});

  @override
  State<_StarRatingInput> createState() => _StarRatingInputState();
}

class _StarRatingInputState extends State<_StarRatingInput> {
  int _rating = 0;
  int _hoveredRating = 0;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final starIndex = index + 1;
        final isFilled = starIndex <= (_hoveredRating > 0 ? _hoveredRating : _rating);

        return GestureDetector(
          onTap: () {
            setState(() {
              _rating = starIndex;
            });
            widget.onRatingChanged(_rating);
          },
          onTapDown: (_) {
            setState(() {
              _hoveredRating = starIndex;
            });
          },
          onTapUp: (_) {
            setState(() {
              _hoveredRating = 0;
            });
          },
          onTapCancel: () {
            setState(() {
              _hoveredRating = 0;
            });
          },
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4),
            child: Icon(
              isFilled ? Icons.star : Icons.star_border,
              color: isFilled ? Colors.amber : Colors.grey,
              size: 32,
            ),
          ),
        );
      }),
    );
  }
}

/// Add Review Form Widget
class _AddReviewForm extends StatefulWidget {
  final void Function(int rating, String comment) onSubmit;
  final bool isLoading;

  const _AddReviewForm({
    required this.onSubmit,
    required this.isLoading,
  });

  @override
  State<_AddReviewForm> createState() => _AddReviewFormState();
}

class _AddReviewFormState extends State<_AddReviewForm> {
  int _rating = 0;
  final TextEditingController _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withAlpha(50),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Add Your Review',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 12),
          _StarRatingInput(
            onRatingChanged: (rating) {
              setState(() {
                _rating = rating;
              });
            },
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _commentController,
            maxLines: 3,
            decoration: InputDecoration(
              hintText: 'Write your review...',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
              ),
              contentPadding: const EdgeInsets.all(12),
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: widget.isLoading || _rating == 0
                  ? null
                  : () {
                      widget.onSubmit(_rating, _commentController.text);
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: widget.isLoading
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text('Submit Review'),
            ),
          ),
        ],
      ),
    );
  }
}
