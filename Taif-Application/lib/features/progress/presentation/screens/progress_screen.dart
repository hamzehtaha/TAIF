import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/logger.dart';
import '../../../courses/presentation/screens/course_details_screen.dart' show routeObserver;
import '../../data/repositories/progress_repository.dart';
import '../bloc/progress_bloc.dart';
import '../bloc/progress_event.dart';
import '../bloc/progress_state.dart';

/// Progress Screen
/// Displays user's learning progress with summary cards and course progress list
/// Matches the design from the reference image
class ProgressScreen extends StatefulWidget {
  const ProgressScreen({super.key});

  @override
  State<ProgressScreen> createState() => _ProgressScreenState();
}

class _ProgressScreenState extends State<ProgressScreen>
    with RouteAware {
  late final ProgressBloc _bloc;
  DateTime? _lastRefreshed;

  @override
  void initState() {
    super.initState();
    _bloc = ProgressBloc()..add(const LoadProgressData());
  }

  @override
  void dispose() {
    _bloc.close();
    super.dispose();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final route = ModalRoute.of(context);
    if (route is PageRoute) {
      routeObserver.subscribe(this, route);
    }
    // Refresh if it's been more than 1 second since last refresh
    final now = DateTime.now();
    if (_lastRefreshed == null || now.difference(_lastRefreshed!).inSeconds > 1) {
      _lastRefreshed = now;
      _bloc.add(const RefreshProgressData());
    }
  }

  @override
  void didPopNext() {
    _bloc.add(const RefreshProgressData());
  }

  @override
  Widget build(BuildContext context) {
    return BlocProvider.value(
      value: _bloc,
      child: const _ProgressView(),
    );
  }
}

class _ProgressView extends StatefulWidget {
  const _ProgressView();

  @override
  State<_ProgressView> createState() => _ProgressViewState();
}

class _ProgressViewState extends State<_ProgressView>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => false;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final colorScheme = Theme.of(context).colorScheme;
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      backgroundColor: colorScheme.surface,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            context.read<ProgressBloc>().add(const RefreshProgressData());
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),

                // Header Section
                _buildHeader(textTheme, colorScheme),
                const SizedBox(height: 24),

                // Content based on state
                BlocBuilder<ProgressBloc, ProgressState>(
                  builder: (context, state) {
                    return _buildContent(context, state, textTheme, colorScheme);
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(TextTheme textTheme, ColorScheme colorScheme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Progress',
          style: textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: colorScheme.onSurface,
            fontSize: 32,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Track your learning journey',
          style: textTheme.bodyMedium?.copyWith(
            color: colorScheme.onSurface.withAlpha(153),
            fontSize: 14,
          ),
        ),
      ],
    );
  }

  Widget _buildContent(
    BuildContext context,
    ProgressState state,
    TextTheme textTheme,
    ColorScheme colorScheme,
  ) {
    if (state is ProgressLoading) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(),
        ),
      );
    }

    if (state is ProgressError) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(40),
          child: Column(
            children: [
              Icon(
                Icons.error_outline,
                size: 48,
                color: colorScheme.error,
              ),
              const SizedBox(height: 16),
              Text(
                'Failed to load progress',
                style: textTheme.titleMedium?.copyWith(
                  color: colorScheme.onSurface,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                state.message,
                style: textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurface.withAlpha(153),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  context.read<ProgressBloc>().add(const LoadProgressData());
                },
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (state is ProgressLoaded) {
      final summary = state.summary;

      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Summary Cards Section
          _buildSummaryCards(summary, textTheme, colorScheme),
          const SizedBox(height: 32),

          // Course Progress Section
          _buildCourseProgressSection(summary, textTheme, colorScheme),
        ],
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildSummaryCards(
    UserProgressSummary summary,
    TextTheme textTheme,
    ColorScheme colorScheme,
  ) {
    return GridView.count(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisCount: 2,
      childAspectRatio: 1.6,
      crossAxisSpacing: 12,
      mainAxisSpacing: 12,
      children: [
        _buildSummaryCard(
          icon: Icons.menu_book_outlined,
          iconColor: const Color(0xFF4A9B8C), // Teal
          iconBgColor: const Color(0xFFE8F5F2),
          label: 'Enrolled',
          value: summary.enrolledCount.toString(),
          textTheme: textTheme,
          colorScheme: colorScheme,
        ),
        _buildSummaryCard(
          icon: Icons.access_time_outlined,
          iconColor: const Color(0xFFE07A5F), // Coral
          iconBgColor: const Color(0xFFFDF0EC),
          label: 'Hours',
          value: summary.totalHoursFormatted,
          textTheme: textTheme,
          colorScheme: colorScheme,
        ),
        _buildSummaryCard(
          icon: Icons.trending_up_outlined,
          iconColor: const Color(0xFFE9C46A), // Yellow/Gold
          iconBgColor: const Color(0xFFFDF8E8),
          label: 'Avg Progress',
          value: summary.averageProgressFormatted,
          textTheme: textTheme,
          colorScheme: colorScheme,
        ),
        _buildSummaryCard(
          icon: Icons.workspace_premium_outlined,
          iconColor: const Color(0xFF2A9D8F), // Green
          iconBgColor: const Color(0xFFE8F6F4),
          label: 'Certificates',
          value: summary.certificatesCount.toString(),
          textTheme: textTheme,
          colorScheme: colorScheme,
        ),
      ],
    );
  }

  Widget _buildSummaryCard({
    required IconData icon,
    required Color iconColor,
    required Color iconBgColor,
    required String label,
    required String value,
    required TextTheme textTheme,
    required ColorScheme colorScheme,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withAlpha(50),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withAlpha(30),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: iconBgColor.withAlpha(50),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              icon,
              color: iconColor,
              size: 24,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                value,
                style: textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: colorScheme.onSurface,
                  fontSize: 24,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                label,
                style: textTheme.bodyMedium?.copyWith(
                  color: colorScheme.onSurfaceVariant,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCourseProgressSection(
    UserProgressSummary summary,
    TextTheme textTheme,
    ColorScheme colorScheme,
  ) {
    if (summary.courses.isEmpty) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Course Progress',
            style: textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: colorScheme.onSurface,
              fontSize: 22,
            ),
          ),
          const SizedBox(height: 24),
          Center(
            child: Column(
              children: [
                Icon(
                  Icons.school_outlined,
                  size: 64,
                  color: colorScheme.onSurface.withAlpha(100),
                ),
                const SizedBox(height: 16),
                Text(
                  'No courses yet',
                  style: textTheme.titleMedium?.copyWith(
                    color: colorScheme.onSurface.withAlpha(153),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Enroll in courses to start tracking your progress',
                  style: textTheme.bodyMedium?.copyWith(
                    color: colorScheme.onSurface.withAlpha(100),
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Course Progress',
          style: textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
            color: colorScheme.onSurface,
            fontSize: 22,
          ),
        ),
        const SizedBox(height: 16),
        ListView.separated(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: summary.courses.length,
          separatorBuilder: (context, index) => const SizedBox(height: 12),
          itemBuilder: (context, index) {
            final courseProgress = summary.courses[index];
            return _buildCourseProgressCard(
              courseProgress,
              textTheme,
              colorScheme,
            );
          },
        ),
      ],
    );
  }

  Widget _buildCourseProgressCard(
    CourseProgressData courseProgress,
    TextTheme textTheme,
    ColorScheme colorScheme,
  ) {
    final progress = courseProgress.progressPercentage;
    final progressColor = AppColors.primary;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: colorScheme.surfaceContainerHighest.withAlpha(50),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: colorScheme.outline.withAlpha(30),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            courseProgress.course.title,
            style: textTheme.titleMedium?.copyWith(
              fontWeight: FontWeight.w600,
              color: colorScheme.onSurface,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            courseProgress.completedItemsText,
            style: textTheme.bodyMedium?.copyWith(
              color: colorScheme.onSurfaceVariant,
              fontSize: 13,
            ),
          ),
          const SizedBox(height: 12),
          // Progress bar
          Row(
            children: [
              Expanded(
                child: Container(
                  height: 8,
                  decoration: BoxDecoration(
                    color: colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: progress / 100,
                    child: Container(
                      decoration: BoxDecoration(
                        color: progressColor,
                        borderRadius: BorderRadius.circular(4),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                '$progress%',
                style: textTheme.bodyMedium?.copyWith(
                  color: progressColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
