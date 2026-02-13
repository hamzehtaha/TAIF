part of 'theme_bloc.dart';

class ThemeState extends Equatable {
  final ThemeMode themeMode;

  const ThemeState(this.themeMode);

  bool get isDarkMode => themeMode == ThemeMode.dark;
  bool get isLightMode => themeMode == ThemeMode.light;
  bool get isSystemMode => themeMode == ThemeMode.system;

  /// Check if currently in dark mode considering system preference
  bool isDarkModeWithPlatform(Brightness platformBrightness) {
    if (themeMode == ThemeMode.dark) return true;
    if (themeMode == ThemeMode.light) return false;
    // System mode - check platform brightness
    return platformBrightness == Brightness.dark;
  }

  @override
  List<Object> get props => [themeMode];
}
