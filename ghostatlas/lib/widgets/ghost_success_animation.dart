import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

/// Horror-themed success animation with green checkmark and glow effect
class GhostSuccessAnimation extends StatefulWidget {
  final String title;
  final String message;
  final VoidCallback? onComplete;

  const GhostSuccessAnimation({
    super.key,
    required this.title,
    required this.message,
    this.onComplete,
  });

  @override
  State<GhostSuccessAnimation> createState() => _GhostSuccessAnimationState();

  /// Show success animation as a dialog
  static Future<void> show(
    BuildContext context, {
    required String title,
    required String message,
    VoidCallback? onComplete,
  }) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: GhostAtlasColors.primaryBackground.withValues(alpha: 0.9),
      builder:
          (context) => GhostSuccessAnimation(
            title: title,
            message: message,
            onComplete: onComplete,
          ),
    );
  }
}

class _GhostSuccessAnimationState extends State<GhostSuccessAnimation>
    with TickerProviderStateMixin {
  late AnimationController _scaleController;
  late AnimationController _glowController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();

    // Scale animation for checkmark
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );

    _scaleAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    );

    _fadeAnimation = CurvedAnimation(
      parent: _scaleController,
      curve: Curves.easeIn,
    );

    // Glow animation
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _glowAnimation = Tween<double>(begin: 15.0, end: 30.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    // Start animations
    _scaleController.forward();
    _glowController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: GhostAtlasColors.cardBackground,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: GhostAtlasColors.ghostGreenGlow,
              blurRadius: 20,
              spreadRadius: 2,
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Animated checkmark with glow
              ScaleTransition(
                scale: _scaleAnimation,
                child: AnimatedBuilder(
                  animation: _glowAnimation,
                  builder: (context, child) {
                    return Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: GhostAtlasColors.ghostGreen.withValues(
                          alpha: 0.1,
                        ),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: GhostAtlasColors.ghostGreen,
                          width: 2,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: GhostAtlasColors.ghostGreenGlow,
                            blurRadius: _glowAnimation.value,
                            spreadRadius: _glowAnimation.value / 3,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.check_circle,
                        size: 60,
                        color: GhostAtlasColors.ghostGreen,
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(height: 24),

              // Title with horror font
              FadeTransition(
                opacity: _fadeAnimation,
                child: Text(
                  widget.title,
                  style: GhostAtlasTypography.textTheme.headlineMedium
                      ?.copyWith(color: GhostAtlasColors.ghostGreen),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 12),

              // Message
              FadeTransition(
                opacity: _fadeAnimation,
                child: Text(
                  widget.message,
                  style: GhostAtlasTypography.textTheme.bodyMedium?.copyWith(
                    color: GhostAtlasColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
              ),
              const SizedBox(height: 24),

              // OK button with ghost theme
              FadeTransition(
                opacity: _fadeAnimation,
                child: SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                      widget.onComplete?.call();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      foregroundColor: GhostAtlasColors.ghostGreen,
                      side: const BorderSide(
                        color: GhostAtlasColors.ghostGreen,
                        width: 2,
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(25),
                      ),
                    ),
                    child: Text(
                      'CONTINUE',
                      style: GhostAtlasTypography.textTheme.labelLarge,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
