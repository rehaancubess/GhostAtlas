import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';

/// A button wrapper that adds a subtle pulse animation to draw attention.
///
/// This widget wraps any child widget (typically a button) and adds a
/// continuous pulsing glow effect to make it more prominent and atmospheric.
///
/// The pulse animation is optimized for performance and can be disabled
/// when the button is pressed or disabled.
///
/// Example usage:
/// ```dart
/// PulsingButton(
///   child: GhostButton(
///     text: 'IMPORTANT ACTION',
///     onPressed: () {},
///   ),
/// )
/// ```
class PulsingButton extends StatefulWidget {
  /// The button widget to wrap with pulse animation
  final Widget child;

  /// Whether the pulse animation is enabled
  final bool enabled;

  /// Duration of one complete pulse cycle
  final Duration duration;

  /// Minimum scale of the pulse (1.0 = no scale change)
  final double minScale;

  /// Maximum scale of the pulse
  final double maxScale;

  /// Color of the pulsing glow effect
  final Color glowColor;

  const PulsingButton({
    super.key,
    required this.child,
    this.enabled = true,
    this.duration = const Duration(milliseconds: 2000),
    this.minScale = 1.0,
    this.maxScale = 1.05,
    this.glowColor = GhostAtlasColors.ghostGreenGlow,
  });

  @override
  State<PulsingButton> createState() => _PulsingButtonState();
}

class _PulsingButtonState extends State<PulsingButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this);

    _scaleAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(
          begin: widget.minScale,
          end: widget.maxScale,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: widget.maxScale,
          end: widget.minScale,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    _glowAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 0.5,
          end: 1.0,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: 1.0,
          end: 0.5,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    if (widget.enabled) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(PulsingButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enabled != oldWidget.enabled) {
      if (widget.enabled) {
        _controller.repeat();
      } else {
        _controller.stop();
        _controller.value = 0;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(25),
              boxShadow: [
                BoxShadow(
                  color: widget.glowColor.withValues(
                    alpha: widget.glowColor.a * _glowAnimation.value,
                  ),
                  blurRadius: 20 + (10 * _glowAnimation.value),
                  spreadRadius: 2 + (2 * _glowAnimation.value),
                ),
              ],
            ),
            child: child,
          ),
        );
      },
      child: widget.child,
    );
  }
}

/// A simpler pulse effect that only animates opacity/glow without scaling.
///
/// This is more subtle and better for buttons that shouldn't move,
/// but still need to draw attention.
class GlowPulseButton extends StatefulWidget {
  /// The button widget to wrap with glow pulse animation
  final Widget child;

  /// Whether the pulse animation is enabled
  final bool enabled;

  /// Duration of one complete pulse cycle
  final Duration duration;

  /// Color of the pulsing glow effect
  final Color glowColor;

  /// Minimum glow intensity (0.0 to 1.0)
  final double minGlow;

  /// Maximum glow intensity (0.0 to 1.0)
  final double maxGlow;

  const GlowPulseButton({
    super.key,
    required this.child,
    this.enabled = true,
    this.duration = const Duration(milliseconds: 2000),
    this.glowColor = GhostAtlasColors.ghostGreenGlow,
    this.minGlow = 0.3,
    this.maxGlow = 1.0,
  });

  @override
  State<GlowPulseButton> createState() => _GlowPulseButtonState();
}

class _GlowPulseButtonState extends State<GlowPulseButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(duration: widget.duration, vsync: this);

    _glowAnimation = TweenSequence<double>([
      TweenSequenceItem(
        tween: Tween<double>(
          begin: widget.minGlow,
          end: widget.maxGlow,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
      TweenSequenceItem(
        tween: Tween<double>(
          begin: widget.maxGlow,
          end: widget.minGlow,
        ).chain(CurveTween(curve: Curves.easeInOut)),
        weight: 50,
      ),
    ]).animate(_controller);

    if (widget.enabled) {
      _controller.repeat();
    }
  }

  @override
  void didUpdateWidget(GlowPulseButton oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.enabled != oldWidget.enabled) {
      if (widget.enabled) {
        _controller.repeat();
      } else {
        _controller.stop();
        _controller.value = 0;
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enabled) {
      return widget.child;
    }

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(25),
            boxShadow: [
              BoxShadow(
                color: widget.glowColor.withValues(
                  alpha: widget.glowColor.a * _glowAnimation.value,
                ),
                blurRadius: 15 + (10 * _glowAnimation.value),
                spreadRadius: 1 + (2 * _glowAnimation.value),
              ),
            ],
          ),
          child: child,
        );
      },
      child: widget.child,
    );
  }
}
