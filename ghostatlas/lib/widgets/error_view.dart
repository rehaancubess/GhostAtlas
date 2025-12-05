import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

/// Horror-themed error message widget with red color and dark background
class ErrorView extends StatelessWidget {
  final String message;
  final VoidCallback? onRetry;
  final IconData icon;

  const ErrorView({
    super.key,
    required this.message,
    this.onRetry,
    this.icon = Icons.error_outline,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Error icon with red glow
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: GhostAtlasColors.error.withValues(alpha: 0.1),
                shape: BoxShape.circle,
                border: Border.all(color: GhostAtlasColors.error, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: GhostAtlasColors.error.withValues(alpha: 0.3),
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Icon(icon, size: 48, color: GhostAtlasColors.error),
            ),
            const SizedBox(height: 24),

            // Error message
            Text(
              message,
              style: GhostAtlasTypography.textTheme.bodyLarge?.copyWith(
                color: GhostAtlasColors.textSecondary,
              ),
              textAlign: TextAlign.center,
            ),

            // Retry button if callback provided
            if (onRetry != null) ...[
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: onRetry,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  foregroundColor: GhostAtlasColors.ghostGreen,
                  side: const BorderSide(
                    color: GhostAtlasColors.ghostGreen,
                    width: 2,
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 32,
                    vertical: 14,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(25),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.refresh, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'TRY AGAIN',
                      style: GhostAtlasTypography.textTheme.labelLarge,
                    ),
                  ],
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Compact error message for inline display
class ErrorMessage extends StatelessWidget {
  final String message;
  final bool showIcon;

  const ErrorMessage({super.key, required this.message, this.showIcon = true});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: GhostAtlasColors.error.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: GhostAtlasColors.error.withValues(alpha: 0.5),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          if (showIcon) ...[
            Icon(Icons.error_outline, color: GhostAtlasColors.error, size: 20),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Text(
              message,
              style: GhostAtlasTypography.textTheme.bodyMedium?.copyWith(
                color: GhostAtlasColors.error,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Show error as a snackbar with horror theme
class ErrorSnackBar {
  static void show(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.error_outline,
              color: GhostAtlasColors.error,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: GhostAtlasTypography.textTheme.bodyMedium?.copyWith(
                  color: GhostAtlasColors.textPrimary,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: GhostAtlasColors.cardBackground,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: BorderSide(
            color: GhostAtlasColors.error.withValues(alpha: 0.5),
            width: 1,
          ),
        ),
        duration: const Duration(seconds: 4),
      ),
    );
  }
}
