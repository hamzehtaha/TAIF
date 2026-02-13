import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/utils/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/bloc/theme_bloc.dart';
import '../../../../core/localization/bloc/locale_bloc.dart';

/// TAIF Settings Screen
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notifications = true;

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('settings')),
      ),
      body: ListView(
        children: [
          // Appearance Section
          _buildSectionHeader('Appearance'),
          BlocBuilder<ThemeBloc, ThemeState>(
            builder: (context, state) {
              // Get platform brightness to check if system is in dark mode
              final platformBrightness =
                  MediaQuery.platformBrightnessOf(context);
              final isActuallyDark =
                  state.isDarkModeWithPlatform(platformBrightness);

              return SwitchListTile(
                title: Text(l10n.translate('dark_mode')),
                subtitle: const Text('Use dark theme'),
                value: isActuallyDark,
                onChanged: (value) {
                  context.read<ThemeBloc>().add(const ToggleTheme());
                },
              );
            },
          ),

          const Divider(),

          // Language Section
          _buildSectionHeader('Language & Region'),
          BlocBuilder<LocaleBloc, LocaleState>(
            builder: (context, state) {
              return ListTile(
                leading: const Icon(Icons.language),
                title: Text(l10n.translate('language')),
                subtitle: Text(state.isArabic ? 'العربية' : 'English'),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => _showLanguageDialog(context, state.locale),
              );
            },
          ),

          const Divider(),

          // Notifications Section
          _buildSectionHeader('Notifications'),
          SwitchListTile(
            title: Text(l10n.translate('notifications')),
            subtitle: const Text('Enable push notifications'),
            value: _notifications,
            onChanged: (value) => setState(() => _notifications = value),
          ),

          const Divider(),

          // About Section
          _buildSectionHeader('About'),
          const ListTile(
            leading: Icon(Icons.info),
            title: Text('App Version'),
            subtitle: Text('1.0.0'),
          ),
          ListTile(
            leading: const Icon(Icons.privacy_tip),
            title: const Text('Privacy Policy'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.description),
            title: const Text('Terms of Service'),
            trailing: const Icon(Icons.open_in_new),
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.primary,
          ),
        ),
      );

  void _showLanguageDialog(BuildContext context, Locale currentLocale) {
    showDialog(
      context: context,
      builder: (BuildContext context) => AlertDialog(
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
                context
                    .read<LocaleBloc>()
                    .add(const LocaleChanged(Locale('en')));
                Navigator.pop(context);
              },
            ),
            ListTile(
              title: const Text('العربية'),
              trailing: currentLocale.languageCode == 'ar'
                  ? const Icon(Icons.check, color: AppColors.primary)
                  : null,
              onTap: () {
                context
                    .read<LocaleBloc>()
                    .add(const LocaleChanged(Locale('ar')));
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}
