import 'package:flutter/material.dart';
import '../../../../core/utils/app_localizations.dart';
import '../../../../core/theme/app_colors.dart';

/// TAIF Profile Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = context.l10n;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.translate('profile')),
      ),
      body: ListView(
        children: [
          // Profile Header
          Container(
            padding: const EdgeInsets.all(24),
            color: AppColors.primary.withOpacity(0.1),
            child: Column(
              children: [
                const CircleAvatar(
                  radius: 50,
                  backgroundColor: AppColors.primary,
                  child: Icon(Icons.person, size: 50, color: Colors.white),
                ),
                const SizedBox(height: 16),
                Text(
                  'User Name',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                Text(
                  'user@example.com',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.gray600,
                      ),
                ),
              ],
            ),
          ),

          // Profile Options
          ListTile(
            leading: const Icon(Icons.edit),
            title: const Text('Edit Profile'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.lock),
            title: const Text('Change Password'),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.notifications),
            title: Text(l10n.translate('notifications')),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),
          ListTile(
            leading: const Icon(Icons.language),
            title: Text(l10n.translate('language')),
            trailing: const Icon(Icons.chevron_right),
            onTap: () {},
          ),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.logout, color: AppColors.error),
            title: Text(
              l10n.translate('logout'),
              style: const TextStyle(color: AppColors.error),
            ),
            onTap: () {
              // TODO: Implement logout
            },
          ),
        ],
      ),
    );
  }
}
