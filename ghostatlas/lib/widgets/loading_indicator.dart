import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

/// Horror-themed loading indicator with green glow effect
class LoadingIndicator extends StatelessWidget {
  final String? message;
  final double size;

  const LoadingIndicator({super.key, this.message, this.size = 48});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Loading spinner with glow
          Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: GhostAtlasColors.ghostGreenGlow,
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: CircularProgressIndicator(
              strokeWidth: 3,
              valueColor: const AlwaysStoppedAnimation<Color>(
                GhostAtlasColors.ghostGreen,
              ),
            ),
          ),

          // Optional message
          if (message != null) ...[
            const SizedBox(height: 24),
            Text(
              message!,
              style: GhostAtlasTypography.textTheme.bodyMedium?.copyWith(
                color: GhostAtlasColors.textTertiary,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }
}
