# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Initialize Vite + React + TypeScript project
  - Configure Tailwind CSS with custom horror theme tokens
  - Set up ESLint, Prettier, and TypeScript strict mode
  - Install core dependencies (React Router, React Query, Zustand, Framer Motion)
  - Create folder structure (components, pages, hooks, services, stores, types, utils, styles)
  - Configure environment variables for API base URL and Google Maps API key
  - Set up Vitest for unit testing
  - _Requirements: 1.1, 1.5, 15.1_

- [x] 2. Implement theme system and design tokens
  - Create Tailwind config with horror theme colors (#000000 background, #00FF41 accent)
  - Add Creepster font for headings and configure font loading
  - Create CSS custom properties for colors, spacing, shadows, and animations
  - Implement global styles for body, scrollbar, and selection
  - Create utility classes for green glow effects and vignettes
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 3. Build common UI components
- [x] 3.1 Create Button component with variants (primary, secondary, ghost, danger)
  - Implement hover effects with green glow
  - Add loading state with spinner
  - Support different sizes (small, medium, large)
  - _Requirements: 12.2, 13.3_

- [x] 3.2 Create LoadingIndicator component
  - Implement pulsing green ghost animation
  - Support fullscreen and inline variants
  - Add atmospheric loading messages
  - _Requirements: 13.5_

- [x] 3.3 Create Modal component
  - Implement overlay with backdrop blur
  - Add animated entrance/exit with Framer Motion
  - Support keyboard navigation (ESC to close)
  - Implement focus trap for accessibility
  - _Requirements: 13.1, 17.1_

- [x] 3.4 Create ErrorBoundary component
  - Catch React errors and display horror-themed error page
  - Provide "Return Home" and "Retry" buttons
  - Log errors to console
  - _Requirements: 14.1, 14.2_

- [x] 3.5 Create RatingStars component
  - Implement interactive 5-star rating with hover preview
  - Support read-only mode for display
  - Style with green stars matching theme
  - _Requirements: 7.1_

- [ ]* 3.6 Write unit tests for common components
  - Test Button renders with correct variants and handles clicks
  - Test Modal opens/closes and traps focus
  - Test RatingStars handles selection and displays correctly
  - _Requirements: 3.1, 7.1, 13.3_

- [x] 4. Implement API service layer
- [x] 4.1 Create API client with Axios
  - Configure base URL from environment variables
  - Add request interceptor for headers and logging
  - Add response interceptor for error handling and data transformation
  - Implement exponential backoff retry logic for 500/503 errors
  - _Requirements: 15.1, 15.4_

- [x] 4.2 Create TypeScript interfaces for API data models
  - Define Encounter, Location, Verification interfaces
  - Define request/response types for all endpoints
  - Define UserProfile interface
  - _Requirements: 15.3_

- [x] 4.3 Implement React Query hooks for encounter endpoints
  - useEncounters for GET /api/encounters with geospatial params
  - useEncounter for GET /api/encounters/:id
  - useSubmitEncounter for POST /api/encounters
  - useTriggerEnhancement for PUT /api/encounters/:id/upload-complete
  - useRateEncounter for POST /api/encounters/:id/rate
  - useVerifyLocation for POST /api/encounters/:id/verify
  - Configure caching strategy (5min stale time for lists, 10min for details)
  - _Requirements: 3.4, 4.4, 7.2, 7.3, 15.1, 15.3_

- [x] 4.4 Implement React Query hooks for admin endpoints
  - usePendingEncounters for GET /admin/encounters
  - useApproveEncounter for PUT /admin/encounters/:id/approve
  - useRejectEncounter for PUT /admin/encounters/:id/reject
  - Configure shorter cache time (1min stale) for admin data
  - _Requirements: 10.2, 10.4, 10.5_

- [ ]* 4.5 Write unit tests for API service
  - Test API client handles errors correctly
  - Test retry logic with exponential backoff
  - Test React Query hooks with mock responses using MSW
  - _Requirements: 15.4_

- [x] 5. Implement state management with Zustand
  - Create device ID store with localStorage persistence
  - Create location store for user's current location
  - Create theme preferences store (audio volume)
  - Implement device ID generation on first visit
  - _Requirements: 7.2, 11.4_

- [x] 6. Build layout components
- [x] 6.1 Create NavigationBar component
  - Implement horizontal nav for desktop with logo and links (Stories, Map, Submit, Profile)
  - Implement hamburger menu for mobile viewports
  - Add sticky positioning with backdrop blur
  - Highlight active route with green accent
  - Add logo tap counter for admin panel unlock (7 taps)
  - _Requirements: 1.3, 1.4, 10.1_

- [x] 6.2 Create Footer component
  - Add links to Terms of Use, Privacy Policy, social media
  - Display copyright information
  - Style with horror theme
  - _Requirements: 12.4_

- [x] 6.3 Create PageLayout component
  - Implement wrapper with consistent page structure
  - Add animated background effects (fog particles with CSS/SVG)
  - Apply responsive padding and max-width constraints
  - _Requirements: 2.3, 13.1_

- [ ]* 6.4 Write unit tests for layout components
  - Test NavigationBar renders correct links and handles mobile menu
  - Test admin unlock after 7 logo taps
  - Test PageLayout applies correct structure
  - _Requirements: 1.3, 1.4, 10.1_

- [x] 7. Build landing page
- [x] 7.1 Create Hero section component
  - Display GhostAtlas logo with Creepster font
  - Add tagline and call-to-action button
  - Implement animated background with fog/particles
  - Style with horror theme (black background, green accents)
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 7.2 Create feature showcase sections
  - Display key features with horror-themed illustrations
  - Implement scroll-triggered animations
  - Add "Explore Stories" and "View Map" CTAs
  - _Requirements: 2.4, 2.5_

- [x] 7.3 Implement landing page routing
  - Set up React Router with landing page as home route
  - Handle CTA button clicks to navigate to Stories or Map
  - _Requirements: 2.5_

- [x] 8. Build story browsing features
- [x] 8.1 Create StoryCard component
  - Display encounter preview with title, location, date, rating
  - Implement hover effects (scale transform, green glow)
  - Add lazy-loaded thumbnail with vignette effect
  - Handle click to navigate to detail view
  - _Requirements: 4.1, 4.2, 4.3, 13.2_

- [x] 8.2 Create StoryGrid component
  - Implement responsive grid layout (1-3 columns based on viewport)
  - Add infinite scroll with Intersection Observer
  - Display loading skeletons during fetch
  - Show empty state with atmospheric messaging
  - _Requirements: 4.1, 4.5_

- [x] 8.3 Create StoriesPage component
  - Fetch encounters using useEncounters hook
  - Implement sort by rating (descending order)
  - Display stories in StoryGrid
  - Add search and filter controls in sidebar
  - _Requirements: 4.4, 8.1, 8.2, 8.4_

- [ ]* 8.4 Write property test for encounter sorting
  - **Property 4: Encounter sorting consistency**
  - **Validates: Requirements 4.4**
  - Generate random encounter lists and verify descending rating order
  - _Requirements: 4.4_

- [ ]* 8.5 Write unit tests for story components
  - Test StoryCard renders correctly and handles clicks
  - Test StoryGrid displays correct number of columns at different viewports
  - Test infinite scroll loads more encounters
  - _Requirements: 4.1, 4.5_

- [x] 9. Build story detail page
- [x] 9.1 Create StoryDetail component
  - Display full enhanced narrative with horror typography
  - Show AI-generated illustration with vignette effect
  - Display encounter metadata (author, location, date, rating)
  - Add social sharing buttons (Twitter, Facebook, Reddit)
  - _Requirements: 4.3, 18.1, 18.2_

- [x] 9.2 Create AudioPlayer component
  - Implement custom controls (play, pause, seek, volume)
  - Display progress bar with green accent
  - Stream narration audio from S3 URL
  - Persist volume preference in localStorage
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [x] 9.3 Integrate rating functionality
  - Display RatingStars component
  - Handle rating submission with useRateEncounter hook
  - Update displayed rating after submission
  - Prevent duplicate ratings using device ID
  - Show user's previous rating if exists
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 9.4 Add verification button
  - Display "Verify Location" button if geolocation available
  - Handle click to check distance and show verification form
  - _Requirements: 6.1, 6.2_

- [ ]* 9.5 Write property test for duplicate rating prevention
  - **Property 8: Duplicate rating prevention**
  - **Validates: Requirements 7.4**
  - Test that rating with same device ID twice is prevented
  - _Requirements: 7.4_

- [ ]* 9.6 Write unit tests for story detail components
  - Test StoryDetail renders all sections correctly
  - Test AudioPlayer controls work and persist volume
  - Test rating submission updates UI
  - _Requirements: 4.3, 7.1, 11.1_

- [x] 10. Build map interface
- [x] 10.1 Create HauntedMap component
  - Integrate Google Maps with @react-google-maps/api
  - Apply dark theme styling to map
  - Fetch encounters and display as markers
  - Implement marker clustering for performance (>50 markers)
  - Add search box for location queries
  - _Requirements: 5.1, 5.4, 5.5, 16.3_

- [x] 10.2 Create custom MapMarker component
  - Design custom SVG ghost icon with green glow
  - Implement pulsing animation for hotspots (multiple encounters)
  - Handle click to open info window
  - _Requirements: 5.2, 5.3_

- [x] 10.3 Create MapInfoWindow component
  - Display encounter preview in popup
  - Add link to full detail view
  - Style with horror theme
  - _Requirements: 5.3_

- [ ]* 10.4 Write property test for map marker completeness
  - **Property 5: Map marker completeness**
  - **Validates: Requirements 5.2**
  - Generate random encounter sets and verify marker count matches
  - _Requirements: 5.2_

- [ ]* 10.5 Write unit tests for map components
  - Test HauntedMap renders with correct theme
  - Test MapMarker displays and handles clicks
  - Test MapInfoWindow shows correct data
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 11. Build encounter submission form
- [x] 11.1 Create SubmitForm component
  - Implement multi-step form with validation
  - Add fields for author name, location, story, time, images
  - Display progress indicator
  - Show success animation on completion
  - _Requirements: 3.1, 3.4, 3.5_

- [x] 11.2 Create LocationPicker component
  - Implement address search with Google Places Autocomplete
  - Add manual coordinate entry fields
  - Add browser geolocation button
  - Display map preview of selected location
  - _Requirements: 3.2_

- [x] 11.3 Create ImageUploader component
  - Implement drag-and-drop zone with React Dropzone
  - Display image preview thumbnails
  - Add remove and reorder functionality
  - Validate file size (max 10MB) and format (JPEG, PNG, WebP)
  - Show upload progress indicators
  - _Requirements: 3.3, 14.3_

- [x] 11.4 Implement submission flow
  - Submit encounter data to API
  - Upload images to presigned S3 URLs
  - Call trigger enhancement endpoint
  - Display success message and navigate to pending status page
  - _Requirements: 3.4, 15.2_

- [ ]* 11.5 Write property test for image upload validation
  - **Property 2: Image upload validation**
  - **Validates: Requirements 3.3**
  - Generate random file specs and verify validation logic
  - _Requirements: 3.3_

- [ ]* 11.6 Write property test for form validation
  - **Property 3: Form validation completeness**
  - **Validates: Requirements 3.5**
  - Generate random incomplete form data and verify all errors shown
  - _Requirements: 3.5_

- [ ]* 11.7 Write unit tests for submission components
  - Test SubmitForm validates required fields
  - Test LocationPicker handles address search and geolocation
  - Test ImageUploader validates files and shows previews
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [x] 12. Build verification feature
- [x] 12.1 Create VerificationForm component
  - Display form requesting spookiness score (1-5) and optional notes
  - Implement slider for spookiness score with green styling
  - Add submit button with loading state
  - _Requirements: 6.2, 6.3_

- [x] 12.2 Implement distance checking logic
  - Request browser geolocation permission
  - Calculate distance between user and encounter location
  - Enable verification form only if within 50 meters
  - Display error message if too far away
  - _Requirements: 6.2, 6.3, 6.5, 14.4_

- [x] 12.3 Handle verification submission
  - Submit verification data using useVerifyLocation hook
  - Display success confirmation with time-matched badge if applicable
  - Update encounter verification count
  - _Requirements: 6.4_

- [ ]* 12.4 Write property test for distance-based eligibility
  - **Property 6: Distance-based verification eligibility**
  - **Validates: Requirements 6.3, 6.5**
  - Generate random locations and verify form enabled only within 50m
  - _Requirements: 6.3, 6.5_

- [ ]* 12.5 Write unit tests for verification components
  - Test VerificationForm renders and handles submission
  - Test distance checking enables/disables form correctly
  - Test error message displays when too far
  - _Requirements: 6.2, 6.3, 6.5_

- [x] 13. Build search and filter functionality
- [x] 13.1 Create SearchBar component
  - Implement location search with Google Places Autocomplete
  - Handle search submission to update encounter query
  - Display search results count
  - _Requirements: 8.2_

- [x] 13.2 Create FilterPanel component
  - Add distance radius slider (1-100km)
  - Add sort options (rating, date)
  - Apply filters to encounter query
  - Display active filters with clear buttons
  - _Requirements: 8.3, 8.4_

- [x] 13.3 Integrate filters with stories and map
  - Update useEncounters hook with filter parameters
  - Sync filters between stories list and map view
  - Update URL query params for shareable filtered views
  - _Requirements: 8.5_

- [ ]* 13.4 Write property test for distance filter accuracy
  - **Property 9: Distance filter accuracy**
  - **Validates: Requirements 8.3**
  - Generate random encounters and filter params, verify only matching results
  - _Requirements: 8.3_

- [ ]* 13.5 Write unit tests for search and filter components
  - Test SearchBar handles input and submission
  - Test FilterPanel updates query parameters
  - Test filters sync between views
  - _Requirements: 8.2, 8.3, 8.4_

- [x] 14. Build profile page
- [x] 14.1 Create ProfileDashboard component
  - Display statistics cards (submissions, verifications, ratings)
  - Fetch user activity using device ID
  - Style with horror theme (dark cards, green borders)
  - _Requirements: 9.1, 9.2_

- [x] 14.2 Create SubmissionList component
  - Display user's submitted encounters with status badges
  - Filter by status (pending, approved, rejected)
  - Handle click to view encounter details
  - _Requirements: 9.3_

- [x] 14.3 Create VerificationList component
  - Display user's verifications with location names and dates
  - Show spookiness scores with star rating
  - Link to verified encounters
  - _Requirements: 9.4_

- [ ]* 14.4 Write unit tests for profile components
  - Test ProfileDashboard displays correct statistics
  - Test SubmissionList filters by status
  - Test VerificationList displays verifications correctly
  - _Requirements: 9.1, 9.3, 9.4_

- [x] 15. Build admin panel
- [x] 15.1 Create AdminPanel page component
  - Set up protected route at /admin/panel
  - Fetch pending encounters using usePendingEncounters hook
  - Display pending encounters list
  - _Requirements: 10.1, 10.2_

- [x] 15.2 Create PendingEncounterCard component
  - Display full encounter preview with images
  - Add approve and reject action buttons
  - Show confirmation dialog before actions
  - _Requirements: 10.3_

- [x] 15.3 Implement admin actions
  - Handle approve action with useApproveEncounter hook
  - Handle reject action with useRejectEncounter hook
  - Remove encounter from pending list after action
  - Invalidate React Query cache to refresh data
  - _Requirements: 10.4, 10.5_

- [ ]* 15.4 Write unit tests for admin components
  - Test AdminPanel fetches and displays pending encounters
  - Test PendingEncounterCard renders correctly
  - Test approve/reject actions call correct API endpoints
  - _Requirements: 10.2, 10.3, 10.4, 10.5_

- [x] 16. Implement responsive design
- [x] 16.1 Add responsive breakpoints to Tailwind config
  - Configure breakpoints (sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px)
  - Create responsive utility classes
  - _Requirements: 1.2_

- [x] 16.2 Make all components responsive
  - Update StoryGrid to show 1-3 columns based on viewport
  - Update NavigationBar to show hamburger menu on mobile
  - Update forms to stack vertically on mobile
  - Update map to adjust height on mobile
  - _Requirements: 1.2, 1.3, 1.4_

- [ ]* 16.3 Write property test for responsive layout integrity
  - **Property 1: Responsive layout integrity**
  - **Validates: Requirements 1.2**
  - Generate random viewport widths and verify no overflow
  - _Requirements: 1.2_

- [ ]* 16.4 Write visual regression tests for responsive layouts
  - Capture screenshots at different viewport sizes
  - Verify layouts don't break at breakpoints
  - _Requirements: 1.2_

- [ ] 17. Implement accessibility features
- [ ] 17.1 Add ARIA labels and roles
  - Add aria-label to all interactive elements
  - Add role attributes for semantic HTML
  - Add aria-live regions for dynamic content
  - _Requirements: 17.2_

- [ ] 17.2 Implement keyboard navigation
  - Ensure all interactive elements are keyboard accessible
  - Add visible focus indicators with green outline
  - Implement focus trap in modals
  - Add skip-to-content link
  - _Requirements: 17.1_

- [ ] 17.3 Add alt text to images
  - Provide descriptive alt text for all content images
  - Use empty alt for decorative images
  - _Requirements: 17.3_

- [ ]* 17.4 Write property test for color contrast compliance
  - **Property 12: Color contrast compliance**
  - **Validates: Requirements 17.4**
  - Test all text/background combinations meet 4.5:1 ratio
  - _Requirements: 17.4_

- [ ]* 17.5 Run automated accessibility tests
  - Use @axe-core/react to check for a11y issues
  - Test with keyboard navigation
  - Test with screen reader (manual)
  - _Requirements: 17.1, 17.2, 17.3, 17.4_

- [ ] 18. Implement theme consistency
- [ ]* 18.1 Write property test for background color consistency
  - **Property 10: Background color consistency**
  - **Validates: Requirements 12.1**
  - Test all pages use #000000 or #0A0A0A background
  - _Requirements: 12.1_

- [ ]* 18.2 Write property test for accent color consistency
  - **Property 11: Accent color consistency**
  - **Validates: Requirements 12.2**
  - Test all interactive elements use #00FF41 accent
  - _Requirements: 12.2_

- [ ] 19. Implement animations and transitions
- [ ] 19.1 Add page transition animations
  - Implement fade transitions between routes with Framer Motion
  - Set duration to 200-400ms
  - _Requirements: 13.1_

- [ ] 19.2 Add hover animations
  - Implement scale transform on story card hover
  - Add green glow effect on button hover
  - _Requirements: 13.2, 13.3_

- [ ] 19.3 Add map marker animations
  - Animate markers appearing with fade-in and drop effect
  - Implement pulsing animation for hotspots
  - _Requirements: 13.4_

- [ ]* 19.4 Write unit tests for animations
  - Test transitions apply correct duration
  - Test hover effects trigger correctly
  - _Requirements: 13.1, 13.2, 13.3_

- [ ] 20. Implement social sharing
- [ ] 20.1 Create SocialShare component
  - Add share buttons for Twitter, Facebook, Reddit
  - Implement copy link functionality
  - Style with horror theme
  - _Requirements: 18.1_

- [ ] 20.2 Add Open Graph meta tags
  - Add OG tags for title, description, image
  - Generate dynamic OG tags for encounter detail pages
  - _Requirements: 18.3_

- [ ] 20.3 Implement share functionality
  - Open share dialogs with pre-populated text
  - Generate shareable URLs in format /encounter/:id
  - _Requirements: 18.2, 18.4, 18.5_

- [ ]* 20.4 Write unit tests for social sharing
  - Test SocialShare renders buttons correctly
  - Test share URLs are generated correctly
  - Test copy link functionality
  - _Requirements: 18.1, 18.2, 18.5_

- [ ] 21. Implement performance optimizations
- [ ] 21.1 Add lazy loading for images
  - Implement lazy loading for images below the fold
  - Use native loading="lazy" attribute
  - Add blur-up placeholder effect
  - _Requirements: 16.2_

- [ ] 21.2 Implement code splitting
  - Split code by route using React.lazy
  - Add loading fallback for lazy-loaded routes
  - _Requirements: 16.1_

- [ ] 21.3 Add debouncing for scroll events
  - Debounce infinite scroll trigger
  - Debounce search input
  - _Requirements: 16.5_

- [ ] 21.4 Implement React Query caching
  - Configure stale times and cache times
  - Implement cache invalidation on mutations
  - _Requirements: 16.4_

- [ ]* 21.5 Run performance tests
  - Measure Lighthouse scores (target >80)
  - Verify FCP < 1.5s, LCP < 2.5s, TTI < 3.5s
  - _Requirements: 16.1_

- [ ] 22. Set up error handling
- [ ] 22.1 Implement global error boundary
  - Catch unhandled React errors
  - Display horror-themed error page
  - Log errors to console
  - _Requirements: 14.1_

- [ ] 22.2 Add error handling to API calls
  - Display toast notifications for non-critical errors
  - Show modal dialogs for critical errors
  - Implement retry buttons
  - _Requirements: 14.2_

- [ ] 22.3 Handle specific error cases
  - Network errors: Show retry option
  - Validation errors: Highlight form fields
  - Geolocation errors: Show manual entry option
  - Image upload errors: Allow retry without re-selecting
  - _Requirements: 14.3, 14.4, 14.5_

- [ ]* 22.4 Write unit tests for error handling
  - Test error boundary catches errors
  - Test API errors display correct messages
  - Test retry functionality works
  - _Requirements: 14.1, 14.2_

- [ ] 23. Set up deployment pipeline
- [ ] 23.1 Configure build for production
  - Set up Vite production build
  - Configure environment variables
  - Enable code splitting and tree shaking
  - Optimize assets (images, fonts)
  - _Requirements: 15.1_

- [ ] 23.2 Choose hosting platform
  - Evaluate options (AWS S3+CloudFront, Vercel, Netlify)
  - Set up hosting account and project
  - Configure custom domain
  - _Requirements: 1.1_

- [ ] 23.3 Create CI/CD pipeline
  - Set up GitHub Actions workflow
  - Add test, build, and deploy jobs
  - Configure automatic deployments from main branch
  - Set up preview deployments for PRs
  - _Requirements: 15.1_

- [ ] 23.4 Add monitoring and analytics
  - Set up error tracking with Sentry
  - Add Google Analytics 4
  - Configure performance monitoring
  - _Requirements: 16.1_

- [ ] 24. Final testing and polish
- [ ]* 24.1 Run full test suite
  - Run all unit tests
  - Run all property-based tests
  - Run integration tests
  - Run accessibility tests
  - _Requirements: All_

- [ ]* 24.2 Run E2E tests
  - Test critical user flows
  - Test in multiple browsers (Chrome, Firefox, Safari)
  - Test on different devices (desktop, tablet, mobile)
  - _Requirements: 1.5_

- [ ] 24.3 Perform manual QA
  - Test all features manually
  - Verify horror theme consistency
  - Check responsive design at all breakpoints
  - Test error scenarios
  - _Requirements: All_

- [ ] 24.4 Optimize and fix issues
  - Fix any bugs found during testing
  - Optimize performance bottlenecks
  - Improve accessibility issues
  - Polish animations and transitions
  - _Requirements: All_

- [ ] 25. Documentation and handoff
  - Create README with setup instructions
  - Document environment variables
  - Document deployment process
  - Create user guide for admin panel
  - Document API integration
  - _Requirements: All_
