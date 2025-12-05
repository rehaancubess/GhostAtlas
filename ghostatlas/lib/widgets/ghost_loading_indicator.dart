import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

/// Horror-themed loading indicator with green animated spinner and glow effect
class GhostLoadingIndicator extends StatefulWidget {
  final String? message;
  final double size;
  final bool showGlow;

  const GhostLoadingIndicator({
    super.key,
    this.message,
    this.size = 48,
    this.showGlow = true,
  });

  @override
  State<GhostLoadingIndicator> createState() => _GhostLoadingIndicatorState();
}

class _GhostLoadingIndicatorState extends State<GhostLoadingIndicator>
    with SingleTickerProviderStateMixin {
  late AnimationController _glowController;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    )..repeat(reverse: true);

    _glowAnimation = Tween<double>(begin: 10.0, end: 25.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Loading spinner with animated glow
          AnimatedBuilder(
            animation: _glowAnimation,
            builder: (context, child) {
              return Container(
                width: widget.size,
                height: widget.size,
                decoration:
                    widget.showGlow
                        ? BoxDecoration(
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: GhostAtlasColors.ghostGreenGlow,
                              blurRadius: _glowAnimation.value,
                              spreadRadius: _glowAnimation.value / 3,
                            ),
                          ],
                        )
                        : null,
                child: CircularProgressIndicator(
                  strokeWidth: 3,
                  valueColor: const AlwaysStoppedAnimation<Color>(
                    GhostAtlasColors.ghostGreen,
                  ),
                ),
              );
            },
          ),

          // Optional message
          if (widget.message != null) ...[
            const SizedBox(height: 24),
            Text(
              widget.message!,
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

/// Full-screen loading overlay with horror theme
class GhostLoadingOverlay extends StatelessWidget {
  final String? message;

  const GhostLoadingOverlay({super.key, this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: GhostAtlasColors.primaryBackground.withValues(alpha: 0.9),
      child: GhostLoadingIndicator(message: message, size: 64),
    );
  }

  /// Show loading overlay as a modal
  static void show(BuildContext context, {String? message}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: GhostAtlasColors.primaryBackground.withValues(alpha: 0.9),
      builder: (context) => GhostLoadingOverlay(message: message),
    );
  }

  /// Hide loading overlay
  static void hide(BuildContext context) {
    Navigator.of(context).pop();
  }
}
