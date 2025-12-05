import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/onboarding_flow.dart';
import 'screens/main_app_shell.dart';
import 'screens/story_detail_screen.dart';
import 'models/encounter.dart';
import 'theme/ghost_atlas_theme.dart';

void main() {
  runApp(const GhostAtlasApp());
}

class GhostAtlasApp extends StatelessWidget {
  const GhostAtlasApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GhostAtlas',
      // Apply the GhostAtlas horror theme
      theme: GhostAtlasTheme.theme,
      // Show splash screen while checking onboarding status
      home: const AppInitializer(),
      // Configure route transitions
      onGenerateRoute: (settings) {
        // Handle story detail route with custom transition
        if (settings.name == '/story-detail') {
          final encounter = settings.arguments as Encounter;
          return PageRouteBuilder(
            settings: settings,
            pageBuilder:
                (context, animation, secondaryAnimation) =>
                    StoryDetailScreen(encounter: encounter),
            transitionsBuilder: (
              context,
              animation,
              secondaryAnimation,
              child,
            ) {
              // Slide and fade transition
              const begin = Offset(0.0, 0.1);
              const end = Offset.zero;
              const curve = Curves.easeOutCubic;

              var slideTween = Tween(
                begin: begin,
                end: end,
              ).chain(CurveTween(curve: curve));

              var fadeTween = Tween<double>(
                begin: 0.0,
                end: 1.0,
              ).chain(CurveTween(curve: curve));

              return SlideTransition(
                position: animation.drive(slideTween),
                child: FadeTransition(
                  opacity: animation.drive(fadeTween),
                  child: child,
                ),
              );
            },
            transitionDuration: const Duration(milliseconds: 400),
          );
        }

        // Default route handling
        return null;
      },
    );
  }
}

/// App initializer that checks onboarding status and routes accordingly
class AppInitializer extends StatefulWidget {
  const AppInitializer({super.key});

  @override
  State<AppInitializer> createState() => _AppInitializerState();
}

class _AppInitializerState extends State<AppInitializer> {
  @override
  void initState() {
    super.initState();
    _checkOnboardingStatus();
  }

  /// Check if user has completed onboarding
  Future<void> _checkOnboardingStatus() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final onboardingComplete = prefs.getBool('onboarding_complete') ?? false;

      if (mounted) {
        // Navigate to appropriate screen based on onboarding status
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(
            builder:
                (_) =>
                    onboardingComplete
                        ? const MainAppShell()
                        : const OnboardingFlow(),
          ),
        );
      }
    } catch (e) {
      // If SharedPreferences fails, default to showing onboarding
      debugPrint('Error checking onboarding status: $e');
      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const OnboardingFlow()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // Show a simple loading screen while checking onboarding status
    return const Scaffold(
      backgroundColor: Color(0xFF000000), // Pure black background
      body: Center(
        child: CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation<Color>(
            Color(0xFF00FF41), // Ghost green
          ),
        ),
      ),
    );
  }
}
