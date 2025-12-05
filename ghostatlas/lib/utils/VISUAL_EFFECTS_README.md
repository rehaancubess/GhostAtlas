# Visual Effects and Animations Guide

This document describes the visual effects and animations available in GhostAtlas and how to use them.

## Page Transitions

Custom page transitions provide smooth, atmospheric navigation between screens.

### Available Transitions

1. **Fade Transition** - Simple fade in/out
2. **Slide Up Transition** - Slides from bottom with fade
3. **Slide Right Transition** - Standard forward navigation
4. **Scale Transition** - Fade with scale for modal screens

### Usage

```dart
import '../utils/page_transitions.dart';

// Using extension methods (recommended)
context.pushFade(StoryDetailScreen(encounter: encounter));
context.pushSlideUp(SubmitStoryScreen());
context.pushSlideRight(ProfileTab());
context.pushScale(SettingsScreen());

// Using route builders directly
Navigator.push(
  context,
  FadePageRoute(page: StoryDetailScreen(encounter: encounter)),
);
```

## Text Field with Glow Effect

The `GhostTextField` widget provides a themed text input with animated green glow on focus.

### Usage

```dart
import '../widgets/ghost_text_field.dart';

GhostTextField(
  controller: _controller,
  labelText: 'Story Title',
  hintText: 'Enter your ghost story title...',
  prefixIcon: Icons.title,
  maxLines: 1,
  onChanged: (value) => print(value),
)
```

### Features

- Automatic green glow animation on focus
- Dark background with green border
- Support for all standard TextField properties
- Consistent with GhostAtlas theme

## Image Effects

The `ImageEffects` utility class provides vignette and gradient effects for images.

### Vignette Overlay

```dart
import '../utils/image_effects.dart';

// Simple vignette overlay
Stack(
  children: [
    Image.network(imageUrl),
    ImageEffects.vignetteOverlay(intensity: 0.7),
  ],
)

// Ghost-themed vignette with green tint
Stack(
  children: [
    Image.network(imageUrl),
    ImageEffects.ghostVignetteOverlay(
      intensity: 0.6,
      greenTint: 0.2,
    ),
  ],
)

// Convenience wrapper (recommended)
ImageEffects.withVignette(
  child: Image.network(imageUrl),
  intensity: 0.7,
  borderRadius: BorderRadius.circular(16),
  useGhostVignette: false,
)
```

### Fade Gradient

```dart
// For "read more" effects on text
Stack(
  children: [
    Text(longText, maxLines: 3),
    Positioned(
      bottom: 0,
      right: 0,
      child: ImageEffects.fadeGradientOverlay(
        backgroundColor: GhostAtlasColors.cardBackground,
        height: 60,
      ),
    ),
  ],
)
```

## Pulse Animations

Add attention-grabbing pulse animations to important buttons.

### PulsingButton

Adds scale and glow pulse animation.

```dart
import '../widgets/pulsing_button.dart';

PulsingButton(
  enabled: true,
  duration: Duration(milliseconds: 2000),
  child: GhostButton(
    text: 'IMPORTANT ACTION',
    icon: Icons.warning,
    onPressed: () {},
  ),
)
```

### GlowPulseButton

More subtle - only animates glow without scaling.

```dart
GlowPulseButton(
  enabled: true,
  minGlow: 0.3,
  maxGlow: 1.0,
  child: GhostButton(
    text: 'SUBMIT STORY',
    icon: Icons.add_location,
    onPressed: () {},
  ),
)
```

## Animated Tab Switching

The `AnimatedIndexedStack` provides smooth transitions between tabs.

### Usage

```dart
import '../widgets/animated_indexed_stack.dart';

// Simple fade transition
AnimatedIndexedStack(
  index: _currentIndex,
  duration: Duration(milliseconds: 300),
  children: [
    StoriesTab(),
    MapTab(),
    SubmitTab(),
    ProfileTab(),
  ],
)

// Slide and fade transition
SlideAnimatedIndexedStack(
  index: _currentIndex,
  duration: Duration(milliseconds: 300),
  slideHorizontally: true,
  children: [
    StoriesTab(),
    MapTab(),
    SubmitTab(),
    ProfileTab(),
  ],
)
```

## Animation Utilities

Helper functions for common animation patterns and performance optimization.

### Reduce Motion Support

```dart
import '../utils/animation_utils.dart';

// Check if animations should be reduced
if (AnimationUtils.shouldReduceMotion(context)) {
  // Show content immediately
} else {
  // Animate normally
}

// Get adaptive duration
final duration = AnimationUtils.getAdaptiveDuration(
  context,
  Duration(milliseconds: 300),
);
```

### Standard Durations

```dart
AnimationUtils.quickDuration    // 150ms - button presses
AnimationUtils.normalDuration   // 300ms - page transitions
AnimationUtils.slowDuration     // 500ms - onboarding
AnimationUtils.pulseDuration    // 2000ms - pulse animations
```

### Staggered Animations

```dart
// Create staggered intervals for list animations
final intervals = AnimationUtils.createStaggeredIntervals(
  itemCount: 5,
  staggerDelay: 0.1,
);

// Use with AnimatedBuilder
AnimatedBuilder(
  animation: _controller,
  builder: (context, child) {
    return Opacity(
      opacity: intervals[index].transform(_controller.value),
      child: child,
    );
  },
)
```

### Shake Animation

```dart
// For error states
final shakeAnimation = AnimationUtils.createShakeAnimation(_controller);

Transform.translate(
  offset: Offset(shakeAnimation.value, 0),
  child: TextField(),
)
```

## Performance Optimization

### Best Practices

1. **Use const constructors** where possible
2. **Dispose controllers** properly
3. **Respect reduce motion** settings
4. **Limit simultaneous animations** to 3-4 max
5. **Use RepaintBoundary** for complex animated widgets

### Example

```dart
class MyAnimatedWidget extends StatefulWidget {
  @override
  State<MyAnimatedWidget> createState() => _MyAnimatedWidgetState();
}

class _MyAnimatedWidgetState extends State<MyAnimatedWidget>
    with SingleTickerProviderStateMixin, ReduceMotionMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    // Use adaptive controller from mixin
    _controller = createAdaptiveController(
      duration: AnimationUtils.normalDuration,
    );
    
    if (!shouldReduceMotion) {
      _controller.repeat();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          // Your animated widget
        },
      ),
    );
  }
}
```

## Complete Example

Here's a complete example combining multiple effects:

```dart
import 'package:flutter/material.dart';
import '../widgets/ghost_button.dart';
import '../widgets/pulsing_button.dart';
import '../widgets/ghost_text_field.dart';
import '../utils/page_transitions.dart';
import '../utils/image_effects.dart';
import '../utils/animation_utils.dart';

class ExampleScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Image with vignette
            ImageEffects.withVignette(
              child: Image.network('https://example.com/image.jpg'),
              intensity: 0.7,
              borderRadius: BorderRadius.circular(16),
            ),
            
            SizedBox(height: 20),
            
            // Text field with glow
            GhostTextField(
              labelText: 'Enter text',
              prefixIcon: Icons.edit,
            ),
            
            SizedBox(height: 20),
            
            // Pulsing button
            PulsingButton(
              child: GhostButton(
                text: 'SUBMIT',
                icon: Icons.send,
                onPressed: () {
                  // Navigate with custom transition
                  context.pushFade(NextScreen());
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Accessibility

All animations respect the system's "Reduce Motion" setting. When enabled:
- Transitions become nearly instant (50ms)
- Pulse animations are disabled
- Scale animations are removed
- Only essential animations remain

This ensures the app is accessible to users with motion sensitivity.
