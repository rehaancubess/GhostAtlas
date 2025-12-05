import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'ghost_atlas_colors.dart';

/// Typography system for the GhostAtlas application.
/// Combines horror-themed fonts for titles with readable fonts for body text.
class GhostAtlasTypography {
  // Prevent instantiation
  GhostAtlasTypography._();

  /// Horror font family for titles and headings
  /// Using Creepster for its spooky, dripping horror aesthetic
  static const String horrorFontFamily = 'Creepster';

  /// Clean font family for body text and UI elements
  /// Using Roboto for excellent readability
  static const String bodyFontFamily = 'Roboto';

  /// Complete text theme for the application
  static TextTheme get textTheme {
    return TextTheme(
      // Display styles - largest text, used for app title and major headings
      displayLarge: GoogleFonts.creepster(
        fontSize: 48,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.ghostGreen,
        shadows: [
          Shadow(
            color: GhostAtlasColors.ghostGreenGlow,
            blurRadius: 20,
            offset: Offset(0, 0),
          ),
        ],
      ),
      displayMedium: GoogleFonts.creepster(
        fontSize: 40,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.ghostGreen,
        shadows: [
          Shadow(
            color: GhostAtlasColors.ghostGreenGlow,
            blurRadius: 15,
            offset: Offset(0, 0),
          ),
        ],
      ),
      displaySmall: GoogleFonts.creepster(
        fontSize: 32,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.ghostGreen,
      ),

      // Headline styles - section headers and important titles
      headlineLarge: GoogleFonts.creepster(
        fontSize: 32,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.ghostGreen,
      ),
      headlineMedium: GoogleFonts.creepster(
        fontSize: 24,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.textPrimary,
      ),
      headlineSmall: GoogleFonts.creepster(
        fontSize: 20,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.textPrimary,
      ),

      // Title styles - card titles and dialog headers
      titleLarge: GoogleFonts.roboto(
        fontSize: 20,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.textPrimary,
        letterSpacing: 0.15,
      ),
      titleMedium: GoogleFonts.roboto(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.textPrimary,
        letterSpacing: 0.15,
      ),
      titleSmall: GoogleFonts.roboto(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.textPrimary,
        letterSpacing: 0.1,
      ),

      // Body styles - main content text
      bodyLarge: GoogleFonts.roboto(
        fontSize: 16,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.textSecondary,
        letterSpacing: 0.5,
        height: 1.5,
      ),
      bodyMedium: GoogleFonts.roboto(
        fontSize: 14,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.textSecondary,
        letterSpacing: 0.25,
        height: 1.5,
      ),
      bodySmall: GoogleFonts.roboto(
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: GhostAtlasColors.textTertiary,
        letterSpacing: 0.4,
        height: 1.5,
      ),

      // Label styles - buttons, tabs, and form labels
      labelLarge: GoogleFonts.roboto(
        fontSize: 14,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.ghostGreen,
        letterSpacing: 1.2,
      ),
      labelMedium: GoogleFonts.roboto(
        fontSize: 12,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.ghostGreen,
        letterSpacing: 1.0,
      ),
      labelSmall: GoogleFonts.roboto(
        fontSize: 10,
        fontWeight: FontWeight.w600,
        color: GhostAtlasColors.textTertiary,
        letterSpacing: 0.5,
      ),
    );
  }

  /// Horror-themed text style for story titles
  static TextStyle get storyTitle => GoogleFonts.creepster(
    fontSize: 20,
    fontWeight: FontWeight.w400,
    color: GhostAtlasColors.ghostGreen,
  );

  /// Horror-themed text style for app branding
  static TextStyle get appTitle => GoogleFonts.creepster(
    fontSize: 28,
    fontWeight: FontWeight.w400,
    color: GhostAtlasColors.ghostGreen,
    shadows: [
      Shadow(
        color: GhostAtlasColors.ghostGreenGlow,
        blurRadius: 15,
        offset: Offset(0, 0),
      ),
    ],
  );
}
