import 'package:flutter/material.dart';
import '../theme/ghost_atlas_colors.dart';

/// A custom text field with horror-themed styling and green glow effect on focus.
///
/// Features:
/// - Dark background with green border on focus
/// - Animated green glow effect when focused
/// - Consistent styling with GhostAtlas theme
/// - Support for all standard TextField properties
class GhostTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? labelText;
  final String? hintText;
  final IconData? prefixIcon;
  final IconData? suffixIcon;
  final VoidCallback? onSuffixIconPressed;
  final bool obscureText;
  final TextInputType? keyboardType;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final ValueChanged<String>? onChanged;
  final FormFieldValidator<String>? validator;
  final bool enabled;
  final TextInputAction? textInputAction;
  final VoidCallback? onEditingComplete;
  final ValueChanged<String>? onSubmitted;

  const GhostTextField({
    super.key,
    this.controller,
    this.labelText,
    this.hintText,
    this.prefixIcon,
    this.suffixIcon,
    this.onSuffixIconPressed,
    this.obscureText = false,
    this.keyboardType,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.onChanged,
    this.validator,
    this.enabled = true,
    this.textInputAction,
    this.onEditingComplete,
    this.onSubmitted,
  });

  @override
  State<GhostTextField> createState() => _GhostTextFieldState();
}

class _GhostTextFieldState extends State<GhostTextField>
    with SingleTickerProviderStateMixin {
  late AnimationController _glowController;
  late Animation<double> _glowAnimation;
  bool _isFocused = false;
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _glowAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _glowController, curve: Curves.easeInOut),
    );

    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    _glowController.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
      if (_isFocused) {
        _glowController.forward();
      } else {
        _glowController.reverse();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _glowAnimation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            boxShadow:
                _isFocused
                    ? [
                      BoxShadow(
                        color: GhostAtlasColors.ghostGreenGlow,
                        blurRadius: 20 * _glowAnimation.value,
                        spreadRadius: 2 * _glowAnimation.value,
                      ),
                    ]
                    : [],
          ),
          child: TextFormField(
            controller: widget.controller,
            focusNode: _focusNode,
            obscureText: widget.obscureText,
            keyboardType: widget.keyboardType,
            maxLines: widget.maxLines,
            minLines: widget.minLines,
            maxLength: widget.maxLength,
            onChanged: widget.onChanged,
            validator: widget.validator,
            enabled: widget.enabled,
            textInputAction: widget.textInputAction,
            onEditingComplete: widget.onEditingComplete,
            onFieldSubmitted: widget.onSubmitted,
            style: const TextStyle(
              color: GhostAtlasColors.textPrimary,
              fontSize: 16,
            ),
            decoration: InputDecoration(
              labelText: widget.labelText,
              hintText: widget.hintText,
              filled: true,
              fillColor: GhostAtlasColors.secondaryBackground,
              prefixIcon:
                  widget.prefixIcon != null
                      ? Icon(
                        widget.prefixIcon,
                        color:
                            _isFocused
                                ? GhostAtlasColors.ghostGreen
                                : GhostAtlasColors.textTertiary,
                      )
                      : null,
              suffixIcon:
                  widget.suffixIcon != null
                      ? IconButton(
                        icon: Icon(
                          widget.suffixIcon,
                          color:
                              _isFocused
                                  ? GhostAtlasColors.ghostGreen
                                  : GhostAtlasColors.textTertiary,
                        ),
                        onPressed: widget.onSuffixIconPressed,
                      )
                      : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: GhostAtlasColors.textMuted,
                  width: 1,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: GhostAtlasColors.textMuted,
                  width: 1,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: GhostAtlasColors.ghostGreen,
                  width: 2,
                ),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: GhostAtlasColors.error,
                  width: 1,
                ),
              ),
              focusedErrorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(
                  color: GhostAtlasColors.error,
                  width: 2,
                ),
              ),
              labelStyle: TextStyle(
                color:
                    _isFocused
                        ? GhostAtlasColors.ghostGreen
                        : GhostAtlasColors.textTertiary,
              ),
              hintStyle: const TextStyle(color: GhostAtlasColors.textMuted),
            ),
          ),
        );
      },
    );
  }
}
