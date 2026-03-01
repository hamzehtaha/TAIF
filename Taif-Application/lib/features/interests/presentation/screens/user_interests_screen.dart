import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/bloc/theme_bloc.dart';
import '../../../../core/utils/app_localizations.dart';
import '../bloc/interest_bloc.dart';
import '../bloc/interest_event.dart';
import '../bloc/interest_state.dart';

/// Interest Icons Mapping
/// Maps interest names to emoji icons (matching Taif-Portal implementation)
const Map<String, String> interestIcons = {
  'Sign Language & Deaf Education': '👋',
  'Visual Impairment & Braille': '📖',
  'Assistive Technology': '💻',
  'Sensory Processing & Autism': '🧩',
  'Learning Disabilities': '📚',
  'Physical & Motor Disabilities': '🏃',
  'Speech & Communication': '💬',
  'Cognitive Development': '🧠',
  'Sign Language Deaf Education': '👋',
};

/// User Interests Screen
/// Allows users to select their interests after signup
/// Based on design: Grid of selectable cards with checkmark badges
class UserInterestsScreen extends StatefulWidget {
  const UserInterestsScreen({super.key});

  @override
  State<UserInterestsScreen> createState() => _UserInterestsScreenState();
}

class _UserInterestsScreenState extends State<UserInterestsScreen> {
  @override
  void initState() {
    super.initState();
    // Load interests when screen initializes
    context.read<InterestBloc>().add(const LoadInterests());
  }

  String _getLocalizedErrorMessage(BuildContext context, String errorMessage) {
    final l10n = context.l10n;

    if (errorMessage.contains('Session expired')) {
      return l10n.translate('session_expired');
    } else if (errorMessage.contains('internet') || errorMessage.contains('network')) {
      return l10n.translate('no_internet');
    } else if (errorMessage.contains('Server error')) {
      return l10n.translate('error_server');
    }

    return errorMessage;
  }

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;
    final isRtl = context.isRtl;

    return BlocListener<ThemeBloc, ThemeState>(
      listener: (context, state) {
        setState(() {});
      },
      child: Scaffold(
        backgroundColor: Theme.of(context).colorScheme.surface,
        body: BlocConsumer<InterestBloc, InterestState>(
          listener: (context, state) {
            // Navigate to home on success or skip
            if (state is InterestsSaved || state is InterestsSkipped) {
              context.go(AppRoutes.home);
            }
            // Show error snackbar
            else if (state is InterestError) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  behavior: SnackBarBehavior.floating,
                  margin: const EdgeInsets.all(24),
                  content: Text(
                    _getLocalizedErrorMessage(context, state.message),
                    style: const TextStyle(color: AppColors.white),
                  ),
                  backgroundColor: AppColors.error,
                  action: SnackBarAction(
                    label: l10n.translate('dismiss'),
                    textColor: AppColors.white,
                    onPressed: () {
                      context.read<InterestBloc>().add(const ClearInterestError());
                    },
                  ),
                ),
              );
            }
          },
          builder: (context, state) {
            return SafeArea(
              child: Column(
                children: [
                  Expanded(
                    child: _buildContent(context, state, isRtl),
                  ),
                  _buildBottomSection(context, state, l10n),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(BuildContext context, InterestState state, bool isRtl) {
    if (state is InterestLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppColors.primary,
        ),
      );
    }

    if (state is InterestsLoaded ||
        state is InterestsSaving ||
        (state is InterestError && state.allInterests.isNotEmpty)) {
      final interests = state is InterestsLoaded
          ? state.allInterests
          : state is InterestsSaving
              ? state.allInterests
              : (state as InterestError).allInterests;

      final selectedIds = state is InterestsLoaded
          ? state.selectedInterestIds
          : state is InterestsSaving
              ? state.selectedInterestIds
              : (state as InterestError).selectedInterestIds;

      return SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        child: Column(
          children: [
            // Header Icon
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.auto_awesome,
                size: 36,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 24),

            // Title
            Text(
              _translateOrFallback(context, 'interests_title', 'What are you interested in?'),
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.onSurface,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),

            // Subtitle
            Text(
              _translateOrFallback(context, 'interests_subtitle', 'Select topics you\'d like to learn about. This helps us recommend courses for you.'),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),

            // Interests Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.1,
              ),
              itemCount: interests.length,
              itemBuilder: (context, index) {
                final interest = interests[index];
                final isSelected = selectedIds.contains(interest.id);
                final icon = interestIcons[interest.name] ?? '📌';

                return _InterestCard(
                  interestName: interest.name,
                  icon: icon,
                  isSelected: isSelected,
                  onTap: () {
                    context
                        .read<InterestBloc>()
                        .add(ToggleInterestSelection(interest.id));
                  },
                );
              },
            ),
          ],
        ),
      );
    }

    // Error state with no interests loaded
    if (state is InterestError && state.allInterests.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: AppColors.gray400,
            ),
            const SizedBox(height: 16),
            Text(
              _translateOrFallback(context, 'failed_load_interests', 'Failed to load interests'),
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            Text(
              _getLocalizedErrorMessage(context, state.message),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: AppColors.gray500,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                context.read<InterestBloc>().add(const LoadInterests());
              },
              icon: const Icon(Icons.refresh),
              label: Text(_translateOrFallback(context, 'retry', 'Retry')),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: AppColors.white,
              ),
            ),
          ],
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildBottomSection(BuildContext context, InterestState state, AppLocalizations l10n) {
    final bool isLoading = state is InterestLoading || state is InterestsSaving;
    final bool hasInterests = state is InterestsLoaded || state is InterestsSaving;
    final int selectedCount = state is InterestsLoaded
        ? state.selectedCount
        : state is InterestsSaving
            ? state.selectedInterestIds.length
            : 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outlineVariant.withValues(alpha: 0.5),
          ),
        ),
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Selected count indicator
            if (selectedCount > 0)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(
                  '$selectedCount ${_translateOrFallback(context, 'selected', 'selected')}',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.gray500,
                      ),
                ),
              ),

            // Action buttons
            Row(
              children: [
                // Skip button
                TextButton(
                  onPressed: isLoading
                      ? null
                      : () {
                          context.read<InterestBloc>().add(const SkipInterests());
                        },
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.gray500,
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                  child: Text(
                    _translateOrFallback(context, 'skip_for_now', 'Skip for now'),
                  ),
                ),
                const SizedBox(width: 12),

                // Continue button
                Expanded(
                  child: ElevatedButton(
                    onPressed: isLoading
                        ? null
                        : () {
                            context.read<InterestBloc>().add(const SaveInterests());
                          },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: AppColors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.white),
                            ),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _translateOrFallback(context, 'continue', 'Continue'),
                                style: const TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(width: 8),
                              const Icon(
                                Icons.arrow_forward,
                                size: 18,
                              ),
                            ],
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _translateOrFallback(BuildContext context, String key, String fallback) {
    final translation = context.l10n.translate(key);
    return translation == key ? fallback : translation;
  }
}

/// Individual Interest Card Widget
class _InterestCard extends StatelessWidget {
  final String interestName;
  final String icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _InterestCard({
    required this.interestName,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.primary.withValues(alpha: 0.08)
              : Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.primary : Colors.transparent,
            width: 2,
          ),
        ),
        child: Stack(
          children: [
            // Content
            Center(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      icon,
                      style: const TextStyle(fontSize: 40),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      interestName,
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            fontWeight: FontWeight.w500,
                            color: isSelected
                                ? AppColors.primary
                                : Theme.of(context).colorScheme.onSurface,
                          ),
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),

            // Checkmark badge
            if (isSelected)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  width: 24,
                  height: 24,
                  decoration: const BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check,
                    size: 16,
                    color: AppColors.white,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
