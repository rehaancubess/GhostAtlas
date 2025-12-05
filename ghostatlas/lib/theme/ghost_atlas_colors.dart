import 'package:flutter/material.dart';

/// Color palette for the GhostAtlas horror-themed application.
/// Defines a dark, atmospheric color scheme with eerie green accents.
class GhostAtlasColors {
  // Prevent instantiation
  GhostAtlasColors._();

  // ============================================================================
  // BACKGROUNDS
  // ============================================================================

  /// Pure black background for maximum contrast and horror atmosphere
  static const Color primaryBackground = Color(0xFF000000);

  /// Near-black background for subtle elevation differences
  static const Color secondaryBackground = Color(0xFF0A0A0A);

  /// Elevated surface color for cards and containers
  static const Color cardBackground = Color(0xFF121212);

  // ============================================================================
  // ACCENTS
  // ============================================================================

  /// Primary accent color - eerie green for interactive elements
  static const Color ghostGreen = Color(0xFF00FF41);

  /// Dimmed version of ghost green for secondary interactions
  static const Color ghostGreenDim = Color(0xFF00CC33);

  /// Glow effect color with 25% opacity for atmospheric effects
  static const Color ghostGreenGlow = Color(0x4000FF41);

  // ============================================================================
  // TEXT COLORS
  // ============================================================================

  /// Primary text color - pure white for maximum readability
  static const Color textPrimary = Color(0xFFFFFFFF);

  /// Secondary text color - light gray for less prominent text
  static const Color textSecondary = Color(0xFFE0E0E0);

  /// Tertiary text color - medium gray for metadata and labels
  static const Color textTertiary = Color(0xFF999999);

  /// Muted text color - dark gray for inactive or disabled elements
  static const Color textMuted = Color(0xFF666666);

  // ============================================================================
  // SEMANTIC COLORS
  // ============================================================================

  /// Error color for validation messages and critical alerts
  static const Color error = Color(0xFFFF4444);

  /// Warning color for cautionary messages
  static const Color warning = Color(0xFFFFAA00);

  /// Success color - uses ghost green for consistency
  static const Color success = ghostGreen;
}
