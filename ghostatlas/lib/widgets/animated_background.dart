import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';

/// Animated background with subtle fog/glow effect for atmospheric horror theme
class AnimatedBackground extends StatefulWidget {
  const AnimatedBackground({super.key});

  @override
  State<AnimatedBackground> createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 10),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            gradient: RadialGradient(
              center: Alignment(
                math.sin(_controller.value * 2 * math.pi) * 0.5,
                math.cos(_controller.value * 2 * math.pi) * 0.5,
              ),
              radius: 1.5,
              colors: [
                GhostAtlasColors.ghostGreen.withValues(alpha: 0.05),
                GhostAtlasColors.primaryBackground,
                GhostAtlasColors.primaryBackground,
              ],
            ),
          ),
        );
      },
    );
  }
}
