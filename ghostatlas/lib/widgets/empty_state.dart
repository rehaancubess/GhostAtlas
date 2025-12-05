import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';
import 'ghost_button.dart';

/// Atmospheric empty state widget with horror theme styling
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Icon with green glow
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
                  width: 2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: GhostAtlasColors.ghostGreenGlow,
                    blurRadius: 20,
                    spreadRadius: 5,
                  ),
                ],
              ),
              child: Icon(icon, size: 64, color: GhostAtlasColors.ghostGreen),
            ),
            const SizedBox(height: 32),

            // Title in horror font
            Text(
              title,
              style: GhostAtlasTypography.textTheme.headlineMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),

            // Message
            Text(
              message,
              style: GhostAtlasTypography.textTheme.bodyLarge?.copyWith(
                color: GhostAtlasColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),

            // Action button
            if (actionLabel != null && onAction != null) ...[
              const SizedBox(height: 32),
              GhostButton(
                text: actionLabel!,
                icon: Icons.refresh,
                onPressed: onAction!,
              ),
            ],
          ],
        ),
      ),
    );
  }
}
