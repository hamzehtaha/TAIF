import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../home/data/models/course_model.dart';
import '../../data/models/category_model.dart';
import '../bloc/courses_bloc.dart';
import '../bloc/courses_event.dart';
import '../bloc/courses_state.dart';

/// Courses Screen
/// Displays all courses with search, category filter, and course cards
/// Matches the design from the reference image
class CoursesScreen extends StatefulWidget {
  const CoursesScreen({super.key});

  @override
  State<CoursesScreen> createState() => _CoursesScreenState();
}

class _CoursesScreenState extends State<CoursesScreen> {
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    context.read<CoursesBloc>().add(const LoadCourses());
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              
              // Page Title
              Text(
                'Courses',
                style: textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 20),
              
              // Search Bar
              _buildSearchBar(colorScheme),
              const SizedBox(height: 16),
              
              // Category Filter Chips
              _buildCategoryFilter(colorScheme),
              const SizedBox(height: 16),
              
              // Course List
              Expanded(
                child: BlocBuilder<CoursesBloc, CoursesState>(
                  builder: (context, state) {
                    return _buildContent(state, colorScheme, textTheme);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSearchBar(ColorScheme colorScheme) {
    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: colorScheme.outline.withAlpha(50),
        ),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) {
          context.read<CoursesBloc>().add(SearchCourses(value));
        },
        decoration: InputDecoration(
          hintText: 'Search courses...',
          hintStyle: TextStyle(
            color: colorScheme.onSurfaceVariant.withAlpha(150),
          ),
          prefixIcon: Icon(
            Icons.search,
            color: colorScheme.onSurfaceVariant,
          ),
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 16,
            vertical: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryFilter(ColorScheme colorScheme) {
    return BlocBuilder<CoursesBloc, CoursesState>(
      builder: (context, state) {
        if (state is! CoursesLoaded) {
          return const SizedBox.shrink();
        }

        final categories = [
          CategoryModel(id: 'all', name: 'All'),
          ...state.categories,
        ];
        final selectedId = state.selectedCategoryId;
        final isAllSelected = selectedId == null || selectedId.isEmpty;

        return SizedBox(
          height: 44,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: categories.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (context, index) {
              final category = categories[index];
              final isSelected = category.id == 'all' 
                  ? isAllSelected 
                  : category.id == selectedId;

              return _buildCategoryChip(
                category: category,
                isSelected: isSelected,
                colorScheme: colorScheme,
              );
            },
          ),
        );
      },
    );
  }

  Widget _buildCategoryChip({
    required CategoryModel category,
    required bool isSelected,
    required ColorScheme colorScheme,
  }) {
    return GestureDetector(
      onTap: () {
        // Dispatch null for "all", otherwise dispatch the category ID
        context.read<CoursesBloc>().add(
          FilterByCategory(category.id == 'all' ? null : category.id),
        );
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected 
              ? AppColors.primary 
              : colorScheme.outline.withAlpha(50),
          ),
        ),
        child: Text(
          category.name,
          style: TextStyle(
            color: isSelected ? Colors.white : colorScheme.onSurface,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
            fontSize: 14,
          ),
        ),
      ),
    );
  }

  Widget _buildContent(CoursesState state, ColorScheme colorScheme, TextTheme textTheme) {
    if (state is CoursesLoading) {
      return _buildLoadingState();
    }

    if (state is CoursesError) {
      return _buildErrorState(state.message, colorScheme, textTheme);
    }

    if (state is CoursesLoaded) {
      if (state.filteredCourses.isEmpty) {
        return _buildEmptyState(colorScheme, textTheme);
      }

      return RefreshIndicator(
        onRefresh: () async {
          context.read<CoursesBloc>().add(const RefreshCourses());
        },
        child: ListView.builder(
          padding: const EdgeInsets.only(bottom: 20),
          itemCount: state.filteredCourses.length,
          itemBuilder: (context, index) {
            final course = state.filteredCourses[index];
            return _buildCourseCard(course, colorScheme, textTheme);
          },
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildCourseCard(CourseModel course, ColorScheme colorScheme, TextTheme textTheme) {
    return GestureDetector(
      onTap: () {
        context.push(AppRoutes.courseDetailsPath(course.id));
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 16),
        decoration: BoxDecoration(
          color: colorScheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(20),
        ),
        clipBehavior: Clip.antiAlias,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Course Image with Badges - Fixed height matching Home page
            SizedBox(
              height: 180,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  // Image
                  if (course.imageUrl != null && course.imageUrl!.isNotEmpty)
                    Image.network(
                      course.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) => _buildImagePlaceholder(colorScheme),
                    )
                  else
                    _buildImagePlaceholder(colorScheme),

                  // Top badges: Category + Recommended (RTL-aware)
                  PositionedDirectional(
                    top: 12,
                    start: 12,
                    child: Row(
                      children: [
                        if (course.categoryName != null)
                          _buildBadge(
                            course.categoryName!,
                            AppColors.primary,
                          ),
                        if (course.isRecommended) ...[
                          const SizedBox(width: 8),
                          _buildBadgeWithIcon(
                            'Recommended',
                            const Color(0xFFFF6B35),
                            Icons.auto_awesome,
                          ),
                        ],
                      ],
                    ),
                  ),

                  // Bottom badges: Rating (left) + Duration (right)
                  Positioned(
                    bottom: 12,
                    left: 12,
                    right: 12,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Rating
                        if (course.rating != null && course.rating! > 0)
                          _buildInfoBadge(
                            '${course.rating!.toStringAsFixed(1)}',
                            Icons.star,
                          ),
                        // Duration
                        if (course.durationInMinutes != null && course.durationInMinutes! > 0)
                          _buildInfoBadge(
                            course.formattedDuration,
                            Icons.access_time,
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            // Title and Description - matching Home page style
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Course Title
                  Text(
                    course.title,
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: colorScheme.onSurface,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  // Course Description
                  if (course.description != null && course.description!.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(
                      course.description!,
                      style: TextStyle(
                        fontSize: 14,
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImagePlaceholder(ColorScheme colorScheme) {
    return Container(
      color: colorScheme.surfaceContainer,
      child: Icon(
        Icons.image_outlined,
        size: 48,
        color: colorScheme.onSurfaceVariant,
      ),
    );
  }

  Widget _buildBadge(String text, Color backgroundColor) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildBadgeWithIcon(String text, Color backgroundColor, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 12,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoBadge(String text, IconData icon) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.black.withAlpha(180),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            icon,
            size: 14,
            color: Colors.white,
          ),
          const SizedBox(width: 4),
          Text(
            text,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      itemCount: 4,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          height: 200,
          decoration: BoxDecoration(
            color: AppColors.gray200,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        );
      },
    );
  }

  Widget _buildErrorState(String message, ColorScheme colorScheme, TextTheme textTheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.error_outline,
            size: 48,
            color: AppColors.error,
          ),
          const SizedBox(height: 16),
          Text(
            'Failed to load courses',
            style: textTheme.titleMedium?.copyWith(
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            message,
            style: textTheme.bodySmall?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {
              context.read<CoursesBloc>().add(const LoadCourses());
            },
            child: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(ColorScheme colorScheme, TextTheme textTheme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.search_off,
            size: 64,
            color: colorScheme.onSurfaceVariant.withAlpha(100),
          ),
          const SizedBox(height: 16),
          Text(
            'No courses found',
            style: textTheme.titleMedium?.copyWith(
              color: colorScheme.onSurface,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Try adjusting your search or filters',
            style: textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          TextButton(
            onPressed: () {
              _searchController.clear();
              context.read<CoursesBloc>().add(const ClearFilters());
            },
            child: const Text('Clear Filters'),
          ),
        ],
      ),
    );
  }
}
