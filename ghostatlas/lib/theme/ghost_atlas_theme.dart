import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'ghost_atlas_colors.dart';
import 'ghost_atlas_typography.dart';

/// Complete theme configuration for the GhostAtlas application.
/// Provides a dark, horror-themed visual design with eerie green accents.
class GhostAtlasTheme {
  // Prevent instantiation
  GhostAtlasTheme._();

  /// Main theme data for the application
  static ThemeData get theme {
    return ThemeData(
      // ========================================================================
      // BRIGHTNESS & COLOR SCHEME
      // ========================================================================
      brightness: Brightness.dark,
      scaffoldBackgroundColor: GhostAtlasColors.primaryBackground,

      colorScheme: ColorScheme.dark(
        primary: GhostAtlasColors.ghostGreen,
        secondary: GhostAtlasColors.ghostGreenDim,
        surface: GhostAtlasColors.cardBackground,
        background: GhostAtlasColors.primaryBackground,
        error: GhostAtlasColors.error,
        onPrimary: GhostAtlasColors.primaryBackground,
        onSecondary: GhostAtlasColors.primaryBackground,
        onSurface: GhostAtlasColors.textPrimary,
        onBackground: GhostAtlasColors.textPrimary,
        onError: GhostAtlasColors.textPrimary,
      ),

      // ========================================================================
      // TYPOGRAPHY
      // ========================================================================
      textTheme: GhostAtlasTypography.textTheme,

      // ========================================================================
      // APP BAR THEME
      // ========================================================================
      appBarTheme: AppBarTheme(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        foregroundColor: GhostAtlasColors.ghostGreen,
        elevation: 0,
        centerTitle: true,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: GhostAtlasTypography.appTitle,
        iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen),
      ),

      // ========================================================================
      // BUTTON THEMES
      // ========================================================================
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: GhostAtlasColors.ghostGreen,
          side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          elevation: 0,
          textStyle: GhostAtlasTypography.textTheme.labelLarge,
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          foregroundColor: GhostAtlasColors.ghostGreen,
          textStyle: GhostAtlasTypography.textTheme.labelLarge,
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: GhostAtlasColors.ghostGreen,
          side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 1),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),

      // ========================================================================
      // INPUT DECORATION THEME
      // ========================================================================
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: GhostAtlasColors.secondaryBackground,

        // Border styles
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GhostAtlasColors.textMuted, width: 1),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GhostAtlasColors.textMuted, width: 1),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GhostAtlasColors.error, width: 1),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: GhostAtlasColors.error, width: 2),
        ),

        // Text styles
        labelStyle: TextStyle(
          color: GhostAtlasColors.textTertiary,
          fontSize: 14,
        ),
        hintStyle: TextStyle(color: GhostAtlasColors.textMuted, fontSize: 14),
        helperStyle: TextStyle(
          color: GhostAtlasColors.textTertiary,
          fontSize: 12,
        ),
        errorStyle: TextStyle(color: GhostAtlasColors.error, fontSize: 12),

        // Content padding
        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      ),

      // ========================================================================
      // CARD THEME
      // ========================================================================
      cardTheme: CardTheme(
        color: GhostAtlasColors.cardBackground,
        elevation: 4,
        shadowColor: GhostAtlasColors.ghostGreenGlow,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
            width: 1,
          ),
        ),
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),

      // ========================================================================
      // BOTTOM NAVIGATION BAR THEME
      // ========================================================================
      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: GhostAtlasColors.secondaryBackground,
        selectedItemColor: GhostAtlasColors.ghostGreen,
        unselectedItemColor: GhostAtlasColors.textMuted,
        selectedLabelStyle: TextStyle(
          fontWeight: FontWeight.w600,
          letterSpacing: 1.2,
          fontSize: 12,
        ),
        unselectedLabelStyle: TextStyle(
          fontWeight: FontWeight.w400,
          letterSpacing: 1.0,
          fontSize: 12,
        ),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),

      // ========================================================================
      // DIALOG THEME
      // ========================================================================
      dialogTheme: DialogTheme(
        backgroundColor: GhostAtlasColors.cardBackground,
        elevation: 8,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(
            color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
            width: 1,
          ),
        ),
        titleTextStyle: GhostAtlasTypography.textTheme.headlineMedium,
        contentTextStyle: GhostAtlasTypography.textTheme.bodyMedium,
      ),

      // ========================================================================
      // SNACKBAR THEME
      // ========================================================================
      snackBarTheme: SnackBarThemeData(
        backgroundColor: GhostAtlasColors.cardBackground,
        contentTextStyle: GhostAtlasTypography.textTheme.bodyMedium,
        actionTextColor: GhostAtlasColors.ghostGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(
            color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
            width: 1,
          ),
        ),
      ),

      // ========================================================================
      // FLOATING ACTION BUTTON THEME
      // ========================================================================
      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: GhostAtlasColors.ghostGreen,
        foregroundColor: GhostAtlasColors.primaryBackground,
        elevation: 6,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),

      // ========================================================================
      // ICON THEME
      // ========================================================================
      iconTheme: IconThemeData(color: GhostAtlasColors.ghostGreen, size: 24),

      // ========================================================================
      // DIVIDER THEME
      // ========================================================================
      dividerTheme: DividerThemeData(
        color: GhostAtlasColors.textMuted.withOpacity(0.3),
        thickness: 1,
        space: 1,
      ),

      // ========================================================================
      // SLIDER THEME
      // ========================================================================
      sliderTheme: SliderThemeData(
        activeTrackColor: GhostAtlasColors.ghostGreen,
        inactiveTrackColor: GhostAtlasColors.textMuted,
        thumbColor: GhostAtlasColors.ghostGreen,
        overlayColor: GhostAtlasColors.ghostGreenGlow,
        valueIndicatorColor: GhostAtlasColors.ghostGreen,
        valueIndicatorTextStyle: TextStyle(
          color: GhostAtlasColors.primaryBackground,
          fontWeight: FontWeight.w600,
        ),
      ),

      // ========================================================================
      // SWITCH THEME
      // ========================================================================
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return GhostAtlasColors.ghostGreen;
          }
          return GhostAtlasColors.textMuted;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return GhostAtlasColors.ghostGreen.withOpacity(0.5);
          }
          return GhostAtlasColors.textMuted.withOpacity(0.3);
        }),
      ),

      // ========================================================================
      // CHECKBOX THEME
      // ========================================================================
      checkboxTheme: CheckboxThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return GhostAtlasColors.ghostGreen;
          }
          return Colors.transparent;
        }),
        checkColor: MaterialStateProperty.all(
          GhostAtlasColors.primaryBackground,
        ),
        side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
      ),

      // ========================================================================
      // RADIO THEME
      // ========================================================================
      radioTheme: RadioThemeData(
        fillColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return GhostAtlasColors.ghostGreen;
          }
          return GhostAtlasColors.textMuted;
        }),
      ),

      // ========================================================================
      // PROGRESS INDICATOR THEME
      // ========================================================================
      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: GhostAtlasColors.ghostGreen,
        circularTrackColor: GhostAtlasColors.textMuted.withOpacity(0.3),
      ),
    );
  }
}
