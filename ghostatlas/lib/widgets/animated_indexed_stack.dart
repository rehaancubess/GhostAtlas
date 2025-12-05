import 'package:flutter/material.dart';

/// An IndexedStack with smooth fade transitions between children.
///
/// This widget provides animated transitions when switching between tabs
/// in the bottom navigation, creating a more polished user experience.
///
/// The animation is optimized to only animate the incoming and outgoing
/// widgets, keeping other children in the stack unmounted for performance.
class AnimatedIndexedStack extends StatefulWidget {
  /// The index of the child to display
  final int index;

  /// The list of child widgets
  final List<Widget> children;

  /// Duration of the fade transition
  final Duration duration;

  /// Sizing behavior of the stack
  final StackFit sizing;

  /// Alignment of children in the stack
  final AlignmentGeometry alignment;

  const AnimatedIndexedStack({
    super.key,
    required this.index,
    required this.children,
    this.duration = const Duration(milliseconds: 300),
    this.sizing = StackFit.loose,
    this.alignment = AlignmentDirectional.topStart,
  });

  @override
  State<AnimatedIndexedStack> createState() => _AnimatedIndexedStackState();
}

class _AnimatedIndexedStackState extends State<AnimatedIndexedStack>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  int _previousIndex = 0;

  @override
  void initState() {
    super.initState();
    _previousIndex = widget.index;
    _controller = AnimationController(duration: widget.duration, vsync: this);
    _animation = CurvedAnimation(parent: _controller, curve: Curves.easeInOut);
    _controller.value = 1.0;
  }

  @override
  void didUpdateWidget(AnimatedIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.index != oldWidget.index) {
      _previousIndex = oldWidget.index;
      _controller.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Stack(
          fit: widget.sizing,
          alignment: widget.alignment,
          children: List.generate(widget.children.length, (index) {
            // Only build the current and previous widgets for performance
            if (index != widget.index && index != _previousIndex) {
              return const SizedBox.shrink();
            }

            final isCurrentIndex = index == widget.index;
            final opacity =
                isCurrentIndex ? _animation.value : 1.0 - _animation.value;

            // Don't render if fully transparent
            if (opacity <= 0.0) {
              return const SizedBox.shrink();
            }

            return Opacity(
              opacity: opacity,
              child: IgnorePointer(
                ignoring: !isCurrentIndex || opacity < 1.0,
                child: widget.children[index],
              ),
            );
          }),
        );
      },
    );
  }
}

/// A more advanced animated stack with slide and fade transitions.
///
/// This provides a more dynamic transition effect where the new screen
/// slides in while the old one fades out.
class SlideAnimatedIndexedStack extends StatefulWidget {
  /// The index of the child to display
  final int index;

  /// The list of child widgets
  final List<Widget> children;

  /// Duration of the transition
  final Duration duration;

  /// Direction of the slide animation based on index change
  final bool slideHorizontally;

  const SlideAnimatedIndexedStack({
    super.key,
    required this.index,
    required this.children,
    this.duration = const Duration(milliseconds: 300),
    this.slideHorizontally = true,
  });

  @override
  State<SlideAnimatedIndexedStack> createState() =>
      _SlideAnimatedIndexedStackState();
}

class _SlideAnimatedIndexedStackState extends State<SlideAnimatedIndexedStack>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;
  int _previousIndex = 0;
  bool _slideRight = true;

  @override
  void initState() {
    super.initState();
    _previousIndex = widget.index;
    _controller = AnimationController(duration: widget.duration, vsync: this);

    _updateAnimations();
    _controller.value = 1.0;
  }

  void _updateAnimations() {
    final slideDirection = _slideRight ? 1.0 : -1.0;
    final begin =
        widget.slideHorizontally
            ? Offset(0.1 * slideDirection, 0.0)
            : Offset(0.0, 0.1 * slideDirection);

    _slideAnimation = Tween<Offset>(
      begin: begin,
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));

    _fadeAnimation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );
  }

  @override
  void didUpdateWidget(SlideAnimatedIndexedStack oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.index != oldWidget.index) {
      _slideRight = widget.index > oldWidget.index;
      _previousIndex = oldWidget.index;
      _updateAnimations();
      _controller.forward(from: 0.0);
    }
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
        return Stack(
          fit: StackFit.expand,
          children: List.generate(widget.children.length, (index) {
            // Only build the current and previous widgets for performance
            if (index != widget.index && index != _previousIndex) {
              return const SizedBox.shrink();
            }

            final isCurrentIndex = index == widget.index;

            if (isCurrentIndex) {
              // Animate the incoming screen
              return SlideTransition(
                position: _slideAnimation,
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: widget.children[index],
                ),
              );
            } else {
              // Fade out the outgoing screen
              final opacity = 1.0 - _fadeAnimation.value;
              if (opacity <= 0.0) {
                return const SizedBox.shrink();
              }
              return Opacity(
                opacity: opacity,
                child: IgnorePointer(child: widget.children[index]),
              );
            }
          }),
        );
      },
    );
  }
}
