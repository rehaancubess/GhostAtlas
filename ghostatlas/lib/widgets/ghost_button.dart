import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';

/// Size variants for the GhostButton
enum GhostButtonSize {
  /// Normal size button for standard interactions
  normal,

  /// Large size button for primary actions
  large,
}

/// A custom button widget with horror-themed styling featuring green borders,
/// glow effects, and press animations.
///
/// This button is designed to match the GhostAtlas horror aesthetic with:
/// - Transparent background with green border
/// - Green glow shadow effect
/// - Press animation with visual feedback
/// - Support for icon + text layout
/// - Size variants (normal and large)
///
/// Example usage:
/// ```dart
/// GhostButton(
///   text: 'ADD STORY',
///   icon: Icons.add_location,
///   onPressed: () => print('Button pressed'),
///   size: GhostButtonSize.large,
/// )
/// ```
class GhostButton extends StatefulWidget {
  /// The text to display on the button
  final String text;

  /// Optional icon to display before the text
  final IconData? icon;

  /// Callback function when the button is pressed
  final VoidCallback? onPressed;

  /// Size variant of the button (normal or large)
  final GhostButtonSize size;

  /// Whether the button should expand to fill available width
  final bool fullWidth;

  /// Custom color for the button (defaults to ghost green)
  final Color? color;

  const GhostButton({
    Key? key,
    required this.text,
    this.icon,
    this.onPressed,
    this.size = GhostButtonSize.normal,
    this.fullWidth = false,
    this.color,
  }) : super(key: key);

  @override
  State<GhostButton> createState() => _GhostButtonState();
}

class _GhostButtonState extends State<GhostButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 100),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _handleTapDown(TapDownDetails details) {
    if (widget.onPressed != null) {
      setState(() => _isPressed = true);
      _animationController.forward();
    }
  }

  void _handleTapUp(TapUpDetails details) {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  void _handleTapCancel() {
    setState(() => _isPressed = false);
    _animationController.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDisabled = widget.onPressed == null;
    final double horizontalPadding =
        widget.size == GhostButtonSize.large ? 48.0 : 32.0;
    final double verticalPadding =
        widget.size == GhostButtonSize.large ? 20.0 : 16.0;
    final double fontSize = widget.size == GhostButtonSize.large ? 18.0 : 14.0;
    final double iconSize = widget.size == GhostButtonSize.large ? 24.0 : 20.0;

    return ScaleTransition(
      scale: _scaleAnimation,
      child: GestureDetector(
        onTapDown: _handleTapDown,
        onTapUp: _handleTapUp,
        onTapCancel: _handleTapCancel,
        onTap: widget.onPressed,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(25),
            boxShadow:
                isDisabled || widget.color != null
                    ? []
                    : [
                      BoxShadow(
                        color:
                            _isPressed
                                ? GhostAtlasColors.ghostGreen.withOpacity(0.3)
                                : GhostAtlasColors.ghostGreen.withOpacity(0.5),
                        blurRadius: _isPressed ? 15 : 20,
                        spreadRadius: _isPressed ? 1 : 2,
                      ),
                    ],
          ),
          child: Container(
            padding: EdgeInsets.symmetric(
              horizontal: horizontalPadding,
              vertical: verticalPadding,
            ),
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(25),
              border: Border.all(
                color:
                    isDisabled
                        ? GhostAtlasColors.textMuted
                        : _isPressed
                        ? (widget.color ?? GhostAtlasColors.ghostGreen)
                            .withOpacity(0.7)
                        : (widget.color ?? GhostAtlasColors.ghostGreen),
                width: 2,
              ),
            ),
            child:
                widget.fullWidth
                    ? Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.max,
                      children: _buildButtonContent(
                        fontSize: fontSize,
                        iconSize: iconSize,
                        isDisabled: isDisabled,
                      ),
                    )
                    : Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      mainAxisSize: MainAxisSize.min,
                      children: _buildButtonContent(
                        fontSize: fontSize,
                        iconSize: iconSize,
                        isDisabled: isDisabled,
                      ),
                    ),
          ),
        ),
      ),
    );
  }

  List<Widget> _buildButtonContent({
    required double fontSize,
    required double iconSize,
    required bool isDisabled,
  }) {
    final Color baseColor = widget.color ?? GhostAtlasColors.ghostGreen;
    final Color contentColor =
        isDisabled
            ? GhostAtlasColors.textMuted
            : _isPressed
            ? baseColor.withOpacity(0.7)
            : baseColor;

    return [
      if (widget.icon != null) ...[
        Icon(widget.icon, size: iconSize, color: contentColor),
        const SizedBox(width: 12),
      ],
      Text(
        widget.text,
        style: TextStyle(
          fontSize: fontSize,
          fontWeight: FontWeight.w600,
          letterSpacing: 1.5,
          color: contentColor,
        ),
      ),
    ];
  }
}
