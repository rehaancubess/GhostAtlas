import 'package:flutter/material.dart';

/// Custom page transitions for the GhostAtlas app with horror-themed animations.
/// Provides fade and slide transitions for screen navigation.

/// Fade transition for screen changes with configurable duration.
class FadePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final Duration duration;

  FadePageRoute({
    required this.page,
    this.duration = const Duration(milliseconds: 300),
  }) : super(
         pageBuilder: (context, animation, secondaryAnimation) => page,
         transitionDuration: duration,
         reverseTransitionDuration: duration,
         transitionsBuilder: (context, animation, secondaryAnimation, child) {
           return FadeTransition(opacity: animation, child: child);
         },
       );
}

/// Slide transition from bottom to top with fade effect.
class SlideUpPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final Duration duration;

  SlideUpPageRoute({
    required this.page,
    this.duration = const Duration(milliseconds: 350),
  }) : super(
         pageBuilder: (context, animation, secondaryAnimation) => page,
         transitionDuration: duration,
         reverseTransitionDuration: duration,
         transitionsBuilder: (context, animation, secondaryAnimation, child) {
           const begin = Offset(0.0, 1.0);
           const end = Offset.zero;
           final tween = Tween(begin: begin, end: end);
           final curvedAnimation = CurvedAnimation(
             parent: animation,
             curve: Curves.easeOutCubic,
             reverseCurve: Curves.easeInCubic,
           );

           return SlideTransition(
             position: tween.animate(curvedAnimation),
             child: FadeTransition(opacity: animation, child: child),
           );
         },
       );
}

/// Slide transition from right to left (standard forward navigation).
class SlideRightPageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final Duration duration;

  SlideRightPageRoute({
    required this.page,
    this.duration = const Duration(milliseconds: 300),
  }) : super(
         pageBuilder: (context, animation, secondaryAnimation) => page,
         transitionDuration: duration,
         reverseTransitionDuration: duration,
         transitionsBuilder: (context, animation, secondaryAnimation, child) {
           const begin = Offset(1.0, 0.0);
           const end = Offset.zero;
           final tween = Tween(begin: begin, end: end);
           final curvedAnimation = CurvedAnimation(
             parent: animation,
             curve: Curves.easeOutCubic,
             reverseCurve: Curves.easeInCubic,
           );

           return SlideTransition(
             position: tween.animate(curvedAnimation),
             child: child,
           );
         },
       );
}

/// Fade and scale transition for modal-style screens.
class ScalePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;
  final Duration duration;

  ScalePageRoute({
    required this.page,
    this.duration = const Duration(milliseconds: 300),
  }) : super(
         pageBuilder: (context, animation, secondaryAnimation) => page,
         transitionDuration: duration,
         reverseTransitionDuration: duration,
         transitionsBuilder: (context, animation, secondaryAnimation, child) {
           final curvedAnimation = CurvedAnimation(
             parent: animation,
             curve: Curves.easeOutCubic,
             reverseCurve: Curves.easeInCubic,
           );

           return ScaleTransition(
             scale: Tween<double>(
               begin: 0.9,
               end: 1.0,
             ).animate(curvedAnimation),
             child: FadeTransition(opacity: animation, child: child),
           );
         },
       );
}

/// Extension methods for easy navigation with custom transitions.
extension NavigationExtensions on BuildContext {
  /// Navigate with fade transition.
  Future<T?> pushFade<T>(Widget page) {
    return Navigator.of(this).push<T>(FadePageRoute(page: page));
  }

  /// Navigate with slide up transition.
  Future<T?> pushSlideUp<T>(Widget page) {
    return Navigator.of(this).push<T>(SlideUpPageRoute(page: page));
  }

  /// Navigate with slide right transition.
  Future<T?> pushSlideRight<T>(Widget page) {
    return Navigator.of(this).push<T>(SlideRightPageRoute(page: page));
  }

  /// Navigate with scale transition.
  Future<T?> pushScale<T>(Widget page) {
    return Navigator.of(this).push<T>(ScalePageRoute(page: page));
  }
}
