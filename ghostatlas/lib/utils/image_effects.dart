import 'package:flutter/material.dart';

/// Utility class for applying visual effects to images in the GhostAtlas app.
/// Provides vignette effects and other atmospheric image treatments.
class ImageEffects {
  ImageEffects._();

  /// Creates a vignette overlay widget that darkens the edges of an image.
  ///
  /// The vignette effect creates a gradual darkening from the center to the edges,
  /// enhancing the horror atmosphere and drawing focus to the center of images.
  ///
  /// Parameters:
  /// - [intensity]: Controls the darkness of the vignette (0.0 to 1.0). Default is 0.7.
  /// - [borderRadius]: Optional border radius to match the underlying image container.
  ///
  /// Example usage:
  /// ```dart
  /// Stack(
  ///   children: [
  ///     Image.network(imageUrl),
  ///     ImageEffects.vignetteOverlay(intensity: 0.8),
  ///   ],
  /// )
  /// ```
  static Widget vignetteOverlay({
    double intensity = 0.7,
    BorderRadius? borderRadius,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        gradient: RadialGradient(
          center: Alignment.center,
          radius: 1.0,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: intensity * 0.5),
            Colors.black.withValues(alpha: intensity),
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
    );
  }

  /// Creates a vignette overlay with a green tint for extra spookiness.
  ///
  /// Similar to [vignetteOverlay] but adds a subtle green glow effect
  /// that matches the GhostAtlas theme.
  ///
  /// Parameters:
  /// - [intensity]: Controls the darkness of the vignette (0.0 to 1.0). Default is 0.6.
  /// - [greenTint]: Controls the intensity of the green tint (0.0 to 1.0). Default is 0.2.
  /// - [borderRadius]: Optional border radius to match the underlying image container.
  static Widget ghostVignetteOverlay({
    double intensity = 0.6,
    double greenTint = 0.2,
    BorderRadius? borderRadius,
  }) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: borderRadius,
        gradient: RadialGradient(
          center: Alignment.center,
          radius: 1.0,
          colors: [
            const Color(0xFF00FF41).withValues(alpha: greenTint * 0.1),
            Colors.black.withValues(alpha: intensity * 0.4),
            Colors.black.withValues(alpha: intensity),
          ],
          stops: const [0.0, 0.6, 1.0],
        ),
      ),
    );
  }

  /// Creates a top-to-bottom gradient overlay for fading text or content.
  ///
  /// Useful for creating "read more" effects on story cards or fading
  /// content at the bottom of scrollable areas.
  ///
  /// Parameters:
  /// - [backgroundColor]: The color to fade to. Should match the container background.
  /// - [height]: Height of the gradient overlay.
  /// - [startOpacity]: Starting opacity at the top (0.0 to 1.0). Default is 0.0.
  /// - [endOpacity]: Ending opacity at the bottom (0.0 to 1.0). Default is 1.0.
  static Widget fadeGradientOverlay({
    required Color backgroundColor,
    double height = 60,
    double startOpacity = 0.0,
    double endOpacity = 1.0,
  }) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            backgroundColor.withValues(alpha: startOpacity),
            backgroundColor.withValues(alpha: endOpacity),
          ],
        ),
      ),
    );
  }

  /// Wraps an image widget with a vignette effect.
  ///
  /// Convenience method that creates a Stack with the image and vignette overlay.
  ///
  /// Parameters:
  /// - [child]: The image widget to apply the vignette to.
  /// - [intensity]: Controls the darkness of the vignette (0.0 to 1.0). Default is 0.7.
  /// - [borderRadius]: Optional border radius for the container.
  /// - [useGhostVignette]: If true, uses the green-tinted vignette. Default is false.
  static Widget withVignette({
    required Widget child,
    double intensity = 0.7,
    BorderRadius? borderRadius,
    bool useGhostVignette = false,
  }) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: Stack(
        fit: StackFit.passthrough,
        children: [
          child,
          Positioned.fill(
            child:
                useGhostVignette
                    ? ghostVignetteOverlay(
                      intensity: intensity,
                      borderRadius: borderRadius,
                    )
                    : vignetteOverlay(
                      intensity: intensity,
                      borderRadius: borderRadius,
                    ),
          ),
        ],
      ),
    );
  }
}
