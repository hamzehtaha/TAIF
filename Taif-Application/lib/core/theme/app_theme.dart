import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_design_tokens.dart';
import 'app_typography.dart';

/// TAIF App Theme - Light Theme
/// All theme properties reference centralized design tokens
class AppTheme {
  const AppTheme._();

  /// Light Theme - Uses the 3 brand colors as foundation
  static ThemeData get light => ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,

        // Color Scheme - Uses the 3 centralized brand colors
        colorScheme: const ColorScheme.light(
          primary: AppColors.primary,
          primaryContainer: AppColors.infoLight,
          onPrimaryContainer: AppColors.infoDark,
          secondary: AppColors.secondary,
          onSecondary: AppColors.white,
          secondaryContainer: AppColors.successLight,
          onSecondaryContainer: AppColors.successDark,
          tertiary: AppColors.accent,
          onTertiary: AppColors.white,
          tertiaryContainer: AppColors.warningLight,
          onTertiaryContainer: AppColors.warningDark,
          error: AppColors.error,
          errorContainer: AppColors.errorLight,
          onErrorContainer: AppColors.errorDark,
          onSurface: AppColors.gray900,
          surfaceContainerHighest: AppColors.gray100,
          onSurfaceVariant: AppColors.gray600,
          outline: AppColors.gray300,
          shadow: AppColors.black,
          scrim: AppColors.overlay,
        ),

        // App Bar Theme
        appBarTheme: AppBarTheme(
          elevation: 0,
          scrolledUnderElevation: 1,
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.gray900,
          surfaceTintColor: AppColors.white,
          centerTitle: true,
          titleTextStyle: AppTypography.titleLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          systemOverlayStyle: SystemUiOverlayStyle.dark,
        ),

        // Card Theme
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.card),
          ),
          color: AppColors.white,
          margin: EdgeInsets.zero,
        ),

        // Button Themes
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            elevation: 0,
            backgroundColor: AppColors.primary,
            foregroundColor: AppColors.white,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.buttonPaddingHorizontal,
              vertical: AppSpacing.buttonPaddingVertical,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.button),
            ),
            textStyle: AppTypography.labelLarge.copyWith(
              fontFamily: AppTypography.englishFontFamily,
            ),
          ),
        ),

        outlinedButtonTheme: OutlinedButtonThemeData(
          style: OutlinedButton.styleFrom(
            foregroundColor: AppColors.primary,
            side: const BorderSide(color: AppColors.primary, width: 1.5),
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.buttonPaddingHorizontal,
              vertical: AppSpacing.buttonPaddingVertical,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppRadius.button),
            ),
            textStyle: AppTypography.labelLarge.copyWith(
              fontFamily: AppTypography.englishFontFamily,
            ),
          ),
        ),

        textButtonTheme: TextButtonThemeData(
          style: TextButton.styleFrom(
            foregroundColor: AppColors.primary,
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.sm,
            ),
            textStyle: AppTypography.labelLarge.copyWith(
              fontFamily: AppTypography.englishFontFamily,
            ),
          ),
        ),

        // Input Decoration Theme
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: AppColors.gray50,
          contentPadding: const EdgeInsets.all(AppSpacing.inputPadding),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: const BorderSide(color: AppColors.error),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: const BorderSide(color: AppColors.error, width: 2),
          ),
          hintStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray400,
            fontFamily: AppTypography.englishFontFamily,
          ),
          labelStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray600,
            fontFamily: AppTypography.englishFontFamily,
          ),
          errorStyle: AppTypography.labelSmall.copyWith(
            color: AppColors.error,
            fontFamily: AppTypography.englishFontFamily,
          ),
        ),

        // Typography
        textTheme: TextTheme(
          displayLarge: AppTypography.displayLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          displayMedium: AppTypography.displayMedium.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          displaySmall: AppTypography.displaySmall.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          headlineLarge: AppTypography.headlineLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          headlineMedium: AppTypography.headlineMedium.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          headlineSmall: AppTypography.headlineSmall.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          titleLarge: AppTypography.titleLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          titleMedium: AppTypography.titleMedium.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          titleSmall: AppTypography.titleSmall.copyWith(
            color: AppColors.gray600,
            fontFamily: AppTypography.englishFontFamily,
          ),
          bodyLarge: AppTypography.bodyLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          bodyMedium: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          bodySmall: AppTypography.bodySmall.copyWith(
            color: AppColors.gray600,
            fontFamily: AppTypography.englishFontFamily,
          ),
          labelLarge: AppTypography.labelLarge.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          labelMedium: AppTypography.labelMedium.copyWith(
            color: AppColors.gray600,
            fontFamily: AppTypography.englishFontFamily,
          ),
          labelSmall: AppTypography.labelSmall.copyWith(
            color: AppColors.gray500,
            fontFamily: AppTypography.englishFontFamily,
          ),
        ),

        // Divider Theme
        dividerTheme: const DividerThemeData(
          color: AppColors.gray200,
          thickness: 1,
          space: AppSpacing.md,
        ),

        // Chip Theme
        chipTheme: ChipThemeData(
          backgroundColor: AppColors.gray100,
          selectedColor: AppColors.primary,
          checkmarkColor: AppColors.white,
          labelStyle: AppTypography.labelMedium.copyWith(
            color: AppColors.gray700,
            fontFamily: AppTypography.englishFontFamily,
          ),
          secondaryLabelStyle: AppTypography.labelMedium.copyWith(
            color: AppColors.white,
            fontFamily: AppTypography.englishFontFamily,
          ),
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.xs,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.chip),
          ),
        ),

        // Bottom Sheet Theme
        bottomSheetTheme: const BottomSheetThemeData(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.vertical(
              top: Radius.circular(AppRadius.xl),
            ),
          ),
          clipBehavior: Clip.antiAlias,
        ),

        // Dialog Theme
        dialogTheme: DialogThemeData(
          backgroundColor: AppColors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.dialog),
          ),
          titleTextStyle: AppTypography.headlineSmall.copyWith(
            color: AppColors.gray900,
            fontFamily: AppTypography.englishFontFamily,
          ),
          contentTextStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray600,
            fontFamily: AppTypography.englishFontFamily,
          ),
        ),

        // SnackBar Theme
        snackBarTheme: SnackBarThemeData(
          backgroundColor: AppColors.gray900,
          contentTextStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.white,
            fontFamily: AppTypography.englishFontFamily,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.sm),
          ),
          behavior: SnackBarBehavior.floating,
        ),

        // Scaffold Background
        scaffoldBackgroundColor: AppColors.gray50,

        // List Tile Theme
        listTileTheme: ListTileThemeData(
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.screenPaddingHorizontal,
          ),
          tileColor: AppColors.white,
          selectedTileColor: AppColors.primary.withAlpha(25),
          iconColor: AppColors.gray600,
          textColor: AppColors.gray900,
        ),
      );

  /// Dark Theme - Inverts colors while preserving brand identity
  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,

        // Color Scheme - Uses the 3 brand colors with dark adaptations
        colorScheme: const ColorScheme.dark(
          primary: AppColors.primary,
          onPrimary: AppColors.white,
          primaryContainer: Color(0xFF1E3A5F),
          onPrimaryContainer: Color(0xFFB3D4F7),
          secondary: AppColors.secondary,
          onSecondary: AppColors.white,
          secondaryContainer: Color(0xFF1A4734),
          onSecondaryContainer: Color(0xFFA7D4BE),
          tertiary: AppColors.accent,
          onTertiary: AppColors.white,
          tertiaryContainer: Color(0xFF5C2E1F),
          onTertiaryContainer: Color(0xFFFFC4AD),
          error: AppColors.error,
          onError: AppColors.white,
          errorContainer: Color(0xFF5C1F1F),
          onErrorContainer: Color(0xFFFECACA),
          surfaceContainerHighest: Color(0xFF1E1E1E),
          onSurfaceVariant: AppColors.gray400,
          outline: AppColors.gray700,
          shadow: AppColors.black,
          scrim: AppColors.overlay,
        ),

        // App Bar Theme
        appBarTheme: AppBarTheme(
          elevation: 0,
          scrolledUnderElevation: 1,
          backgroundColor: const Color(0xFF121212),
          foregroundColor: AppColors.white,
          surfaceTintColor: const Color(0xFF121212),
          centerTitle: true,
          titleTextStyle: AppTypography.titleLarge.copyWith(
            color: AppColors.white,
            fontFamily: AppTypography.englishFontFamily,
          ),
          systemOverlayStyle: SystemUiOverlayStyle.light,
        ),

        // Card Theme
        cardTheme: CardThemeData(
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppRadius.card),
          ),
          color: const Color(0xFF1E1E1E),
          margin: EdgeInsets.zero,
        ),

        // Input Decoration Theme
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: const Color(0xFF1E1E1E),
          contentPadding: const EdgeInsets.all(AppSpacing.inputPadding),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: const BorderSide(color: AppColors.gray700),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(AppRadius.input),
            borderSide: const BorderSide(color: AppColors.primary, width: 2),
          ),
          hintStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray500,
            fontFamily: AppTypography.englishFontFamily,
          ),
          labelStyle: AppTypography.bodyMedium.copyWith(
            color: AppColors.gray400,
            fontFamily: AppTypography.englishFontFamily,
          ),
        ),

        // Scaffold Background
        scaffoldBackgroundColor: const Color(0xFF121212),
      );
}
