import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/routing/app_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/bloc/theme_bloc.dart';
import '../../../../core/localization/bloc/locale_bloc.dart';
import '../../../../core/utils/logger.dart';
import '../../../../core/utils/token_storage.dart';
import '../../../../core/utils/user_storage.dart';
import '../../../auth/presentation/bloc/auth_bloc.dart';
import '../../../auth/presentation/bloc/auth_event.dart';

/// TAIF Profile Screen
/// Displays user information, settings, and logout option
/// Matches the design from the reference image
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: Theme.of(context).scaffoldBackgroundColor,
        elevation: 0,
        title: Text(
          'Profile',
          style: TextStyle(
            color: Theme.of(context).colorScheme.onSurface,
            fontSize: 28,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: false,
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // User Info Card
              _buildUserCard(context),

              const SizedBox(height: 24),

              // Settings Section
              _buildSettingsCard(context),

              const SizedBox(height: 16),

              // Switch to Parent View
              _buildParentViewButton(),

              const SizedBox(height: 16),

              // Sign Out Button
              _buildSignOutButton(context),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildUserCard(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: AppColors.primary,
              borderRadius: BorderRadius.circular(32),
            ),
            child: const Icon(
              Icons.person,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                FutureBuilder<String?>(
                  future: _getUserName(),
                  builder: (context, snapshot) {
                    final name = snapshot.data ?? 'User';
                    return Text(
                      name,
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w600,
                        color: colorScheme.onSurface,
                      ),
                    );
                  },
                ),
                FutureBuilder<String?>(
                  future: _getUserEmail(),
                  builder: (context, snapshot) {
                    final email = snapshot.data ?? 'user@email.com';
                    return Text(
                      email,
                      style: TextStyle(
                        fontSize: 14,
                        color: colorScheme.onSurface.withAlpha(153),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 8),
                // Role Badge - shows actual role from API
                FutureBuilder<String?>(
                  future: _getUserRole(),
                  builder: (context, snapshot) {
                    final role = snapshot.data ?? 'Student';
                    return Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withAlpha(26),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        role,
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: AppColors.primary,
                        ),
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsCard(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;

    return Container(
      decoration: BoxDecoration(
        color: colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(5),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Account Settings - disabled (no navigation)
          _buildSettingsItem(
            icon: Icons.settings_outlined,
            title: 'Account Settings',
            onTap: () {
              // Disabled - not navigating to settings
            },
          ),
          _buildDivider(context),

          // Language - with dynamic value and dialog
          BlocBuilder<LocaleBloc, LocaleState>(
            builder: (context, localeState) {
              return _buildSettingsItem(
                icon: Icons.language_outlined,
                title: 'Language',
                trailing: Text(
                  localeState.isArabic ? 'العربية' : 'English',
                  style: TextStyle(
                    color: colorScheme.onSurface.withAlpha(153),
                    fontSize: 14,
                  ),
                ),
                onTap: () => _showLanguageDialog(context, localeState.locale),
              );
            },
          ),
          _buildDivider(context),

          // Appearance - with dynamic value and dialog
          BlocBuilder<ThemeBloc, ThemeState>(
            builder: (context, themeState) {
              final brightness = MediaQuery.platformBrightnessOf(context);
              final isDark = themeState.isDarkModeWithPlatform(brightness);

              String modeText;
              if (themeState.isSystemMode) {
                modeText = 'System';
              } else if (themeState.isDarkMode) {
                modeText = 'Dark';
              } else {
                modeText = 'Light';
              }

              return _buildSettingsItem(
                icon: isDark ? Icons.dark_mode_outlined : Icons.light_mode_outlined,
                title: 'Appearance',
                trailing: Text(
                  modeText,
                  style: TextStyle(
                    color: colorScheme.onSurface.withAlpha(153),
                    fontSize: 14,
                  ),
                ),
                onTap: () => _showAppearanceDialog(context, themeState),
              );
            },
          ),
          _buildDivider(context),

          _buildSettingsItem(
            icon: Icons.accessibility_new_outlined,
            title: 'Accessibility',
            onTap: () {},
          ),
          _buildDivider(context),
          _buildSettingsItem(
            icon: Icons.help_outline,
            title: 'Help & Support',
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem({
    required IconData icon,
    required String title,
    Widget? trailing,
    required VoidCallback onTap,
  }) {
    return Builder(
      builder: (context) {
        final colorScheme = Theme.of(context).colorScheme;
        return ListTile(
          leading: Icon(
            icon,
            color: colorScheme.onSurface.withAlpha(153),
            size: 22,
          ),
          title: Text(
            title,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w500,
              color: colorScheme.onSurface,
            ),
          ),
          trailing: trailing ??
              Icon(
                Icons.chevron_right,
                color: colorScheme.onSurface.withAlpha(153),
                size: 20,
              ),
          onTap: onTap,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20),
        );
      },
    );
  }

  Widget _buildDivider(BuildContext context) {
    return Divider(
      height: 1,
      indent: 56,
      color: Theme.of(context).dividerColor,
    );
  }

  void _showLanguageDialog(BuildContext context, Locale currentLocale) {
    showDialog<void>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Select Language'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              title: const Text('English'),
              trailing: currentLocale.languageCode == 'en'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context.read<LocaleBloc>().add(const LocaleChanged(Locale('en')));
                Navigator.pop(dialogContext);
              },
            ),
            ListTile(
              title: const Text('العربية'),
              trailing: currentLocale.languageCode == 'ar'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context.read<LocaleBloc>().add(const LocaleChanged(Locale('ar')));
                Navigator.pop(dialogContext);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showAppearanceDialog(BuildContext context, ThemeState currentState) {
    showDialog<void>(
      context: context,
      builder: (BuildContext dialogContext) => AlertDialog(
        title: const Text('Appearance'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.light_mode),
              title: const Text('Light'),
              trailing: currentState.isLightMode
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context.read<ThemeBloc>().add(const ThemeModeChanged(ThemeMode.light));
                Navigator.pop(dialogContext);
              },
            ),
            ListTile(
              leading: const Icon(Icons.dark_mode),
              title: const Text('Dark'),
              trailing: currentState.isDarkMode
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context.read<ThemeBloc>().add(const ThemeModeChanged(ThemeMode.dark));
                Navigator.pop(dialogContext);
              },
            ),
            ListTile(
              leading: const Icon(Icons.brightness_auto),
              title: const Text('System'),
              trailing: currentState.isSystemMode
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context.read<ThemeBloc>().add(const ThemeModeChanged(ThemeMode.system));
                Navigator.pop(dialogContext);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildParentViewButton() {
    return Builder(
      builder: (context) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        return SizedBox(
          width: double.infinity,
          child: MaterialButton(
            onPressed: () {},
            elevation: 0,
            highlightElevation: 0,
            color: isDark 
                ? AppColors.primary.withAlpha(40)
                : AppColors.primary.withAlpha(26),
            textColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Text(
              'Switch to Parent View',
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildSignOutButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: OutlinedButton.icon(
        onPressed: () => _handleLogout(context),
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.error,
          side: const BorderSide(color: AppColors.error),
          padding: const EdgeInsets.symmetric(vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          animationDuration: Duration.zero,
        ),
        icon: const Icon(Icons.logout, size: 18, color: AppColors.error),
        label: const Text(
          'Sign Out',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.error,
          ),
        ),
      ),
    );
  }

  Future<void> _handleLogout(BuildContext context) async {
    try {
      // Show confirmation dialog
      final confirmed = await showDialog<bool>(
        context: context,
        builder: (context) => AlertDialog(
          title: const Text('Sign Out'),
          content: const Text('Are you sure you want to sign out?'),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              style: TextButton.styleFrom(foregroundColor: AppColors.error),
              child: const Text('Sign Out'),
            ),
          ],
        ),
      );

      if (confirmed == true) {
        AppLogger.info('User logging out...');

        // Clear tokens and user info
        await TokenStorage().clearTokens();
        await UserStorage().clearUserInfo();

        // Dispatch logout event to auth bloc
        context.read<AuthBloc>().add(LogoutRequested());

        // Navigate to login
        context.go(AppRoutes.login);
      }
    } catch (e) {
      AppLogger.error('Logout failed: $e');
    }
  }

  Future<String?> _getUserName() async {
    return await UserStorage().getUserFullName();
  }

  Future<String?> _getUserEmail() async {
    return await UserStorage().getUserEmail();
  }

  Future<String?> _getUserRole() async {
    return await UserStorage().getUserRoleName();
  }
}
