import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';

/// Utility class for animation helpers and performance optimizations.
///
/// Provides common animation patterns and utilities for the GhostAtlas app,
/// with built-in performance optimizations.
class AnimationUtils {
  AnimationUtils._();

  /// Standard duration for quick transitions (button presses, etc.)
  static const Duration quickDuration = Duration(milliseconds: 150);

  /// Standard duration for normal transitions (page changes, etc.)
  static const Duration normalDuration = Duration(milliseconds: 300);

  /// Standard duration for slow transitions (onboarding, etc.)
  static const Duration slowDuration = Duration(milliseconds: 500);

  /// Standard duration for pulse animations
  static const Duration pulseDuration = Duration(milliseconds: 2000);

  /// Checks if animations should be reduced based on system settings.
  ///
  /// Returns true if the user has enabled "Reduce Motion" in system settings.
  /// Use this to disable or simplify animations for accessibility.
  static bool shouldReduceMotion(BuildContext context) {
    return MediaQuery.of(context).disableAnimations;
  }

  /// Returns an appropriate duration based on reduce motion settings.
  ///
  /// If reduce motion is enabled, returns a very short duration (50ms)
  /// to make transitions nearly instant while still maintaining smooth UI updates.
  static Duration getAdaptiveDuration(
    BuildContext context,
    Duration normalDuration,
  ) {
    return shouldReduceMotion(context)
        ? const Duration(milliseconds: 50)
        : normalDuration;
  }

  /// Creates a standard easing curve for the app.
  ///
  /// Uses easeOutCubic for a smooth, natural feeling animation.
  static Curve get standardCurve => Curves.easeOutCubic;

  /// Creates a bounce curve for playful animations.
  static Curve get bounceCurve => Curves.elasticOut;

  /// Creates a sharp curve for quick, snappy animations.
  static Curve get sharpCurve => Curves.easeInOut;

  /// Delays execution until after the current frame is rendered.
  ///
  /// Useful for triggering animations after the initial build to avoid
  /// performance issues during widget construction.
  static Future<void> delayUntilNextFrame() {
    return SchedulerBinding.instance.endOfFrame;
  }

  /// Executes a callback after a delay, but only if the widget is still mounted.
  ///
  /// This prevents errors when animations try to update state after a widget
  /// has been disposed.
  static void delayedCallback({
    required Duration delay,
    required VoidCallback callback,
    required bool Function() isMounted,
  }) {
    Future.delayed(delay, () {
      if (isMounted()) {
        callback();
      }
    });
  }

  /// Creates a staggered animation controller for multiple elements.
  ///
  /// Useful for animating lists where each item should animate with a slight delay.
  ///
  /// Example:
  /// ```dart
  /// final intervals = AnimationUtils.createStaggeredIntervals(
  ///   itemCount: 5,
  ///   staggerDelay: 0.1,
  /// );
  /// ```
  static List<Interval> createStaggeredIntervals({
    required int itemCount,
    double staggerDelay = 0.1,
  }) {
    final intervals = <Interval>[];
    for (int i = 0; i < itemCount; i++) {
      final start = (i * staggerDelay).clamp(0.0, 1.0);
      final end = (start + (1.0 - start)).clamp(0.0, 1.0);
      intervals.add(Interval(start, end, curve: standardCurve));
    }
    return intervals;
  }

  /// Creates a repeating pulse animation controller.
  ///
  /// Returns a configured AnimationController that repeats indefinitely.
  /// Remember to dispose of the controller when done.
  static AnimationController createPulseController({
    required TickerProvider vsync,
    Duration duration = pulseDuration,
  }) {
    final controller = AnimationController(duration: duration, vsync: vsync);
    controller.repeat(reverse: true);
    return controller;
  }

  /// Creates a shake animation for error states.
  ///
  /// Returns an Animation<double> that can be used with Transform.translate
  /// to create a horizontal shake effect.
  static Animation<double> createShakeAnimation(
    AnimationController controller,
  ) {
    return TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0.0, end: 10.0), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 10.0, end: -10.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: -10.0, end: 10.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 10.0, end: -10.0), weight: 2),
      TweenSequenceItem(tween: Tween(begin: -10.0, end: 0.0), weight: 1),
    ]).animate(CurvedAnimation(parent: controller, curve: Curves.easeInOut));
  }

  /// Triggers a haptic feedback if available.
  ///
  /// Provides tactile feedback for button presses and interactions.
  /// Safe to call even if haptics are not supported.
  static void triggerHapticFeedback() {
    // Note: Would need to add haptic_feedback package for full implementation
    // For now, this is a placeholder that can be implemented later
    // HapticFeedback.lightImpact();
  }
}

/// A widget that conditionally animates its child based on reduce motion settings.
///
/// If reduce motion is enabled, the child is shown immediately without animation.
/// Otherwise, the specified animation is applied.
class AdaptiveAnimation extends StatelessWidget {
  final Widget child;
  final Animation<double> animation;
  final Widget Function(BuildContext, Widget?) builder;

  const AdaptiveAnimation({
    super.key,
    required this.child,
    required this.animation,
    required this.builder,
  });

  @override
  Widget build(BuildContext context) {
    if (AnimationUtils.shouldReduceMotion(context)) {
      return child;
    }
    return AnimatedBuilder(
      animation: animation,
      builder: (context, child) => builder(context, child),
      child: child,
    );
  }
}

/// Mixin for widgets that need to respect reduce motion settings.
///
/// Provides helper methods for creating animations that automatically
/// adapt to accessibility settings.
mixin ReduceMotionMixin<T extends StatefulWidget>
    on State<T>, TickerProviderStateMixin<T> {
  /// Creates an animation controller with adaptive duration.
  AnimationController createAdaptiveController({required Duration duration}) {
    final adaptiveDuration = AnimationUtils.getAdaptiveDuration(
      context,
      duration,
    );
    return AnimationController(duration: adaptiveDuration, vsync: this);
  }

  /// Checks if animations should be reduced.
  bool get shouldReduceMotion => AnimationUtils.shouldReduceMotion(context);
}
