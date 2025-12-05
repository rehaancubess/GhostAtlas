# Design Document

## Overview

The GhostAtlas UI Theme Enhancement creates an immersive horror experience through a cohesive dark visual design system. The implementation uses Flutter's ThemeData to define a global theme with dark backgrounds, eerie green accents, and horror-inspired typography. The design includes atmospheric onboarding screens using PageView, a bottom navigation system with four tabs (Stories, Map, Submit, Profile), and consistent styling across all components. Visual effects like glows, shadows, and animations enhance the supernatural atmosphere while maintaining usability and performance.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter Application                       │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Theme System (ThemeData)                   │ │
│  │  - Dark color scheme                                    │ │
│  │  - Horror typography                                    │ │
│  │  - Component styles                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                          │                                   │
│  ┌───────────────────────┴───────────────────────────────┐  │
│  │                                                        │  │
│  ▼                                                        ▼  │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │  Onboarding Flow │              │  Main App Shell  │    │
│  │  (First Launch)  │              │  (Bottom Nav)    │    │
│  └──────────────────┘              └──────────────────┘    │
│                                              │              │
│                    ┌─────────────────────────┼─────────────┐│
│                    │         │         │           │        ││
│              ┌─────▼───┐ ┌──▼───┐ ┌───▼────┐ ┌────▼─────┐ ││
│              │ Stories │ │ Map  │ │ Submit │ │ Profile  │ ││
│              │   Tab   │ │ Tab  │ │  Tab   │ │   Tab    │ ││
│              └─────────┘ └──────┘ └────────┘ └──────────┘ ││
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Flutter SDK (latest stable)
- Material Design 3 with custom dark theme
- Google Fonts package for horror typography
- Shared Preferences for onboarding state
- Custom animations and visual effects


## Components and Interfaces

### 1. Theme System

**Purpose:** Define global visual styling for the entire application

**Color Palette:**
```dart
class GhostAtlasColors {
  // Backgrounds
  static const Color primaryBackground = Color(0xFF000000); // Pure black
  static const Color secondaryBackground = Color(0xFF0A0A0A); // Near black
  static const Color cardBackground = Color(0xFF121212); // Elevated surfaces
  
  // Accents
  static const Color ghostGreen = Color(0xFF00FF41); // Primary accent
  static const Color ghostGreenDim = Color(0xFF00CC33); // Dimmed accent
  static const Color ghostGreenGlow = Color(0x4000FF41); // Glow effect (25% opacity)
  
  // Text
  static const Color textPrimary = Color(0xFFFFFFFF); // White
  static const Color textSecondary = Color(0xFFE0E0E0); // Light gray
  static const Color textTertiary = Color(0xFF999999); // Medium gray
  static const Color textMuted = Color(0xFF666666); // Dark gray
  
  // Semantic
  static const Color error = Color(0xFFFF4444);
  static const Color warning = Color(0xFFFFAA00);
  static const Color success = Color(0xFF00FF41); // Same as ghost green
}
```

**Typography:**
```dart
class GhostAtlasTypography {
  // Horror font for titles and headings
  static const String horrorFont = 'Creepster'; // or 'Nosifer', 'Eater'
  
  // Clean font for body text
  static const String bodyFont = 'Roboto';
  
  static TextTheme textTheme = TextTheme(
    displayLarge: TextStyle(
      fontFamily: horrorFont,
      fontSize: 48,
      color: GhostAtlasColors.ghostGreen,
      shadows: [
        Shadow(
          color: GhostAtlasColors.ghostGreenGlow,
          blurRadius: 20,
        ),
      ],
    ),
    headlineLarge: TextStyle(
      fontFamily: horrorFont,
      fontSize: 32,
      color: GhostAtlasColors.ghostGreen,
    ),
    headlineMedium: TextStyle(
      fontFamily: horrorFont,
      fontSize: 24,
      color: GhostAtlasColors.textPrimary,
    ),
    bodyLarge: TextStyle(
      fontFamily: bodyFont,
      fontSize: 16,
      color: GhostAtlasColors.textSecondary,
    ),
    bodyMedium: TextStyle(
      fontFamily: bodyFont,
      fontSize: 14,
      color: GhostAtlasColors.textSecondary,
    ),
    labelLarge: TextStyle(
      fontFamily: bodyFont,
      fontSize: 14,
      fontWeight: FontWeight.w600,
      color: GhostAtlasColors.ghostGreen,
      letterSpacing: 1.2,
    ),
  );
}
```

**Theme Configuration:**
```dart
ThemeData ghostAtlasTheme = ThemeData(
  brightness: Brightness.dark,
  scaffoldBackgroundColor: GhostAtlasColors.primaryBackground,
  colorScheme: ColorScheme.dark(
    primary: GhostAtlasColors.ghostGreen,
    secondary: GhostAtlasColors.ghostGreenDim,
    surface: GhostAtlasColors.cardBackground,
    background: GhostAtlasColors.primaryBackground,
    error: GhostAtlasColors.error,
  ),
  textTheme: GhostAtlasTypography.textTheme,
  
  // Button themes
  elevatedButtonTheme: ElevatedButtonThemeData(
    style: ElevatedButton.styleFrom(
      backgroundColor: Colors.transparent,
      foregroundColor: GhostAtlasColors.ghostGreen,
      side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(25)),
      padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
      elevation: 0,
    ),
  ),
  
  // Input decoration theme
  inputDecorationTheme: InputDecorationTheme(
    filled: true,
    fillColor: GhostAtlasColors.secondaryBackground,
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: GhostAtlasColors.textMuted),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
    ),
    labelStyle: TextStyle(color: GhostAtlasColors.textTertiary),
    hintStyle: TextStyle(color: GhostAtlasColors.textMuted),
  ),
  
  // Card theme
  cardTheme: CardTheme(
    color: GhostAtlasColors.cardBackground,
    elevation: 4,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(16),
      side: BorderSide(color: GhostAtlasColors.ghostGreen.withOpacity(0.3), width: 1),
    ),
  ),
);
```

### 2. Onboarding Flow

**Purpose:** Introduce first-time users to GhostAtlas with atmospheric screens

**Implementation:**
```dart
class OnboardingFlow extends StatefulWidget {
  @override
  _OnboardingFlowState createState() => _OnboardingFlowState();
}

class _OnboardingFlowState extends State<OnboardingFlow> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  
  final List<OnboardingPage> pages = [
    OnboardingPage(
      title: 'Welcome to\nGhostAtlas',
      description: 'Document and explore real paranormal encounters from around the world',
      imagePath: 'assets/onboarding/ghost_welcome.png',
      animation: 'fade_in',
    ),
    OnboardingPage(
      title: 'Share Your\nEncounters',
      description: 'Record your ghost stories with location, time, and photos. Our AI transforms them into cinematic horror narratives',
      imagePath: 'assets/onboarding/submit_story.png',
      animation: 'slide_up',
    ),
    OnboardingPage(
      title: 'Explore\nHaunted Locations',
      description: 'Discover supernatural hotspots on our global map. See where others have encountered the paranormal',
      imagePath: 'assets/onboarding/haunted_map.png',
      animation: 'pulse',
    ),
    OnboardingPage(
      title: 'Become a\nGhostbuster',
      description: 'Visit haunted locations in person and verify other users\' experiences. Rate the spookiness yourself',
      imagePath: 'assets/onboarding/ghostbuster.png',
      animation: 'glow',
    ),
    OnboardingPage(
      title: 'Grant\nPermissions',
      description: 'We need location access to map encounters and enable Ghostbuster Mode',
      imagePath: 'assets/onboarding/permissions.png',
      isPermissionScreen: true,
    ),
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Background with subtle animated fog effect
          AnimatedBackground(),
          
          // Page view
          PageView.builder(
            controller: _pageController,
            onPageChanged: (index) => setState(() => _currentPage = index),
            itemCount: pages.length,
            itemBuilder: (context, index) => OnboardingPageWidget(
              page: pages[index],
              onPermissionGranted: () => _completeOnboarding(),
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
                pages.length,
                (index) => AnimatedContainer(
                  duration: Duration(milliseconds: 300),
                  margin: EdgeInsets.symmetric(horizontal: 4),
                  width: _currentPage == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: _currentPage == index 
                      ? GhostAtlasColors.ghostGreen 
                      : GhostAtlasColors.textMuted,
                    borderRadius: BorderRadius.circular(4),
                    boxShadow: _currentPage == index ? [
                      BoxShadow(
                        color: GhostAtlasColors.ghostGreenGlow,
                        blurRadius: 10,
                      ),
                    ] : [],
                  ),
                ),
              ),
            ),
          ),
          
          // Skip button
          if (_currentPage < pages.length - 1)
            Positioned(
              top: 50,
              right: 20,
              child: TextButton(
                onPressed: () => _completeOnboarding(),
                child: Text(
                  'SKIP',
                  style: TextStyle(
                    color: GhostAtlasColors.textTertiary,
                    letterSpacing: 1.5,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
  
  Future<void> _completeOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_complete', true);
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => MainAppShell()),
    );
  }
}
```

**Onboarding Page Widget:**
```dart
class OnboardingPageWidget extends StatelessWidget {
  final OnboardingPage page;
  final VoidCallback? onPermissionGranted;
  
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Animated illustration
          AnimatedIllustration(
            imagePath: page.imagePath,
            animation: page.animation,
          ),
          
          SizedBox(height: 60),
          
          // Title with horror font
          Text(
            page.title,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.displayLarge,
          ),
          
          SizedBox(height: 24),
          
          // Description
          Text(
            page.description,
            textAlign: TextAlign.center,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
          
          SizedBox(height: 40),
          
          // Permission button if applicable
          if (page.isPermissionScreen)
            GhostButton(
              text: 'GRANT LOCATION ACCESS',
              icon: Icons.location_on,
              onPressed: () async {
                await _requestLocationPermission();
                onPermissionGranted?.call();
              },
            ),
        ],
      ),
    );
  }
}
```

### 3. Main App Shell with Bottom Navigation

**Purpose:** Provide persistent navigation between main app sections

**Implementation:**
```dart
class MainAppShell extends StatefulWidget {
  @override
  _MainAppShellState createState() => _MainAppShellState();
}

class _MainAppShellState extends State<MainAppShell> {
  int _currentIndex = 0;
  int _logoTapCount = 0;
  bool _adminUnlocked = false;
  
  final List<Widget> _screens = [
    StoriesTab(),
    MapTab(),
    SubmitTab(),
    ProfileTab(),
  ];
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(
            top: BorderSide(
              color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
              width: 1,
            ),
          ),
          boxShadow: [
            BoxShadow(
              color: GhostAtlasColors.ghostGreenGlow,
              blurRadius: 20,
              offset: Offset(0, -5),
            ),
          ],
        ),
        child: BottomNavigationBar(
          currentIndex: _currentIndex,
          onTap: (index) => setState(() => _currentIndex = index),
          type: BottomNavigationBarType.fixed,
          backgroundColor: GhostAtlasColors.secondaryBackground,
          selectedItemColor: GhostAtlasColors.ghostGreen,
          unselectedItemColor: GhostAtlasColors.textMuted,
          selectedLabelStyle: TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 1.2,
          ),
          items: [
            BottomNavigationBarItem(
              icon: Icon(Icons.auto_stories),
              label: 'STORIES',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.map),
              label: 'MAP',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.add_location),
              label: 'SUBMIT',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.person),
              label: 'PROFILE',
            ),
            if (_adminUnlocked)
              BottomNavigationBarItem(
                icon: Icon(Icons.admin_panel_settings),
                label: 'ADMIN',
              ),
          ],
        ),
      ),
    );
  }
}
```

### 4. Stories Tab

**Purpose:** Display list of ghost encounters with atmospheric styling

**UI Components:**
- App bar with "GhostAtlas" title in horror font
- Filter/sort buttons
- Scrollable list of story cards
- Pull-to-refresh functionality

**Story Card Widget:**
```dart
class StoryCard extends StatelessWidget {
  final Encounter encounter;
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(
          builder: (_) => StoryDetailScreen(encounter: encounter),
        ),
      ),
      child: Container(
        margin: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: GhostAtlasColors.cardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: GhostAtlasColors.ghostGreen.withOpacity(0.3),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: GhostAtlasColors.ghostGreenGlow,
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image with vignette overlay
            if (encounter.illustrationUrl != null)
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                    child: Image.network(
                      encounter.illustrationUrl!,
                      height: 200,
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  // Vignette overlay
                  Container(
                    height: 200,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 1.0,
                        colors: [
                          Colors.transparent,
                          Colors.black.withOpacity(0.7),
                        ],
                      ),
                    ),
                  ),
                  // Spooky ghost overlay in corner
                  Positioned(
                    top: 16,
                    right: 16,
                    child: Container(
                      padding: EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.6),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.auto_awesome,
                            color: GhostAtlasColors.ghostGreen,
                            size: 16,
                          ),
                          SizedBox(width: 4),
                          Text(
                            'AI',
                            style: TextStyle(
                              color: GhostAtlasColors.ghostGreen,
                              fontSize: 12,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title
                  Text(
                    encounter.title ?? 'Untitled Encounter',
                    style: TextStyle(
                      fontFamily: GhostAtlasTypography.horrorFont,
                      fontSize: 20,
                      color: GhostAtlasColors.ghostGreen,
                    ),
                  ),
                  
                  SizedBox(height: 8),
                  
                  // Location and date
                  Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        size: 14,
                        color: GhostAtlasColors.textTertiary,
                      ),
                      SizedBox(width: 4),
                      Text(
                        encounter.locationName,
                        style: TextStyle(
                          fontSize: 12,
                          color: GhostAtlasColors.textTertiary,
                        ),
                      ),
                      SizedBox(width: 12),
                      Icon(
                        Icons.calendar_today,
                        size: 14,
                        color: GhostAtlasColors.textTertiary,
                      ),
                      SizedBox(width: 4),
                      Text(
                        _formatDate(encounter.encounterTime),
                        style: TextStyle(
                          fontSize: 12,
                          color: GhostAtlasColors.textTertiary,
                        ),
                      ),
                    ],
                  ),
                  
                  SizedBox(height: 12),
                  
                  // Story preview with fade
                  Stack(
                    children: [
                      Text(
                        encounter.enhancedStory,
                        maxLines: 3,
                        overflow: TextOverflow.fade,
                        style: TextStyle(
                          fontSize: 14,
                          color: GhostAtlasColors.textSecondary,
                        ),
                      ),
                      Positioned(
                        bottom: 0,
                        right: 0,
                        child: Container(
                          padding: EdgeInsets.only(left: 20),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.transparent,
                                GhostAtlasColors.cardBackground,
                              ],
                            ),
                          ),
                          child: Text(
                            '...more',
                            style: TextStyle(
                              fontSize: 12,
                              color: GhostAtlasColors.ghostGreen,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                  
                  SizedBox(height: 12),
                  
                  // Rating and verification count
                  Row(
                    children: [
                      Icon(
                        Icons.star,
                        size: 16,
                        color: GhostAtlasColors.ghostGreen,
                      ),
                      SizedBox(width: 4),
                      Text(
                        '${encounter.rating}',
                        style: TextStyle(
                          fontSize: 14,
                          color: GhostAtlasColors.textSecondary,
                        ),
                      ),
                      SizedBox(width: 16),
                      Icon(
                        Icons.verified,
                        size: 16,
                        color: GhostAtlasColors.ghostGreen,
                      ),
                      SizedBox(width: 4),
                      Text(
                        '${encounter.verificationCount} verifications',
                        style: TextStyle(
                          fontSize: 14,
                          color: GhostAtlasColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### 5. Custom Widgets

**Ghost Button:**
```dart
class GhostButton extends StatelessWidget {
  final String text;
  final IconData? icon;
  final VoidCallback onPressed;
  final bool isLarge;
  
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: GhostAtlasColors.ghostGreenGlow,
            blurRadius: 20,
            spreadRadius: 2,
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          foregroundColor: GhostAtlasColors.ghostGreen,
          side: BorderSide(color: GhostAtlasColors.ghostGreen, width: 2),
          padding: EdgeInsets.symmetric(
            horizontal: isLarge ? 48 : 32,
            vertical: isLarge ? 20 : 16,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: isLarge ? 24 : 20),
              SizedBox(width: 12),
            ],
            Text(
              text,
              style: TextStyle(
                fontSize: isLarge ? 18 : 14,
                fontWeight: FontWeight.w600,
                letterSpacing: 1.5,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

**Animated Background:**
```dart
class AnimatedBackground extends StatefulWidget {
  @override
  _AnimatedBackgroundState createState() => _AnimatedBackgroundState();
}

class _AnimatedBackgroundState extends State<AnimatedBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  
  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(seconds: 10),
      vsync: this,
    )..repeat();
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
                GhostAtlasColors.ghostGreen.withOpacity(0.05),
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
```

## Data Models

No new data models required - this feature focuses on UI/UX enhancements using existing data structures.

## Error Handling

**Theme Loading:**
- If custom fonts fail to load, fall back to system fonts
- Log font loading errors for debugging

**Onboarding:**
- If SharedPreferences fails, default to showing onboarding
- Handle permission denial gracefully with explanatory messages

**Visual Effects:**
- Disable animations on low-end devices if performance issues detected
- Provide option to reduce motion in settings

## Testing Strategy

### Widget Testing

**Theme System:**
- Test color contrast ratios meet accessibility standards
- Verify theme applies correctly to all components
- Test dark mode consistency

**Onboarding:**
- Test page navigation and indicators
- Test skip functionality
- Test permission request flow
- Verify onboarding only shows once

**Bottom Navigation:**
- Test tab switching
- Test admin unlock mechanism
- Verify correct screen displays for each tab

### Visual Regression Testing

- Capture screenshots of all screens with theme applied
- Compare against design mockups
- Test on multiple device sizes

### Performance Testing

- Measure animation frame rates
- Test with 100+ story cards
- Profile memory usage with visual effects

## Design Assets

**Required Assets:**
- Onboarding illustrations (5 images)
- App icon with horror theme
- Custom fonts (Creepster or similar for titles)
- Loading spinner animation
- Ghost/paranormal icons

**Asset Specifications:**
- Images: PNG with transparency, @2x and @3x resolutions
- Fonts: TTF or OTF format
- Icons: SVG or vector format preferred
- Color space: sRGB

## Accessibility Considerations

**Color Contrast:**
- Ensure 7:1 contrast ratio for text on backgrounds
- Provide alternative indicators beyond color alone

**Typography:**
- Maintain minimum 14px font size for body text
- Use horror fonts sparingly (titles only)
- Ensure readability with sufficient line height

**Animations:**
- Respect system reduce motion settings
- Provide option to disable animations
- Ensure animations don't cause seizures (no rapid flashing)

**Touch Targets:**
- Minimum 44x44 points for all interactive elements
- Adequate spacing between buttons

## Platform-Specific Considerations

**iOS:**
- Respect safe area insets
- Use platform-appropriate navigation patterns
- Handle notch and home indicator

**Android:**
- Support system navigation gestures
- Handle different screen densities
- Respect system dark mode settings
