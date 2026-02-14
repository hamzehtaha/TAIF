import 'package:flutter/material.dart';

/// TAIF Design Tokens - Centralized Color System
/// 
/// These 3 brand colors are the single source of truth for the entire application.
/// No hardcoded colors should exist anywhere else in the app.
/// 
/// Design Token Principles:
/// 1. All colors reference these base tokens
/// 2. Semantic naming (what it represents, not what it looks like)
/// 3. Support for both light and dark themes
/// 4. Consistent contrast ratios for accessibility
@immutable
class AppColors {
  const AppColors._();

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIMARY BRAND COLORS - Single Source of Truth
  // ═══════════════════════════════════════════════════════════════════════════
  
  /// Primary Brand Color
  /// Usage: Main CTAs, primary buttons, active states, key actions
  /// Contrast: Use on light backgrounds, white text
  static const Color primary = Color(0xFF0066CC);

  /// Secondary Brand Color
  /// Usage: Secondary actions, highlights, alternative CTAs
  /// Contrast: Use on light backgrounds, dark text
  static const Color secondary = Color(0xFF00A86B);

  /// Accent/Tertiary Color
  /// Usage: Warnings, special highlights, attention elements
  /// Contrast: Use for alerts, badges, time-sensitive info
  static const Color accent = Color(0xFFFF6B35);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEUTRAL SCALE
  // ═══════════════════════════════════════════════════════════════════════════
  
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  
  // Gray scale
  static const Color gray50 = Color(0xFFF9FAFB);
  static const Color gray100 = Color(0xFFF3F4F6);
  static const Color gray200 = Color(0xFFE5E7EB);
  static const Color gray300 = Color(0xFFD1D5DB);
  static const Color gray400 = Color(0xFF9CA3AF);
  static const Color gray500 = Color(0xFF6B7280);
  static const Color gray600 = Color(0xFF4B5563);
  static const Color gray700 = Color(0xFF374151);
  static const Color gray800 = Color(0xFF1F2937);
  static const Color gray900 = Color(0xFF111827);

  // ═══════════════════════════════════════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Success (derived from secondary)
  static const Color success = secondary;
  static const Color successLight = Color(0xFFD1FAE5);
  static const Color successDark = Color(0xFF065F46);
  
  // Error (derived from accent)
  static const Color error = Color(0xFFDC2626);
  static const Color errorLight = Color(0xFFFEE2E2);
  static const Color errorDark = Color(0xFF991B1B);
  
  // Warning
  static const Color warning = accent;
  static const Color warningLight = Color(0xFFFFEDD5);
  static const Color warningDark = Color(0xFF9A3412);
  
  // Info
  static const Color info = primary;
  static const Color infoLight = Color(0xFFDBEAFE);
  static const Color infoDark = Color(0xFF1E40AF);

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITY COLORS
  // ═══════════════════════════════════════════════════════════════════════════
  
  static const Color transparent = Colors.transparent;
  static const Color overlay = Color(0x80000000);
  static const Color shimmerBase = Color(0xFFE5E7EB);
  static const Color shimmerHighlight = Color(0xFFF3F4F6);
}
