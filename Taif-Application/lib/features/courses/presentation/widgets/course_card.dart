import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../home/data/models/course_model.dart';

/// Course Card Widget
/// Displays course information with image, badges, rating, duration, title, and description
/// Matches the design from the reference image
class CourseCard extends StatelessWidget {
  final CourseModel course;
  final VoidCallback? onTap;

  const CourseCard({
    super.key,
    required this.course,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return GestureDetector(
      onTap: onTap,
      child: Card(
        elevation: 0,
        margin: const EdgeInsets.only(bottom: 16),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: colorScheme.outline.withAlpha(30),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Course Image with Badges
            _buildImageSection(colorScheme),
            
            // Content Section
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Course Title
                  Text(
                    course.title,
                    style: textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                      color: colorScheme.onSurface,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 8),
                  
                  // Course Description
                  if (course.description != null && course.description!.isNotEmpty)
                    Text(
                      course.description!,
                      style: textTheme.bodyMedium?.copyWith(
                        color: colorScheme.onSurfaceVariant,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageSection(ColorScheme colorScheme) {
    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
      child: AspectRatio(
        aspectRatio: 16 / 10,
        child: Stack(
          fit: StackFit.expand,
          children: [
            // Course Image
            _buildCourseImage(),
            
            // Top Badges Row
            Positioned(
              top: 12,
              left: 12,
              right: 12,
              child: Row(
                children: [
                  // Category Badge
                  if (course.categoryName != null)
                    _buildBadge(
                      course.categoryName!,
                      AppColors.primary,
                      colorScheme,
                    ),
                  const SizedBox(width: 8),
                  
                  // Recommended Badge (if applicable)
                  if (course.rating != null && course.rating! >= 4.5)
                    _buildBadge(
                      'Recommended',
                      const Color(0xFFFF6B35),
                      colorScheme,
                      icon: Icons.star,
                    ),
                ],
              ),
            ),
            
            // Bottom Info Row
            Positioned(
              bottom: 12,
              left: 12,
              right: 12,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Rating Badge
                  if (course.rating != null && course.rating! > 0)
                    _buildInfoBadge(
                      '${course.rating!.toStringAsFixed(1)} (${course.reviewCount ?? 0})',
                      Icons.star,
                      colorScheme,
                    ),
                  
                  // Duration Badge
                  if (course.durationInMinutes != null && course.durationInMinutes! > 0)
                    _buildInfoBadge(
                      course.formattedDuration,
                      Icons.access_time,
                      colorScheme,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCourseImage() {
    if (course.imageUrl != null && course.imageUrl!.isNotEmpty) {
      return CachedNetworkImage(
        imageUrl: course.imageUrl!,
        fit: BoxFit.cover,
        placeholder: (context, url) => Container(
          color: AppColors.gray200,
          child: const Center(
            child: CircularProgressIndicator(),
          ),
        ),
        errorWidget: (context, url, error) => _buildPlaceholder(),
      );
    }
    return _buildPlaceholder();
  }

  Widget _buildPlaceholder() {
    return Container(
      color: AppColors.gray200,
      child: const Center(
        child: Icon(
          Icons.book_outlined,
          size: 48,
          color: AppColors.gray400,
        ),
      ),
    );
  }

  Widget _buildBadge(
    String text,
    Color backgroundColor,
    ColorScheme colorScheme, {
    IconData? icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              size: 14,
              color: Colors.white,
            ),
            const SizedBox(width: 4),
          ],
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

  Widget _buildInfoBadge(String text, IconData icon, ColorScheme colorScheme) {
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
}
