# Requirements Document

## Introduction

GhostAtlas Web Application is a responsive web-based horror experience platform that mirrors the functionality of the GhostAtlas mobile application. It enables users to record, share, and explore real-life ghost encounters through a browser interface. The web application maintains the same dark, atmospheric visual design with eerie green accents, horror-themed typography, and immersive visual effects while adapting the UI for desktop and tablet experiences. Users can submit encounters, explore the haunted map, verify locations, and interact with the community—all without requiring authentication.

## Glossary

- **GhostAtlas Web Application**: The browser-based platform for recording and exploring paranormal encounters
- **User**: An individual who interacts with the web application through a browser (no authentication required)
- **Author Name**: A user-provided display name associated with submitted content (no account creation required)
- **Ghost Encounter**: A user-submitted paranormal experience including location, narrative, timestamp, and optional media
- **Story Enhancement Pipeline**: The AI-driven AWS backend process that transforms raw user narratives into atmospheric horror stories
- **Haunted Map**: The global interactive map displaying all approved ghost encounters as location markers
- **Hotspot**: A location on the Haunted Map with multiple ghost encounters, visually indicated by glowing and pulsing effects
- **Ghostbuster Mode**: The feature enabling users to physically visit and verify haunted locations using browser geolocation
- **Verification**: A user's physical check-in at a previously reported haunted location
- **Spookiness Score**: A numerical rating (1-5) assigned during verification to indicate the perceived supernatural intensity
- **Encounter Rating**: Community-driven rating system (1-5 stars) for evaluating ghost encounters
- **Admin Panel**: A hidden administrative interface accessible via secret URL path for reviewing and approving content
- **AWS Backend**: Cloud infrastructure services handling data storage, AI processing, and backend operations (shared with mobile app)
- **Responsive Design**: UI adaptation that provides optimal viewing experience across desktop, tablet, and mobile browsers
- **Device ID**: A browser-generated unique identifier stored in localStorage for tracking ratings and preventing duplicates
- **Navigation Bar**: The persistent horizontal navigation component providing access to main features
- **Hero Section**: The prominent landing page section introducing users to GhostAtlas

## Requirements

### Requirement 1

**User Story:** As a user, I want to access GhostAtlas through my web browser, so that I can explore ghost encounters without installing a mobile app

#### Acceptance Criteria

1. WHEN a User navigates to the GhostAtlas Web Application URL, THE GhostAtlas Web Application SHALL load and display the landing page within 3 seconds on broadband connections
2. WHEN the GhostAtlas Web Application loads, THE GhostAtlas Web Application SHALL apply responsive design that adapts to viewport widths from 320 pixels to 3840 pixels
3. WHEN a User accesses the site on desktop browsers, THE GhostAtlas Web Application SHALL display a horizontal Navigation Bar with links to Stories, Map, Submit, and Profile sections
4. WHEN a User accesses the site on mobile browsers, THE GhostAtlas Web Application SHALL display a hamburger menu that expands to show navigation options
5. THE GhostAtlas Web Application SHALL function correctly on Chrome, Firefox, Safari, and Edge browsers released within the past 2 years

### Requirement 2

**User Story:** As a user, I want to see a compelling landing page with horror aesthetics, so that I immediately understand what GhostAtlas offers and feel immersed in the theme

#### Acceptance Criteria

1. WHEN a User first visits the GhostAtlas Web Application, THE GhostAtlas Web Application SHALL display a Hero Section with the GhostAtlas logo, tagline, and call-to-action button
2. WHEN the Hero Section is displayed, THE GhostAtlas Web Application SHALL use the horror-themed design with deep black background and eerie green accents matching the mobile app
3. WHEN a User views the landing page, THE GhostAtlas Web Application SHALL display animated background effects including subtle fog, floating particles, or pulsing glows
4. WHEN a User scrolls the landing page, THE GhostAtlas Web Application SHALL reveal sections explaining key features with horror-themed illustrations
5. WHEN a User clicks the call-to-action button, THE GhostAtlas Web Application SHALL navigate to the Stories section or Map view

### Requirement 3

**User Story:** As a user, I want to submit my own ghost encounter through the web interface, so that I can share my paranormal experience from my computer

#### Acceptance Criteria

1. WHEN a User navigates to the Submit section, THE GhostAtlas Web Application SHALL display a form with fields for Author Name, location, narrative text, time of occurrence, and image uploads
2. WHEN a User provides location data, THE GhostAtlas Web Application SHALL offer both manual address entry and browser geolocation API integration with accuracy within 10 meters
3. WHEN a User uploads images, THE GhostAtlas Web Application SHALL accept JPEG, PNG, and WebP formats with file sizes up to 10 megabytes per image and maximum 5 images
4. WHEN a User submits a Ghost Encounter with all required fields, THE GhostAtlas Web Application SHALL send the data to the AWS Backend API and display a success message with atmospheric animation
5. IF a User attempts to submit with missing required fields, THEN THE GhostAtlas Web Application SHALL display validation error messages with green-bordered highlights on invalid fields

### Requirement 4

**User Story:** As a user, I want to browse ghost encounters in a stories feed, so that I can read atmospheric horror narratives from the community

#### Acceptance Criteria

1. WHEN a User navigates to the Stories section, THE GhostAtlas Web Application SHALL display approved Ghost Encounters in a card-based grid layout
2. WHEN Ghost Encounters are displayed, THE GhostAtlas Web Application SHALL show each as a story card with dark background, green accent borders, title, location, date, and preview text
3. WHEN a User clicks on a story card, THE GhostAtlas Web Application SHALL navigate to a detail view showing the full enhanced narrative, illustration, and narration playback controls
4. WHEN the Stories section loads, THE GhostAtlas Web Application SHALL fetch encounters from the AWS Backend API sorted by rating score in descending order
5. WHEN a User scrolls to the bottom of the stories list, THE GhostAtlas Web Application SHALL implement infinite scroll loading additional encounters automatically

### Requirement 5

**User Story:** As a user, I want to explore ghost encounters on an interactive map, so that I can discover haunted locations visually

#### Acceptance Criteria

1. WHEN a User navigates to the Map section, THE GhostAtlas Web Application SHALL display an interactive map using Google Maps API with dark theme styling
2. WHEN the map loads, THE GhostAtlas Web Application SHALL display all approved Ghost Encounters as custom green ghost markers on the map
3. WHEN multiple Ghost Encounters exist at the same location, THE GhostAtlas Web Application SHALL render that location as a Hotspot with animated pulsing green circles
4. WHEN a User clicks on a map marker, THE GhostAtlas Web Application SHALL display an info window with encounter preview and link to full details
5. WHEN a User interacts with the map, THE GhostAtlas Web Application SHALL support pan, zoom, and search functionality with smooth animations

### Requirement 6

**User Story:** As a user, I want to verify haunted locations using my browser's geolocation, so that I can contribute to community-driven paranormal investigation from my device

#### Acceptance Criteria

1. WHEN a User views an encounter detail page, THE GhostAtlas Web Application SHALL display a "Verify Location" button if browser geolocation is available
2. WHEN a User clicks "Verify Location", THE GhostAtlas Web Application SHALL request browser geolocation permission and calculate distance to the encounter location
3. IF the User is within 50 meters of the encounter location, THEN THE GhostAtlas Web Application SHALL display a verification form requesting Spookiness Score (1-5) and optional notes
4. WHEN a User submits a Verification, THE GhostAtlas Web Application SHALL send the data to the AWS Backend API and display success confirmation
5. IF the User is more than 50 meters away, THEN THE GhostAtlas Web Application SHALL display an error message indicating they must be at the location to verify

### Requirement 7

**User Story:** As a user, I want to rate ghost encounters, so that the most credible and unsettling stories rise to the top

#### Acceptance Criteria

1. WHEN a User views an encounter detail page, THE GhostAtlas Web Application SHALL display a 5-star rating interface allowing the User to select a rating
2. WHEN a User submits a rating, THE GhostAtlas Web Application SHALL generate or retrieve a Device ID from browser localStorage and send it with the rating to the AWS Backend API
3. WHEN a rating is successfully submitted, THE GhostAtlas Web Application SHALL update the displayed average rating and rating count within 2 seconds
4. IF a User has already rated an encounter, THEN THE GhostAtlas Web Application SHALL display their previous rating and prevent duplicate ratings
5. WHEN rating submission fails, THE GhostAtlas Web Application SHALL display an error message and allow the User to retry

### Requirement 8

**User Story:** As a user, I want to search and filter ghost encounters, so that I can find stories relevant to my interests

#### Acceptance Criteria

1. WHEN a User accesses the Stories or Map sections, THE GhostAtlas Web Application SHALL display search and filter controls in a sidebar or top bar
2. WHEN a User enters a location in the search field, THE GhostAtlas Web Application SHALL query the AWS Backend API for encounters near that location
3. WHEN a User applies a distance filter, THE GhostAtlas Web Application SHALL display only encounters within the specified radius from the search location
4. WHEN a User sorts by rating or date, THE GhostAtlas Web Application SHALL reorder the displayed encounters accordingly
5. WHEN filters are applied, THE GhostAtlas Web Application SHALL update both the stories list and map markers to reflect the filtered results

### Requirement 9

**User Story:** As a user, I want to view my profile and activity, so that I can track my submissions and verifications

#### Acceptance Criteria

1. WHEN a User navigates to the Profile section, THE GhostAtlas Web Application SHALL display statistics including submitted stories count, verifications count, and total ratings given
2. WHEN the Profile section loads, THE GhostAtlas Web Application SHALL retrieve the Device ID from localStorage and query the AWS Backend for associated activity
3. WHEN a User views their submitted stories, THE GhostAtlas Web Application SHALL display them in the same story card format with status indicators (pending, approved, rejected)
4. WHEN a User views their verifications, THE GhostAtlas Web Application SHALL display a list with location names, dates, and Spookiness Scores
5. WHEN the Profile section is displayed, THE GhostAtlas Web Application SHALL apply the horror aesthetic with dark background and green accents

### Requirement 10

**User Story:** As an admin, I want to access a hidden admin panel through a secret URL, so that I can review and approve submitted encounters

#### Acceptance Criteria

1. WHEN a User navigates to the path "/admin/panel", THE GhostAtlas Web Application SHALL display the Admin Panel interface
2. WHEN the Admin Panel loads, THE GhostAtlas Web Application SHALL fetch pending encounters from the AWS Backend API admin endpoint
3. WHEN an admin views a pending encounter, THE GhostAtlas Web Application SHALL display the full submission with approve and reject buttons
4. WHEN an admin clicks approve, THE GhostAtlas Web Application SHALL send an approval request to the AWS Backend API and remove the encounter from the pending list
5. WHEN an admin clicks reject, THE GhostAtlas Web Application SHALL send a rejection request to the AWS Backend API and remove the encounter from the pending list

### Requirement 11

**User Story:** As a user, I want to play AI-generated narration audio, so that I can listen to ghost stories with atmospheric voice-over

#### Acceptance Criteria

1. WHEN a User views an encounter detail page with narration available, THE GhostAtlas Web Application SHALL display an audio player with play, pause, and volume controls
2. WHEN a User clicks play, THE GhostAtlas Web Application SHALL stream the narration audio file from AWS S3 through the browser's audio API
3. WHEN narration is playing, THE GhostAtlas Web Application SHALL display a visual indicator showing playback progress
4. WHEN a User adjusts volume, THE GhostAtlas Web Application SHALL persist the volume preference in localStorage for future sessions
5. WHEN narration playback completes, THE GhostAtlas Web Application SHALL display a replay button and reset the progress indicator

### Requirement 12

**User Story:** As a user, I want the web application to maintain the same horror aesthetic as the mobile app, so that the experience feels cohesive across platforms

#### Acceptance Criteria

1. THE GhostAtlas Web Application SHALL use a Background Color of pure black (#000000) or near-black (#0A0A0A) for all pages
2. THE GhostAtlas Web Application SHALL use an Accent Color of eerie green (#00FF41) for all interactive elements including buttons, links, and active states
3. WHEN text is displayed, THE GhostAtlas Web Application SHALL use light gray (#E0E0E0) or white (#FFFFFF) colors ensuring contrast ratio above 7:1
4. THE GhostAtlas Web Application SHALL use horror-themed typography with the Creepster font for headings and a clean sans-serif for body text
5. WHEN interactive elements are displayed, THE GhostAtlas Web Application SHALL apply subtle green glows using CSS box-shadow effects

### Requirement 13

**User Story:** As a user, I want smooth animations and transitions, so that the web application feels polished and atmospheric

#### Acceptance Criteria

1. WHEN a User navigates between sections, THE GhostAtlas Web Application SHALL apply fade or slide transitions with durations between 200 and 400 milliseconds
2. WHEN story cards are hovered, THE GhostAtlas Web Application SHALL apply a subtle scale transform and green glow effect
3. WHEN buttons are clicked, THE GhostAtlas Web Application SHALL provide visual feedback with a ripple effect or color intensity change within 100 milliseconds
4. WHEN the map loads, THE GhostAtlas Web Application SHALL animate markers appearing with a fade-in and drop effect
5. WHEN loading states occur, THE GhostAtlas Web Application SHALL display a themed loading indicator with green pulsing animation

### Requirement 14

**User Story:** As a user, I want the web application to handle errors gracefully, so that I understand what went wrong and can take corrective action

#### Acceptance Criteria

1. WHEN an AWS Backend API request fails, THE GhostAtlas Web Application SHALL display a user-friendly error message styled with the horror theme
2. WHEN a network error occurs, THE GhostAtlas Web Application SHALL display a retry button allowing the User to attempt the operation again
3. WHEN image uploads fail, THE GhostAtlas Web Application SHALL indicate which images failed and allow re-upload without losing form data
4. WHEN browser geolocation is denied, THE GhostAtlas Web Application SHALL display a message explaining that location features require permission
5. WHEN the AWS Backend returns validation errors, THE GhostAtlas Web Application SHALL highlight the specific form fields with error messages

### Requirement 15

**User Story:** As a developer, I want the web application to integrate with the existing AWS Backend, so that data is shared seamlessly with the mobile app

#### Acceptance Criteria

1. WHEN the GhostAtlas Web Application makes API requests, THE GhostAtlas Web Application SHALL use the same AWS Backend API endpoints as the mobile application
2. WHEN encounters are submitted, THE GhostAtlas Web Application SHALL follow the same submission flow including presigned S3 URLs for image uploads
3. WHEN the GhostAtlas Web Application queries encounters, THE GhostAtlas Web Application SHALL receive the same data format including enhanced stories, illustrations, and narration URLs
4. WHEN API requests fail, THE GhostAtlas Web Application SHALL implement exponential backoff retry logic with maximum 3 attempts
5. THE GhostAtlas Web Application SHALL handle CORS headers correctly for all cross-origin requests to the AWS Backend

### Requirement 16

**User Story:** As a user, I want the web application to be performant, so that interactions feel responsive and smooth

#### Acceptance Criteria

1. WHEN the GhostAtlas Web Application loads, THE GhostAtlas Web Application SHALL achieve a Lighthouse performance score above 80 on desktop
2. WHEN images are displayed, THE GhostAtlas Web Application SHALL implement lazy loading for images below the fold
3. WHEN the map is displayed, THE GhostAtlas Web Application SHALL cluster markers when more than 50 encounters are visible in the viewport
4. WHEN API responses are received, THE GhostAtlas Web Application SHALL cache encounter data in memory for 5 minutes to reduce redundant requests
5. WHEN the User scrolls, THE GhostAtlas Web Application SHALL debounce scroll events to prevent performance degradation

### Requirement 17

**User Story:** As a user, I want the web application to be accessible, so that users with disabilities can interact with the content

#### Acceptance Criteria

1. THE GhostAtlas Web Application SHALL provide keyboard navigation for all interactive elements with visible focus indicators
2. THE GhostAtlas Web Application SHALL include ARIA labels and roles for screen reader compatibility
3. WHEN images are displayed, THE GhostAtlas Web Application SHALL provide descriptive alt text for all content images
4. THE GhostAtlas Web Application SHALL maintain color contrast ratios meeting WCAG 2.1 AA standards (minimum 4.5:1 for normal text)
5. WHEN forms are displayed, THE GhostAtlas Web Application SHALL associate labels with inputs and provide clear error messages

### Requirement 18

**User Story:** As a user, I want to share ghost encounters on social media, so that I can spread interesting stories with my network

#### Acceptance Criteria

1. WHEN a User views an encounter detail page, THE GhostAtlas Web Application SHALL display social sharing buttons for Twitter, Facebook, and Reddit
2. WHEN a User clicks a share button, THE GhostAtlas Web Application SHALL open a share dialog with pre-populated text including encounter title and URL
3. WHEN an encounter URL is shared, THE GhostAtlas Web Application SHALL provide Open Graph meta tags for rich social media previews
4. WHEN a shared link is clicked, THE GhostAtlas Web Application SHALL navigate directly to the encounter detail page
5. THE GhostAtlas Web Application SHALL generate shareable URLs in the format "/encounter/{id}" for clean, readable links
