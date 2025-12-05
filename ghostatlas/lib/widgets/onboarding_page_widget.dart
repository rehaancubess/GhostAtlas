import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import '../screens/onboarding_flow.dart';
import '../theme/ghost_atlas_colors.dart';
import '../theme/ghost_atlas_typography.dart';

/// Widget for displaying an individual onboarding page with animations
class OnboardingPageWidget extends StatefulWidget {
  final OnboardingPage page;
  final VoidCallback? onPermissionGranted;

  const OnboardingPageWidget({
    super.key,
    required this.page,
    this.onPermissionGranted,
  });

  @override
  State<OnboardingPageWidget> createState() => _OnboardingPageWidgetState();
}

class _OnboardingPageWidgetState extends State<OnboardingPageWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _setupAnimation();
  }

  void _setupAnimation() {
    _animationController = AnimationController(
      duration: _getAnimationDuration(),
      vsync: this,
    );

    _animation = _createAnimation();
    _animationController.forward();

    // For repeating animations (pulse, glow)
    if (widget.page.animationType == 'pulse' ||
        widget.page.animationType == 'glow') {
      _animationController.repeat(reverse: true);
    }
  }

  Duration _getAnimationDuration() {
    switch (widget.page.animationType) {
      case 'fade_in':
        return const Duration(milliseconds: 800);
      case 'slide_up':
        return const Duration(milliseconds: 600);
      case 'pulse':
        return const Duration(milliseconds: 1500);
      case 'glow':
        return const Duration(milliseconds: 2000);
      default:
        return const Duration(milliseconds: 800);
    }
  }

  Animation<double> _createAnimation() {
    switch (widget.page.animationType) {
      case 'fade_in':
        return CurvedAnimation(
          parent: _animationController,
          curve: Curves.easeIn,
        );
      case 'slide_up':
        return CurvedAnimation(
          parent: _animationController,
          curve: Curves.easeOut,
        );
      case 'pulse':
        return Tween<double>(begin: 0.95, end: 1.05).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );
      case 'glow':
        return Tween<double>(begin: 0.3, end: 1.0).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: Curves.easeInOut,
          ),
        );
      default:
        return CurvedAnimation(
          parent: _animationController,
          curve: Curves.easeIn,
        );
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Future<void> _requestLocationPermission() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }

      if (permission == LocationPermission.deniedForever) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text(
                'Location permissions are permanently denied. Please enable them in settings.',
              ),
              backgroundColor: GhostAtlasColors.error,
              duration: const Duration(seconds: 3),
            ),
          );
        }
        return;
      }

      if (permission == LocationPermission.whileInUse ||
          permission == LocationPermission.always) {
        widget.onPermissionGranted?.call();
      }
    } catch (e) {
      debugPrint('Error requesting location permission: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error requesting permission: $e'),
            backgroundColor: GhostAtlasColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated illustration
          _buildAnimatedIllustration(),

          const SizedBox(height: 60),

          // Title with horror font
          FadeTransition(
            opacity: _animationController,
            child: Text(
              widget.page.title,
              textAlign: TextAlign.center,
              style: GhostAtlasTypography.textTheme.displayLarge?.copyWith(
                fontSize: 36,
                height: 1.2,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Description
          FadeTransition(
            opacity: _animationController,
            child: Text(
              widget.page.description,
              textAlign: TextAlign.center,
              style: GhostAtlasTypography.textTheme.bodyLarge?.copyWith(
                height: 1.5,
              ),
            ),
          ),

          const SizedBox(height: 40),

          // Permission button if applicable
          if (widget.page.isPermissionScreen)
            FadeTransition(
              opacity: _animationController,
              child: _buildPermissionButton(),
            ),
        ],
      ),
    );
  }

  Widget _buildAnimatedIllustration() {
    Widget illustration = Container(
      width: 200,
      height: 200,
      decoration: BoxDecoration(
        color: GhostAtlasColors.cardBackground,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: Image.asset(
          widget.page.imagePath,
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) {
            // Fallback to icon if image not found
            return Icon(
              _getIconForPage(),
              size: 80,
              color: GhostAtlasColors.ghostGreen,
            );
          },
        ),
      ),
    );

    switch (widget.page.animationType) {
      case 'fade_in':
        return FadeTransition(opacity: _animation, child: illustration);

      case 'slide_up':
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, 0.3),
            end: Offset.zero,
          ).animate(_animationController),
          child: FadeTransition(opacity: _animation, child: illustration),
        );

      case 'pulse':
        return ScaleTransition(scale: _animation, child: illustration);

      case 'glow':
        return AnimatedBuilder(
          animation: _animation,
          builder: (context, child) {
            return Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: GhostAtlasColors.ghostGreen.withValues(
                      alpha: _animation.value * 0.6,
                    ),
                    blurRadius: 30 * _animation.value,
                    spreadRadius: 5 * _animation.value,
                  ),
                ],
              ),
              child: illustration,
            );
          },
        );

      default:
        return illustration;
    }
  }

  IconData _getIconForPage() {
    if (widget.page.imagePath.contains('welcome')) {
      return Icons.auto_awesome;
    } else if (widget.page.imagePath.contains('submit')) {
      return Icons.add_location;
    } else if (widget.page.imagePath.contains('map')) {
      return Icons.map;
    } else if (widget.page.imagePath.contains('ghostbuster')) {
      return Icons.verified_user;
    } else if (widget.page.imagePath.contains('permissions')) {
      return Icons.location_on;
    }
    return Icons.image;
  }

  Widget _buildPermissionButton() {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.3),
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: _requestLocationPermission,
        icon: const Icon(Icons.location_on, size: 20),
        label: const Text(
          'Continue',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            letterSpacing: 1.5,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: GhostAtlasColors.ghostGreen,
          side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(25),
          ),
          elevation: 0,
        ),
      ),
    );
  }
}
