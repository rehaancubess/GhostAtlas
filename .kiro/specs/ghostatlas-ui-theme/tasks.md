# Implementation Plan

- [x] 1. Set up theme system and color palette
  - Create lib/theme/ghost_atlas_colors.dart with all color constants
  - Create lib/theme/ghost_atlas_typography.dart with text styles
  - Create lib/theme/ghost_atlas_theme.dart with ThemeData configuration
  - Add google_fonts package to pubspec.yaml for horror typography
  - Configure Creepster or similar horror font for titles
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 2. Implement custom button components
  - Create lib/widgets/ghost_button.dart with green border and glow effects
  - Add press animation and visual feedback
  - Support icon + text layout
  - Add size variants (normal and large)
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [x] 3. Create story card widget with atmospheric styling
  - Create lib/widgets/story_card.dart with dark background and green borders
  - Implement image display with vignette overlay effect
  - Add title in horror font with green color
  - Display location and date metadata in gray text
  - Add story preview with fade-out effect and "...more" indicator
  - Show rating and verification count with icons
  - Add AI badge overlay for generated illustrations
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 4. Build onboarding flow structure
  - Create lib/screens/onboarding_flow.dart with PageView
  - Add shared_preferences package to pubspec.yaml
  - Implement onboarding completion state persistence
  - Create OnboardingPage data model with title, description, image, animation type
  - Build page indicator dots with active state highlighting
  - Add skip button in top-right corner
  - Implement navigation to main app after completion
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 5. Design and implement onboarding screens
  - Create 5 onboarding page configurations with horror-themed content
  - Screen 1: Welcome to GhostAtlas with fade-in animation
  - Screen 2: Share Your Encounters with slide-up animation
  - Screen 3: Explore Haunted Locations with pulse animation
  - Screen 4: Become a Ghostbuster with glow animation
  - Screen 5: Grant Permissions with location request
  - Add onboarding illustration assets to assets/onboarding/
  - _Requirements: 1.1, 1.2, 1.3, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 6. Create animated background widget
  - Create lib/widgets/animated_background.dart with subtle fog/glow effect
  - Implement slow radial gradient animation using AnimationController
  - Use green glow with low opacity for atmospheric effect
  - Optimize performance for continuous animation
  - _Requirements: 8.1, 8.3_

- [x] 7. Build onboarding page widget
  - Create lib/widgets/onboarding_page_widget.dart
  - Implement animated illustration component with multiple animation types
  - Add title display with horror typography and green glow
  - Add description text with readable body font
  - Implement permission request button for final screen
  - Handle location permission request flow
  - _Requirements: 1.3, 1.5, 10.1, 10.2, 10.3_

- [x] 8. Implement main app shell with bottom navigation
  - Create lib/screens/main_app_shell.dart with bottom navigation bar
  - Add 4 navigation items: Stories, Map, Submit, Profile
  - Implement IndexedStack for tab content
  - Style bottom nav with dark background and green accents
  - Add green glow shadow effect to bottom nav bar
  - Highlight active tab with green color
  - Show inactive tabs in muted gray
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 9. Create Stories tab screen
  - Create lib/screens/stories_tab.dart with scrollable list
  - Add app bar with "GhostAtlas" title in horror font
  - Implement pull-to-refresh functionality
  - Display story cards in vertical list
  - Add filter/sort buttons in app bar
  - Implement empty state with atmospheric message
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Update Map tab with dark theme styling
  - Update existing haunted_map_screen.dart with dark map style
  - Apply dark Google Maps theme JSON
  - Style map markers with green glow effects
  - Update hotspot markers with green pulsing animation
  - Style map controls with dark backgrounds and green accents
  - Update bottom sheet with themed styling
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Update Submit tab with themed styling
  - Update existing submit_story_screen.dart with theme
  - Apply dark backgrounds to all form fields
  - Style text inputs with green focus borders
  - Update "ADD STORY" button to use GhostButton widget
  - Add location pin icon to submit button
  - Style image picker with themed containers
  - Apply horror font to screen title
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 12. Create Profile tab screen
  - Create lib/screens/profile_tab.dart
  - Display user statistics in themed cards (stories submitted, verifications, ratings)
  - Style stat cards with dark background and green borders
  - Add settings list with green accent indicators
  - Display user's submitted stories using story card widget
  - Add horror-themed empty state for new users
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [x] 13. Update Story Detail screen with theme
  - Update existing story_detail_screen.dart with themed styling
  - Apply vignette effect to hero image
  - Style title with horror font and green color
  - Update audio player controls with green accents
  - Style rating buttons with green highlights
  - Update "Verify This Location" button to use GhostButton
  - Add green glow effects to interactive elements
  - _Requirements: 6.1, 6.2, 8.3_

- [x] 14. Update Ghostbuster Mode with theme
  - Update existing ghostbuster_mode_screen.dart with themed styling
  - Style spookiness slider with green accent color
  - Update banner notification with dark background and green border
  - Style check-in button using GhostButton widget
  - Add ghost icon to Ghostbuster Mode button
  - Apply horror aesthetic to time-match indicator
  - _Requirements: 6.5, 8.3_

- [x] 15. Implement loading and success states
  - Create lib/widgets/ghost_loading_indicator.dart with green animated spinner
  - Create lib/widgets/ghost_success_animation.dart with green checkmark animation
  - Update all screens to use themed loading indicators
  - Add success animations for form submissions
  - Style error messages with red color and dark background
  - _Requirements: 8.2, 8.5_

- [x] 16. Add visual effects and animations
  - Implement screen transition animations (fade, slide)
  - Add green glow effects to focused input fields
  - Implement vignette effect utility for images
  - Add subtle pulse animation to important buttons
  - Create smooth tab switching animations
  - Optimize animation performance
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 17. Update app initialization flow
  - Update main.dart to check onboarding completion status
  - Show OnboardingFlow for first-time users
  - Show MainAppShell for returning users
  - Apply ghostAtlasTheme to MaterialApp
  - Configure app-wide theme settings
  - _Requirements: 1.1, 1.4_

- [x] 18. Add app assets and fonts
  - Add Creepster font files to assets/fonts/
  - Create onboarding illustration assets (5 images)
  - Update pubspec.yaml with font and asset declarations
  - Add app icon with horror theme
  - Create ghost/paranormal icon assets
  - _Requirements: 3.1, 3.5_

- [ ]* 19. Implement accessibility features
  - Add semantic labels to all interactive elements
  - Ensure color contrast ratios meet WCAG AA standards
  - Implement reduce motion support for animations
  - Add minimum touch target sizes (44x44 points)
  - Test with screen readers
  - _Requirements: 2.3, 3.4_

- [ ]* 20. Test and polish UI
  - Test onboarding flow on fresh install
  - Verify theme consistency across all screens
  - Test bottom navigation on different screen sizes
  - Verify animations perform smoothly
  - Test dark theme in various lighting conditions
  - Fix any visual inconsistencies
  - _Requirements: 2.4, 4.3, 8.1_
