import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'main_app_shell.dart';
import '../widgets/animated_background.dart';
import '../widgets/onboarding_page_widget.dart';
import '../theme/ghost_atlas_colors.dart';

/// Data model for an onboarding page
class OnboardingPage {
  final String title;
  final String description;
  final String imagePath;
  final String animationType;
  final bool isPermissionScreen;

  const OnboardingPage({
    required this.title,
    required this.description,
    required this.imagePath,
    this.animationType = 'fade_in',
    this.isPermissionScreen = false,
  });
}

/// Onboarding flow screen shown to first-time users
class OnboardingFlow extends StatefulWidget {
  const OnboardingFlow({super.key});

  @override
  State<OnboardingFlow> createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // Define onboarding pages
  final List<OnboardingPage> _pages = const [
    OnboardingPage(
      title: 'Welcome to\nGhostAtlas',
      description:
          'Document and explore real paranormal encounters from around the world',
      imagePath: 'assets/onboarding/ghost_welcome.png',
      animationType: 'fade_in',
    ),
    OnboardingPage(
      title: 'Share Your\nEncounters',
      description:
          'Record your ghost stories with location, time, and photos. Our AI transforms them into cinematic horror narratives',
      imagePath: 'assets/onboarding/submit_story.png',
      animationType: 'slide_up',
    ),
    OnboardingPage(
      title: 'Explore\nHaunted Locations',
      description:
          'Discover supernatural hotspots on our global map. See where others have encountered the paranormal',
      imagePath: 'assets/onboarding/haunted_map.png',
      animationType: 'pulse',
    ),
    OnboardingPage(
      title: 'Become a\nGhostbuster',
      description:
          'Visit haunted locations in person and verify other users\' experiences. Rate the spookiness yourself',
      imagePath: 'assets/onboarding/ghostbuster.png',
      animationType: 'glow',
    ),
    OnboardingPage(
      title: 'Grant\nPermissions',
      description:
          'We need location access to map encounters and enable Ghostbuster Mode',
      imagePath: 'assets/onboarding/permissions.png',
      isPermissionScreen: true,
    ),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  /// Complete onboarding and navigate to main app
  Future<void> _completeOnboarding() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setBool('onboarding_complete', true);

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainAppShell()),
        );
      }
    } catch (e) {
      // If SharedPreferences fails, still navigate to main app
      debugPrint('Error saving onboarding state: $e');
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainAppShell()),
        );
      }
    }
  }

  /// Navigate to next page or complete onboarding
  void _nextPage() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: GhostAtlasColors.primaryBackground,
      body: SafeArea(
        child: Stack(
          children: [
            // Animated background with fog effect
            const AnimatedBackground(),

            // PageView for onboarding screens
            PageView.builder(
              controller: _pageController,
              onPageChanged: (index) {
                setState(() {
                  _currentPage = index;
                });
              },
              itemCount: _pages.length,
              itemBuilder: (context, index) {
                return OnboardingPageWidget(
                  page: _pages[index],
                  onPermissionGranted: _completeOnboarding,
                );
              },
            ),

            // Skip button (hidden on last page)
            if (_currentPage < _pages.length - 1)
              Positioned(
                top: 16,
                right: 16,
                child: TextButton(
                  onPressed: _completeOnboarding,
                  child: Text(
                    'SKIP',
                    style: TextStyle(
                      color: GhostAtlasColors.textMuted,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),

            // Page indicators
            Positioned(
              bottom: 100,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _pages.length,
                  (index) => _buildPageIndicator(index),
                ),
              ),
            ),

            // Next/Complete button
            Positioned(
              bottom: 32,
              left: 32,
              right: 32,
              child: Container(
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
                child: ElevatedButton(
                  onPressed: _nextPage,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    foregroundColor: GhostAtlasColors.ghostGreen,
                    side: BorderSide(
                      color: GhostAtlasColors.ghostGreen,
                      width: 2,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    elevation: 0,
                  ),
                  child: Text(
                    _currentPage < _pages.length - 1 ? 'NEXT' : 'GET STARTED',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Build page indicator dot
  Widget _buildPageIndicator(int index) {
    final isActive = index == _currentPage;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: isActive ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color:
            isActive ? GhostAtlasColors.ghostGreen : GhostAtlasColors.textMuted,
        borderRadius: BorderRadius.circular(4),
        boxShadow:
            isActive
                ? [
                  BoxShadow(
                    color: GhostAtlasColors.ghostGreen.withValues(alpha: 0.5),
                    blurRadius: 10,
                    spreadRadius: 1,
                  ),
                ]
                : [],
      ),
    );
  }
}
