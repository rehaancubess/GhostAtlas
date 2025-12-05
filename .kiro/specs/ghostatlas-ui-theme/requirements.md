# Requirements Document

## Introduction

The GhostAtlas UI Theme Enhancement transforms the application into an immersive horror experience through a dark, atmospheric visual design inspired by paranormal investigation aesthetics. The system implements a cohesive spooky theme with eerie green accents on deep black backgrounds, horror-themed typography, and atmospheric visual effects. The enhancement includes cinematic onboarding screens that introduce users to the paranormal world and a bottom navigation system for seamless access to core features.

## Glossary

- **GhostAtlas Application**: The mobile application for recording and exploring paranormal encounters
- **UI Theme System**: The visual design framework defining colors, typography, spacing, and component styling
- **Onboarding Flow**: The introductory sequence of screens shown to first-time users
- **Bottom Navigation Bar**: The persistent navigation component at the screen bottom providing access to main features
- **Horror Aesthetic**: Visual design principles emphasizing darkness, mystery, and supernatural atmosphere
- **Accent Color**: The primary interactive color (eerie green) used for buttons, highlights, and active states
- **Background Color**: The deep black or near-black color forming the base of all screens
- **Typography System**: The font families, sizes, and styles used throughout the application
- **Visual Effects**: Animated or styled elements enhancing the horror atmosphere (glows, shadows, pulses)
- **Tab Navigation**: The navigation pattern using the Bottom Navigation Bar to switch between main screens
- **Onboarding Screen**: An individual screen within the Onboarding Flow presenting specific information or interaction

## Requirements

### Requirement 1

**User Story:** As a first-time user, I want to experience atmospheric onboarding screens that introduce me to GhostAtlas, so that I understand the app's purpose and feel immersed in the paranormal theme

#### Acceptance Criteria

1. WHEN a User launches THE GhostAtlas Application for the first time, THE GhostAtlas Application SHALL display the Onboarding Flow before showing main content
2. WHEN THE Onboarding Flow displays, THE GhostAtlas Application SHALL present 3 to 5 Onboarding Screens with horror-themed visuals and atmospheric text
3. WHEN a User views an Onboarding Screen, THE GhostAtlas Application SHALL display eerie illustrations, spooky typography, and thematic animations consistent with the Horror Aesthetic
4. WHEN a User completes the Onboarding Flow, THE GhostAtlas Application SHALL store completion status and never show onboarding again unless app data is cleared
5. WHEN a User navigates through Onboarding Screens, THE GhostAtlas Application SHALL provide swipe gestures or next buttons to advance between screens

### Requirement 2

**User Story:** As a user, I want a dark, horror-themed visual design throughout the app, so that the interface matches the spooky nature of ghost encounters

#### Acceptance Criteria

1. THE GhostAtlas Application SHALL apply a Background Color of pure black (#000000) or near-black (#0A0A0A) to all screens
2. THE GhostAtlas Application SHALL use an Accent Color of eerie green (#00FF41 or similar) for all interactive elements including buttons, links, and active states
3. WHEN text is displayed on dark backgrounds, THE GhostAtlas Application SHALL use light gray (#E0E0E0) or white (#FFFFFF) colors to ensure readability with contrast ratio above 7:1
4. THE GhostAtlas Application SHALL apply the Horror Aesthetic consistently across all screens including story cards, map interface, and form inputs
5. WHEN interactive elements are displayed, THE GhostAtlas Application SHALL use subtle green glows or shadows to enhance the supernatural atmosphere

### Requirement 3

**User Story:** As a user, I want horror-themed typography that feels mysterious and atmospheric, so that text elements contribute to the spooky experience

#### Acceptance Criteria

1. THE GhostAtlas Application SHALL use a horror-inspired font family for the app title and headings that evokes supernatural themes
2. THE GhostAtlas Application SHALL use a clean, readable sans-serif font for body text and UI labels to maintain usability
3. WHEN headings are displayed, THE GhostAtlas Application SHALL apply text effects such as subtle shadows or glows to enhance the Horror Aesthetic
4. THE GhostAtlas Application SHALL maintain font sizes that ensure readability on mobile devices with minimum body text size of 14 pixels
5. WHEN the app title "GhostAtlas" or "GhostLog" is displayed, THE GhostAtlas Application SHALL render it in a distinctive horror font with the Accent Color

### Requirement 4

**User Story:** As a user, I want a bottom navigation bar with four tabs, so that I can easily access stories, maps, submission, and my profile

#### Acceptance Criteria

1. THE GhostAtlas Application SHALL display a Bottom Navigation Bar persistently at the bottom of the screen across all main sections
2. THE Bottom Navigation Bar SHALL contain exactly four Tab Navigation items: Stories, Map, Submit, and Profile
3. WHEN a User taps a Tab Navigation item, THE GhostAtlas Application SHALL navigate to the corresponding screen within 200 milliseconds
4. WHEN a Tab Navigation item is active, THE GhostAtlas Application SHALL highlight it using the Accent Color and display an indicator showing the active state
5. WHEN a Tab Navigation item is inactive, THE GhostAtlas Application SHALL display it in a muted gray color (#666666) to show it is not selected

### Requirement 5

**User Story:** As a user, I want story cards with atmospheric styling, so that each ghost encounter feels like a horror movie poster

#### Acceptance Criteria

1. WHEN ghost encounters are displayed in list format, THE GhostAtlas Application SHALL render each as a story card with dark background and green accent borders
2. WHEN a story card is displayed, THE GhostAtlas Application SHALL show the encounter title in horror-themed typography with the Accent Color
3. WHEN a story card includes an image, THE GhostAtlas Application SHALL apply subtle vignette effects or dark overlays to enhance the Horror Aesthetic
4. WHEN a story card displays metadata, THE GhostAtlas Application SHALL show location and date in small, light gray text below the title
5. WHEN a User views a story card, THE GhostAtlas Application SHALL display a preview of the story text with a fade-out effect and "Read More" indicator

### Requirement 6

**User Story:** As a user, I want buttons and interactive elements styled with the horror theme, so that all interactions feel cohesive and atmospheric

#### Acceptance Criteria

1. WHEN buttons are displayed, THE GhostAtlas Application SHALL style them with the Accent Color border, transparent or dark background, and green text
2. WHEN a User taps a button, THE GhostAtlas Application SHALL provide visual feedback with a glow effect or color intensity change within 100 milliseconds
3. WHEN form inputs are displayed, THE GhostAtlas Application SHALL style them with dark backgrounds, green borders on focus, and light text color
4. WHEN the "ADD STORY" button is displayed, THE GhostAtlas Application SHALL render it as a prominent rounded button with green border and location pin icon
5. WHEN the "GHOSTBUSTER MODE" button is displayed, THE GhostAtlas Application SHALL render it with a ghost icon and green styling matching the Horror Aesthetic

### Requirement 7

**User Story:** As a user, I want the map interface styled with dark mode and green accents, so that the map feels integrated with the horror theme

#### Acceptance Criteria

1. WHEN the map is displayed, THE GhostAtlas Application SHALL apply a dark map style with muted colors and reduced brightness
2. WHEN location markers are displayed on the map, THE GhostAtlas Application SHALL render them with green glow effects or green pin colors
3. WHEN hotspots are displayed on the map, THE GhostAtlas Application SHALL animate them with pulsing green circles indicating high activity
4. WHEN the map UI controls are displayed, THE GhostAtlas Application SHALL style them with dark backgrounds and green accent colors
5. WHEN a User interacts with the map, THE GhostAtlas Application SHALL maintain the Horror Aesthetic in all overlays and bottom sheets

### Requirement 8

**User Story:** As a user, I want atmospheric visual effects throughout the app, so that the interface feels alive and supernatural

#### Acceptance Criteria

1. WHEN screens transition, THE GhostAtlas Application SHALL apply fade or slide animations with durations between 200 and 400 milliseconds
2. WHEN loading states occur, THE GhostAtlas Application SHALL display a themed loading indicator with green color and subtle animation
3. WHEN interactive elements are in focus, THE GhostAtlas Application SHALL apply subtle green glow effects using box shadows or border glows
4. WHEN story cards or images are displayed, THE GhostAtlas Application SHALL apply subtle vignette effects darkening the edges
5. WHEN the app displays success or error messages, THE GhostAtlas Application SHALL style them consistently with the Horror Aesthetic using appropriate colors

### Requirement 9

**User Story:** As a user, I want the profile tab to display my activity and settings with the horror theme, so that I can manage my account in a cohesive interface

#### Acceptance Criteria

1. WHEN a User navigates to the Profile tab, THE GhostAtlas Application SHALL display user statistics including submitted stories, verifications, and ratings
2. WHEN the Profile screen is displayed, THE GhostAtlas Application SHALL apply the Horror Aesthetic with dark background and green accents
3. WHEN user statistics are displayed, THE GhostAtlas Application SHALL present them in styled cards with green borders and atmospheric typography
4. WHEN settings options are displayed, THE GhostAtlas Application SHALL style them as list items with green accent indicators
5. WHEN a User views their submitted stories, THE GhostAtlas Application SHALL display them in the same story card format used in the Stories tab

### Requirement 10

**User Story:** As a user, I want the onboarding screens to include permission requests for location and notifications, so that I can grant necessary permissions within the atmospheric experience

#### Acceptance Criteria

1. WHEN the Onboarding Flow reaches the permissions screen, THE GhostAtlas Application SHALL request location permissions with horror-themed explanation text
2. WHEN location permissions are requested, THE GhostAtlas Application SHALL explain the need for location using atmospheric language related to finding haunted locations
3. WHEN a User grants or denies permissions, THE GhostAtlas Application SHALL proceed to the next Onboarding Screen without breaking the flow
4. WHEN permission requests are displayed, THE GhostAtlas Application SHALL style the permission dialogs consistently with the Horror Aesthetic where platform allows
5. WHEN the Onboarding Flow completes, THE GhostAtlas Application SHALL ensure all necessary permissions are requested before entering the main application
