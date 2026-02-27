import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../home/presentation/bloc/home_bloc.dart';
import '../../../home/presentation/screens/home_screen.dart';
import '../../../profile/presentation/screens/profile_screen.dart';

/// Notification to request tab switching
class SwitchTabNotification extends Notification {
  final int tabIndex;
  const SwitchTabNotification(this.tabIndex);
}

/// TAIF Main Shell with Bottom Navigation
/// Contains the bottom navigation bar with 5 tabs:
/// Home, Courses, Progress, Alerts, Profile
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  int _currentIndex = 0;

  final List<Widget> _screens = [
    BlocProvider(
      create: (context) => HomeBloc(),
      child: const HomeScreen(),
    ),
    const _PlaceholderScreen('Courses'),
    const _PlaceholderScreen('Progress'),
    const _PlaceholderScreen('Alerts'),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    
    return NotificationListener<SwitchTabNotification>(
      onNotification: (notification) {
        setState(() {
          _currentIndex = notification.tabIndex;
        });
        return true;
      },
      child: Scaffold(
        body: IndexedStack(
          index: _currentIndex,
          children: _screens,
        ),
        bottomNavigationBar: Container(
          decoration: BoxDecoration(
            color: colorScheme.surface,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withAlpha(10),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildNavItem(Icons.home_outlined, Icons.home, 'Home', 0, colorScheme),
                  _buildNavItem(Icons.menu_book_outlined, Icons.menu_book, 'Courses', 1, colorScheme),
                  _buildNavItem(Icons.bar_chart_outlined, Icons.bar_chart, 'Progress', 2, colorScheme),
                  _buildNavItem(Icons.notifications_outlined, Icons.notifications, 'Alerts', 3, colorScheme),
                  _buildNavItem(Icons.person_outline, Icons.person, 'Profile', 4, colorScheme),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(IconData icon, IconData activeIcon, String label, int index, ColorScheme colorScheme) {
    final isSelected = _currentIndex == index;
    final color = isSelected ? AppColors.primary : colorScheme.onSurface.withAlpha(153);

    return InkWell(
      onTap: () => setState(() => _currentIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isSelected ? activeIcon : icon,
              color: color,
              size: 24,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                inherit: false,
                color: color,
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Placeholder screen for tabs not yet implemented
class _PlaceholderScreen extends StatelessWidget {
  final String title;

  const _PlaceholderScreen(this.title);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(title),
      ),
      body: Center(
        child: Text(
          '$title coming soon',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}
