# Implementation Plan

- [x] 1. Set up Flutter project structure and dependencies
  - Add required packages to pubspec.yaml: google_maps_flutter, geolocator, http, image_picker, audioplayers
  - Create folder structure: lib/models, lib/screens, lib/services, lib/widgets
  - Configure Android and iOS permissions for location and camera access
  - _Requirements: 1.1, 1.2, 3.1, 4.1, 6.1_

- [ ] 2. Implement core data models
  - Create Encounter model with fromJson/toJson methods
  - Create Verification model with fromJson/toJson methods
  - Create EncounterSubmission model for form data
  - Add LatLng helper methods for distance calculations
  - _Requirements: 1.3, 4.3, 4.5_

- [x] 3. Build API service layer
  - Create ApiService class with base URL configuration
  - Implement getEncounters() method with status filtering
  - Implement getEncounterById() method
  - Implement submitEncounter() method with multipart form data for images
  - Implement rateEncounter() method
  - Implement verifyEncounter() method
  - Implement admin methods: getPendingEncounters(), approveEncounter(), rejectEncounter()
  - Add error handling and retry logic for network failures
  - _Requirements: 1.3, 2.1, 3.1, 4.3, 5.2, 7.4, 8.1, 8.3_

- [x] 4. Create Submit Story screen
  - Build StatefulWidget with form fields for author name, story text, and time picker
  - Implement location picker with map widget and current location button
  - Add image picker functionality with multiple image selection
  - Implement form validation for required fields
  - Add submit button with loading state
  - Handle submission success/error with user feedback
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 5. Build Haunted Map screen
  - Create StatefulWidget with Google Maps widget
  - Implement encounter loading from API on screen init
  - Add custom map markers for single encounters
  - Implement hotspot detection logic (group encounters within 50m)
  - Create animated pulsing markers for hotspots
  - Add bottom sheet for encounter preview on marker tap
  - Implement location search functionality
  - Add user location tracking and display
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 6.1, 6.2, 6.4_

- [x] 6. Implement Story Detail screen
  - Create StatefulWidget accepting Encounter parameter
  - Display AI-generated illustration as hero image
  - Show author name, timestamp, and enhanced story text
  - Add audio player controls for narration playback
  - Implement rating buttons (upvote/downvote) with API integration
  - Display verification count and average spookiness score
  - Add "Verify This Location" button with proximity check
  - _Requirements: 2.3, 2.4, 5.1, 5.2, 5.4_

- [x] 7. Build Ghostbuster Mode verification flow
  - Create verification widget/screen with spookiness slider (0-10)
  - Add optional notes text field
  - Implement proximity detection (within 50m of encounter location)
  - Add time-match detection logic (within 2 hours of original time)
  - Display time-match indicator when applicable
  - Implement verification submission with API integration
  - Show success confirmation after submission
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 8. Create Admin Panel with easter egg unlock
  - Add tap counter to map screen logo (11 taps to unlock)
  - Create hidden admin tab in bottom navigation
  - Build AdminPanelScreen StatefulWidget
  - Display list of pending encounters with preview cards
  - Add approve/reject buttons for each encounter
  - Implement approve/reject API calls with list refresh
  - Add loading states and error handling
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Implement main app navigation and routing
  - Create main.dart with MaterialApp configuration
  - Set up bottom navigation bar with Map and Submit tabs
  - Implement navigation to Story Detail screen
  - Add conditional Admin tab when unlocked
  - Configure route transitions and back navigation
  - _Requirements: 3.1, 3.3_

- [x] 10. Add location services and permissions
  - Implement location permission request flow
  - Add GPS availability checks
  - Create location service wrapper for getting current position
  - Implement continuous location tracking for proximity detection
  - Handle location errors gracefully with user-friendly messages
  - _Requirements: 1.2, 4.1, 6.1, 6.5_

- [x] 11. Implement image handling and upload
  - Add image compression before upload
  - Implement multipart form data encoding for API submission
  - Add image preview in submit form
  - Handle image upload errors with retry logic
  - Display uploaded images in Story Detail screen
  - _Requirements: 1.5, 8.4_

- [x] 12. Build rating and sorting system
  - Implement rating submission with duplicate prevention (device-based)
  - Add visual feedback for user's rating state
  - Implement encounter sorting by rating score
  - Add filter options for distance and rating
  - Update UI when ratings change
  - _Requirements: 5.1, 5.2, 5.3, 5.5_

- [x] 13. Add audio narration playback
  - Implement audio player with play/pause controls
  - Add loading state while audio buffers
  - Display playback progress indicator
  - Handle audio playback errors
  - Ensure audio stops when navigating away
  - _Requirements: 2.4_

- [x] 14. Implement nearby encounters and search
  - Add proximity-based encounter filtering
  - Display distance from user to each encounter
  - Implement location search with autocomplete
  - Add radius filter slider
  - Update map view when filters change
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 15. Polish UI and add loading states
  - Add loading spinners for all async operations
  - Implement pull-to-refresh on map and admin screens
  - Add empty states for no encounters found
  - Create consistent error message styling
  - Add success animations for submissions
  - Implement smooth transitions between screens
  - _Requirements: 1.4, 5.2, 7.4, 8.5_

- [ ] 16. Configure AWS backend infrastructure
  - Set up DynamoDB tables: Encounters, Verifications, Ratings
  - Create S3 buckets: ghostatlas-user-images, ghostatlas-generated-media
  - Configure API Gateway with REST endpoints
  - Implement Lambda function: SubmitEncounterFunction
  - Implement Lambda function: GetEncountersFunction
  - Implement Lambda function: VerifyEncounterFunction
  - Implement Lambda function: ApproveEncounterFunction
  - Implement Lambda function: EnhanceStoryFunction (with Bedrock and Polly integration)
  - Set up CloudFront CDN for media delivery
  - Configure IAM roles and permissions
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 17. Integrate AI story enhancement pipeline
  - Configure Bedrock API for text enhancement
  - Implement prompt engineering for horror story transformation
  - Configure Bedrock for image generation (illustration)
  - Integrate Polly for text-to-speech narration
  - Add error handling and fallback for AI service failures
  - Test enhancement quality and adjust prompts
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 8.2_

- [ ] 18. Implement hotspot visualization and clustering
  - Create custom marker widget with pulse animation
  - Implement encounter grouping algorithm (50m radius)
  - Scale pulse intensity based on encounter count
  - Add marker clustering for zoomed-out views
  - Optimize marker rendering performance
  - _Requirements: 3.2, 3.5_

- [ ]* 19. Add comprehensive error handling
  - Implement network error retry mechanisms
  - Add timeout handling for API calls
  - Create user-friendly error messages for all failure scenarios
  - Add logging for debugging
  - Test offline behavior and graceful degradation
  - _Requirements: 8.5_

- [ ]* 20. Performance optimization
  - Implement image caching for illustrations
  - Add pagination for encounter lists
  - Optimize map marker loading with viewport-based queries
  - Compress images before upload
  - Test app performance with 100+ encounters on map
  - Profile and optimize any performance bottlenecks
  - _Requirements: 3.1, 8.3_
