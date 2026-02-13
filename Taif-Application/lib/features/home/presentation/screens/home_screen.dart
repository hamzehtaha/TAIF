import 'package:flutter/material.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/utils/app_localizations.dart';
import '../../../../core/routing/app_router.dart';

/// TAIF Home Screen
/// Main entry point after authentication
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('app_name')),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: () => context.push(AppRoutes.settings),
          ),
          IconButton(
            icon: const Icon(Icons.person),
            onPressed: () => context.push(AppRoutes.profile),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Brand colors showcase
            _buildBrandColorsShowcase(),
            const SizedBox(height: 32),
            Text(
              l10n.translate('welcome_message'),
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.push(AppRoutes.example),
              child: Text(l10n.translate('continue')),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBrandColorsShowcase() => Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          _buildColorBox('Primary', AppColors.primary),
          const SizedBox(width: 16),
          _buildColorBox('Secondary', AppColors.secondary),
          const SizedBox(width: 16),
          _buildColorBox('Accent', AppColors.accent),
        ],
      );

  Widget _buildColorBox(String label, Color color) => Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            label,
            style: const TextStyle(fontSize: 12),
          ),
        ],
      );
}
