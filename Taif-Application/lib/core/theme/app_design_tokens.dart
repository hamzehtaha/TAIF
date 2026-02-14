import 'package:flutter/material.dart';

/// TAIF Spacing Design Tokens
/// All spacing values use 4px base grid (0.25rem)
@immutable
class AppSpacing {
  const AppSpacing._();

  // Base unit = 4px
  static const double xs = 4; // 4px
  static const double sm = 8; // 8px
  static const double md = 16; // 16px
  static const double lg = 24; // 24px
  static const double xl = 32; // 32px
  static const double xxl = 48; // 48px
  static const double xxxl = 64; // 64px

  // Screen padding
  static const double screenPaddingHorizontal = md;
  static const double screenPaddingVertical = md;

  // Component spacing
  static const double cardPadding = md;
  static const double buttonPaddingHorizontal = lg;
  static const double buttonPaddingVertical = sm;
  static const double inputPadding = md;
  static const double listItemSpacing = sm;
  static const double sectionSpacing = lg;
}

/// TAIF Border Radius Design Tokens
@immutable
class AppRadius {
  const AppRadius._();

  static const double none = 0;
  static const double xs = 4;
  static const double sm = 8;
  static const double md = 12;
  static const double lg = 16;
  static const double xl = 24;
  static const double full = 9999;

  // Component-specific radii
  static const double button = md;
  static const double card = lg;
  static const double input = sm;
  static const double chip = full;
  static const double avatar = full;
  static const double dialog = xl;
}

/// TAIF Elevation Design Tokens
@immutable
class AppElevation {
  const AppElevation._();

  static const List<BoxShadow> none = [];

  static const List<BoxShadow> xs = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  static const List<BoxShadow> sm = [
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];

  static const List<BoxShadow> md = [
    BoxShadow(
      color: Color(0x14000000),
      blurRadius: 6,
      offset: Offset(0, 4),
    ),
  ];

  static const List<BoxShadow> lg = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 15,
      offset: Offset(0, 8),
    ),
  ];

  static const List<BoxShadow> xl = [
    BoxShadow(
      color: Color(0x26000000),
      blurRadius: 25,
      offset: Offset(0, 16),
    ),
  ];
}
