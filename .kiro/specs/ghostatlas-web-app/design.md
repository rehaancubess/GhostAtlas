# Design Document

## Overview

The GhostAtlas Web Application is a React-based single-page application (SPA) that provides a browser-accessible interface for the GhostAtlas paranormal encounter platform. The application maintains feature parity with the Flutter mobile app while optimizing the user experience for desktop and tablet form factors. Built with React 18, TypeScript, and modern web technologies, the application integrates with the existing AWS Backend API to ensure data consistency across platforms.

The design emphasizes responsive layouts, atmospheric horror aesthetics, and performant interactions. The application uses React Router for client-side routing, React Query for data fetching and caching, Google Maps JavaScript API for map functionality, and Tailwind CSS for styling with custom horror-themed design tokens.

## Architecture

### Technology Stack

**Frontend Framework:**
- React 18.2+ with TypeScript 5.0+
- React Router v6 for client-side routing
- React Query (TanStack Query) v4 for server state management
- Zustand for client state management

**Styling:**
- Tailwind CSS v3 with custom configuration
- CSS Modules for component-specific styles
- Framer Motion for animations

**Map Integration:**
- @react-google-maps/api for Google Maps integration
- Custom marker clustering for performance

**Media Handling:**
- React Dropzone for file uploads
- Browser-native audio API for narration playback

**Build Tools:**
- Vite for fast development and optimized production builds
- ESLint and Prettier for code quality
- Vitest for unit testing

### Application Structure

```
ghostatlas-web/
├── public/
│   ├── fonts/
│   │   └── Creepster-Regular.ttf
│   ├── icons/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── stories/
│   │   ├── map/
│   │   ├── submit/
│   │   └── profile/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── stores/
│   ├── types/
│   ├── utils/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```


## Components and Interfaces

### Layout Components

**Navigation Bar (`NavigationBar.tsx`)**
- Horizontal navigation for desktop with logo, nav links, and user menu
- Hamburger menu for mobile viewports
- Sticky positioning with backdrop blur effect
- Active route highlighting with green accent

**Footer (`Footer.tsx`)**
- Links to Terms of Use, Privacy Policy, and social media
- Copyright information
- Horror-themed styling consistent with brand

**Page Layout (`PageLayout.tsx`)**
- Wrapper component providing consistent page structure
- Animated background effects (fog, particles)
- Responsive padding and max-width constraints

### Story Components

**Story Card (`StoryCard.tsx`)**
- Displays encounter preview with title, location, date, rating
- Hover effects with green glow and scale transform
- Click handler navigating to detail view
- Lazy-loaded thumbnail image with vignette effect

**Story Detail (`StoryDetail.tsx`)**
- Full encounter display with enhanced narrative
- AI-generated illustration display
- Audio player for narration
- Rating interface and verification button
- Social sharing buttons

**Story Grid (`StoryGrid.tsx`)**
- Responsive grid layout (1-3 columns based on viewport)
- Infinite scroll with intersection observer
- Loading skeletons during fetch
- Empty state with atmospheric messaging

### Map Components

**Haunted Map (`HauntedMap.tsx`)**
- Google Maps integration with dark theme
- Custom ghost markers with green styling
- Marker clustering for performance
- Info window on marker click
- Search box for location queries

**Map Marker (`MapMarker.tsx`)**
- Custom SVG ghost icon with green glow
- Pulsing animation for hotspots
- Click handler opening info window

**Map Info Window (`MapInfoWindow.tsx`)**
- Encounter preview in popup
- Link to full detail view
- Styled with horror theme

### Submit Components

**Submit Form (`SubmitForm.tsx`)**
- Multi-step form with validation
- Author name, location, story, time, images inputs
- Location picker with map preview
- Image upload with drag-and-drop
- Progress indicator during submission
- Success animation on completion

**Location Picker (`LocationPicker.tsx`)**
- Address search with autocomplete
- Manual coordinate entry
- Browser geolocation button
- Map preview showing selected location

**Image Uploader (`ImageUploader.tsx`)**
- Drag-and-drop zone with React Dropzone
- Image preview thumbnails
- Remove and reorder functionality
- File size and format validation
- Upload progress indicators

### Profile Components

**Profile Dashboard (`ProfileDashboard.tsx`)**
- Statistics cards (submissions, verifications, ratings)
- Activity timeline
- Horror-themed data visualization

**Submission List (`SubmissionList.tsx`)**
- User's submitted encounters with status badges
- Filter by status (pending, approved, rejected)
- Click to view details

**Verification List (`VerificationList.tsx`)**
- User's location verifications
- Spookiness scores and dates
- Link to verified encounters

### Admin Components

**Admin Panel (`AdminPanel.tsx`)**
- Protected route requiring secret URL
- Pending encounters list
- Approve/reject actions
- Bulk operations support

**Pending Encounter Card (`PendingEncounterCard.tsx`)**
- Full encounter preview
- Action buttons (approve, reject)
- Confirmation dialogs

### Common Components

**Button (`Button.tsx`)**
- Variants: primary, secondary, ghost, danger
- Sizes: small, medium, large
- Loading state with spinner
- Horror-themed styling with green accents

**Loading Indicator (`LoadingIndicator.tsx`)**
- Pulsing green ghost animation
- Fullscreen and inline variants
- Atmospheric loading messages

**Error Boundary (`ErrorBoundary.tsx`)**
- Catches React errors
- Displays horror-themed error page
- Retry functionality

**Modal (`Modal.tsx`)**
- Overlay with backdrop blur
- Animated entrance/exit
- Keyboard navigation (ESC to close)
- Focus trap for accessibility

**Audio Player (`AudioPlayer.tsx`)**
- Custom controls matching horror theme
- Play/pause, seek, volume
- Progress bar with green accent
- Persistent volume preference

**Rating Stars (`RatingStars.tsx`)**
- Interactive 5-star rating
- Hover preview
- Read-only mode for display
- Green star styling

**Social Share (`SocialShare.tsx`)**
- Share buttons for Twitter, Facebook, Reddit
- Copy link functionality
- Share count display (if available)


## Data Models

### TypeScript Interfaces

```typescript
interface Encounter {
  id: string;
  authorName: string;
  location: Location;
  originalStory: string;
  enhancedStory?: string;
  encounterTime: string; // ISO 8601
  imageUrls: string[];
  illustrationUrl?: string;
  narrationUrl?: string;
  rating: number;
  ratingCount: number;
  verificationCount: number;
  verifications?: Verification[];
  status: 'pending' | 'approved' | 'rejected' | 'enhancing';
  createdAt: string;
  updatedAt: string;
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Verification {
  id: string;
  encounterId: string;
  spookinessScore: number; // 1-5
  notes?: string;
  verifiedAt: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

interface SubmitEncounterRequest {
  authorName: string;
  location: Location;
  originalStory: string;
  encounterTime: string;
  imageCount: number;
}

interface SubmitEncounterResponse {
  encounterId: string;
  uploadUrls: string[];
}

interface RateEncounterRequest {
  deviceId: string;
  rating: number; // 1-5
}

interface RateEncounterResponse {
  averageRating: number;
  ratingCount: number;
}

interface VerifyLocationRequest {
  location: Location;
  spookinessScore: number;
  notes?: string;
}

interface VerifyLocationResponse {
  verificationId: string;
  isTimeMatched: boolean;
  distanceMeters: number;
}

interface UserProfile {
  deviceId: string;
  submissionCount: number;
  verificationCount: number;
  ratingCount: number;
  submissions: Encounter[];
  verifications: Verification[];
}
```

### State Management

**Global State (Zustand)**
- User device ID
- Current location (if granted)
- Theme preferences
- Audio volume preference

**Server State (React Query)**
- Encounters list with pagination
- Individual encounter details
- Pending encounters (admin)
- User profile data

**Local Component State**
- Form inputs and validation
- UI toggles (modals, dropdowns)
- Temporary selections


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN a User navigates to the GhostAtlas Web Application URL, THE GhostAtlas Web Application SHALL load and display the landing page within 3 seconds on broadband connections
Thoughts: This is a performance requirement about load time. We can test this with performance monitoring tools, but it's not a universal property that applies to all inputs.
Testable: no

1.2 WHEN the GhostAtlas Web Application loads, THE GhostAtlas Web Application SHALL apply responsive design that adapts to viewport widths from 320 pixels to 3840 pixels
Thoughts: This is about responsive behavior across different viewport sizes. We can test this by generating random viewport widths within the range and ensuring the layout doesn't break.
Testable: yes - property

1.3 WHEN a User accesses the site on desktop browsers, THE GhostAtlas Web Application SHALL display a horizontal Navigation Bar with links to Stories, Map, Submit, and Profile sections
Thoughts: This is testing that specific UI elements exist when viewport is desktop-sized. This is an example test.
Testable: yes - example

1.4 WHEN a User accesses the site on mobile browsers, THE GhostAtlas Web Application SHALL display a hamburger menu that expands to show navigation options
Thoughts: This is testing that specific UI elements exist when viewport is mobile-sized. This is an example test.
Testable: yes - example

1.5 THE GhostAtlas Web Application SHALL function correctly on Chrome, Firefox, Safari, and Edge browsers released within the past 2 years
Thoughts: This is about cross-browser compatibility. This is typically tested manually or with browser testing services, not a property test.
Testable: no

3.1 WHEN a User navigates to the Submit section, THE GhostAtlas Web Application SHALL display a form with fields for Author Name, location, narrative text, time of occurrence, and image uploads
Thoughts: This is testing that specific form fields exist. This is an example test.
Testable: yes - example

3.2 WHEN a User provides location data, THE GhostAtlas Web Application SHALL offer both manual address entry and browser geolocation API integration with accuracy within 10 meters
Thoughts: The accuracy part is about the geolocation API behavior, not something we control. But we can test that both input methods are available.
Testable: yes - example

3.3 WHEN a User uploads images, THE GhostAtlas Web Application SHALL accept JPEG, PNG, and WebP formats with file sizes up to 10 megabytes per image and maximum 5 images
Thoughts: This is about input validation. We can generate random files with different formats and sizes and ensure validation works correctly.
Testable: yes - property

3.4 WHEN a User submits a Ghost Encounter with all required fields, THE GhostAtlas Web Application SHALL send the data to the AWS Backend API and display a success message with atmospheric animation
Thoughts: This is testing the happy path of form submission. This is an example test.
Testable: yes - example

3.5 IF a User attempts to submit with missing required fields, THEN THE GhostAtlas Web Application SHALL display validation error messages with green-bordered highlights on invalid fields
Thoughts: This is about form validation behavior. We can generate random incomplete form data and ensure validation errors appear correctly.
Testable: yes - property

4.4 WHEN the Stories section loads, THE GhostAtlas Web Application SHALL fetch encounters from the AWS Backend API sorted by rating score in descending order
Thoughts: This is about sort order. We can generate random encounter data and ensure the sorting is correct.
Testable: yes - property

5.2 WHEN the map loads, THE GhostAtlas Web Application SHALL display all approved Ghost Encounters as custom green ghost markers on the map
Thoughts: This is testing that all encounters appear as markers. We can generate random encounter sets and ensure marker count matches.
Testable: yes - property

6.3 IF the User is within 50 meters of the encounter location, THEN THE GhostAtlas Web Application SHALL display a verification form requesting Spookiness Score (1-5) and optional notes
Thoughts: This is testing distance-based logic. We can generate random locations and distances and ensure the form appears only when within range.
Testable: yes - property

6.5 IF the User is more than 50 meters away, THEN THE GhostAtlas Web Application SHALL display an error message indicating they must be at the location to verify
Thoughts: This is the inverse of 6.3. We can test this with the same property.
Testable: edge-case

7.2 WHEN a User submits a rating, THE GhostAtlas Web Application SHALL generate or retrieve a Device ID from browser localStorage and send it with the rating to the AWS Backend API
Thoughts: This is about device ID management. We can test that a device ID is always present when rating.
Testable: yes - property

7.4 IF a User has already rated an encounter, THEN THE GhostAtlas Web Application SHALL display their previous rating and prevent duplicate ratings
Thoughts: This is about preventing duplicate ratings. We can test that attempting to rate twice with the same device ID is prevented.
Testable: yes - property

8.3 WHEN a User applies a distance filter, THE GhostAtlas Web Application SHALL display only encounters within the specified radius from the search location
Thoughts: This is about filtering logic. We can generate random encounter sets and filter parameters and ensure only matching encounters are shown.
Testable: yes - property

12.1 THE GhostAtlas Web Application SHALL use a Background Color of pure black (#000000) or near-black (#0A0A0A) for all pages
Thoughts: This is about consistent styling. We can test that all page backgrounds use the correct color.
Testable: yes - property

12.2 THE GhostAtlas Web Application SHALL use an Accent Color of eerie green (#00FF41) for all interactive elements including buttons, links, and active states
Thoughts: This is about consistent styling. We can test that all interactive elements use the correct accent color.
Testable: yes - property

15.2 WHEN encounters are submitted, THE GhostAtlas Web Application SHALL follow the same submission flow including presigned S3 URLs for image uploads
Thoughts: This is about API integration correctness. We can test that the submission flow produces the correct API calls.
Testable: yes - example

17.4 THE GhostAtlas Web Application SHALL maintain color contrast ratios meeting WCAG 2.1 AA standards (minimum 4.5:1 for normal text)
Thoughts: This is about accessibility. We can test that all text/background combinations meet the contrast requirement.
Testable: yes - property

### Property Reflection

After reviewing the properties, I notice some potential redundancy:
- Properties 6.3 and 6.5 are complementary (within range vs. outside range) and can be combined into a single property about distance-based verification eligibility
- Properties 12.1 and 12.2 are both about consistent theming and could be tested together

### Correctness Properties

Property 1: Responsive layout integrity
*For any* viewport width between 320px and 3840px, the application layout should render without horizontal scrollbars or content overflow
**Validates: Requirements 1.2**

Property 2: Image upload validation
*For any* uploaded file, the application should accept it if and only if it is JPEG, PNG, or WebP format, under 10MB in size, and the total count doesn't exceed 5 images
**Validates: Requirements 3.3**

Property 3: Form validation completeness
*For any* form submission attempt with incomplete required fields, the application should display validation errors for all missing fields and prevent submission
**Validates: Requirements 3.5**

Property 4: Encounter sorting consistency
*For any* list of encounters, when sorted by rating, the resulting list should be in descending order by rating score
**Validates: Requirements 4.4**

Property 5: Map marker completeness
*For any* set of approved encounters, the map should display exactly one marker per encounter at the correct coordinates
**Validates: Requirements 5.2**

Property 6: Distance-based verification eligibility
*For any* user location and encounter location, the verification form should be enabled if and only if the distance between them is 50 meters or less
**Validates: Requirements 6.3, 6.5**

Property 7: Device ID persistence
*For any* rating submission, the application should use a consistent device ID from localStorage, generating one if it doesn't exist
**Validates: Requirements 7.2**

Property 8: Duplicate rating prevention
*For any* encounter and device ID combination, if a rating already exists, subsequent rating attempts should be prevented and show the existing rating
**Validates: Requirements 7.4**

Property 9: Distance filter accuracy
*For any* set of encounters and distance filter parameters, the filtered results should include only encounters within the specified radius
**Validates: Requirements 8.3**

Property 10: Background color consistency
*For any* page in the application, the background color should be either #000000 or #0A0A0A
**Validates: Requirements 12.1**

Property 11: Accent color consistency
*For any* interactive element (button, link, active state), the accent color should be #00FF41
**Validates: Requirements 12.2**

Property 12: Color contrast compliance
*For any* text element, the contrast ratio between text color and background color should be at least 4.5:1
**Validates: Requirements 17.4**


## Error Handling

### Error Categories

**Network Errors**
- Connection failures
- Timeout errors
- CORS issues
- Rate limiting (429 responses)

**API Errors**
- Validation errors (400)
- Not found errors (404)
- Conflict errors (409)
- Server errors (500)

**Client Errors**
- Form validation failures
- File upload errors
- Geolocation permission denied
- Browser compatibility issues

### Error Handling Strategy

**Global Error Boundary**
- Catches unhandled React errors
- Displays horror-themed error page
- Provides "Return Home" and "Retry" options
- Logs errors to console for debugging

**API Error Handling**
- Centralized error handling in API service
- Exponential backoff for retryable errors (500, 503)
- User-friendly error messages
- Toast notifications for non-critical errors
- Modal dialogs for critical errors

**Form Validation**
- Real-time validation on blur
- Inline error messages below fields
- Green border highlights on invalid fields
- Prevent submission until valid
- Preserve form data on error

**Geolocation Errors**
- Permission denied: Show explanation and manual entry option
- Position unavailable: Fallback to IP-based location
- Timeout: Retry with increased timeout
- Not supported: Hide location-based features

**Image Upload Errors**
- File too large: Show size limit message
- Invalid format: Show accepted formats
- Upload failed: Allow retry without re-selecting
- Network error: Queue for retry when online

### Error Messages

All error messages maintain the horror theme while being clear and actionable:

- "The spirits are restless... Connection failed. Please try again."
- "This location is beyond our reach... You must be within 50 meters to verify."
- "The ancient texts require all fields... Please complete the form."
- "This image is too powerful... Maximum file size is 10MB."
- "The portal is closed... Location access denied."


## Testing Strategy

### Unit Testing

**Component Testing**
- Test individual React components in isolation
- Mock external dependencies (API calls, browser APIs)
- Verify rendering with different props
- Test user interactions (clicks, form inputs)
- Use React Testing Library for DOM queries
- Focus on user-facing behavior, not implementation details

**Utility Function Testing**
- Test pure functions (formatters, validators, calculators)
- Test edge cases and boundary conditions
- Test error handling paths
- Use Vitest for fast test execution

**Hook Testing**
- Test custom React hooks with @testing-library/react-hooks
- Verify state updates and side effects
- Test cleanup functions

**Example Unit Tests:**
- Button component renders with correct variant styles
- Form validation correctly identifies missing required fields
- Distance calculation returns accurate results
- Device ID generation creates valid UUIDs
- Date formatter handles various input formats

### Integration Testing

**API Integration**
- Test API service methods with mock responses
- Verify request formatting and error handling
- Test retry logic and exponential backoff
- Use MSW (Mock Service Worker) for API mocking

**Component Integration**
- Test component interactions (parent-child communication)
- Test form submission flows
- Test navigation between pages
- Test state management integration

**Example Integration Tests:**
- Submit form sends correct data to API
- Story card click navigates to detail page
- Rating submission updates UI and calls API
- Map marker click opens info window
- Admin approval removes encounter from pending list

### End-to-End Testing

**Critical User Flows**
- Landing page → Browse stories → View detail → Rate encounter
- Submit encounter → Upload images → Success confirmation
- View map → Click marker → Navigate to detail
- Admin panel → Approve encounter → Verify on map

**Tools:**
- Playwright or Cypress for E2E testing
- Run against local development server
- Test in multiple browsers (Chrome, Firefox, Safari)

### Property-Based Testing

**Testing Library:**
- fast-check for JavaScript/TypeScript property-based testing
- Configure to run minimum 100 iterations per property

**Property Test Implementation:**
- Each correctness property from the design document should be implemented as a property-based test
- Tests should be tagged with comments referencing the design document
- Tag format: `// Feature: ghostatlas-web-app, Property X: [property description]`

**Example Property Tests:**

```typescript
// Feature: ghostatlas-web-app, Property 1: Responsive layout integrity
test('layout renders without overflow for any viewport width', () => {
  fc.assert(
    fc.property(
      fc.integer({ min: 320, max: 3840 }),
      (viewportWidth) => {
        // Set viewport width
        // Render app
        // Assert no horizontal scrollbar
        // Assert no content overflow
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: ghostatlas-web-app, Property 2: Image upload validation
test('image upload accepts valid files and rejects invalid files', () => {
  fc.assert(
    fc.property(
      fc.record({
        format: fc.constantFrom('jpeg', 'png', 'webp', 'gif', 'bmp'),
        size: fc.integer({ min: 0, max: 15 * 1024 * 1024 }),
        count: fc.integer({ min: 1, max: 10 })
      }),
      (fileSpec) => {
        const isValid = 
          ['jpeg', 'png', 'webp'].includes(fileSpec.format) &&
          fileSpec.size <= 10 * 1024 * 1024 &&
          fileSpec.count <= 5;
        
        const result = validateImageUpload(fileSpec);
        return result.valid === isValid;
      }
    ),
    { numRuns: 100 }
  );
});

// Feature: ghostatlas-web-app, Property 6: Distance-based verification eligibility
test('verification form enabled only within 50 meters', () => {
  fc.assert(
    fc.property(
      fc.record({
        userLat: fc.double({ min: -90, max: 90 }),
        userLon: fc.double({ min: -180, max: 180 }),
        encounterLat: fc.double({ min: -90, max: 90 }),
        encounterLon: fc.double({ min: -180, max: 180 })
      }),
      (locations) => {
        const distance = calculateDistance(
          locations.userLat,
          locations.userLon,
          locations.encounterLat,
          locations.encounterLon
        );
        
        const isEligible = canVerifyLocation(locations);
        return isEligible === (distance <= 50);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Accessibility Testing

**Automated Testing**
- Use @axe-core/react for automated accessibility checks
- Run on all major components and pages
- Verify WCAG 2.1 AA compliance

**Manual Testing**
- Keyboard navigation testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Color contrast verification
- Focus indicator visibility

### Performance Testing

**Metrics to Monitor**
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1

**Tools:**
- Lighthouse CI for automated performance testing
- Chrome DevTools Performance panel
- WebPageTest for real-world testing

### Visual Regression Testing

**Tools:**
- Percy or Chromatic for visual diff testing
- Capture screenshots of key components
- Detect unintended visual changes

### Test Coverage Goals

- Unit test coverage: > 80%
- Integration test coverage: > 60%
- Critical paths: 100% E2E coverage
- All correctness properties: 100% property test coverage


## API Integration

### API Service Architecture

**Centralized API Client**
- Single `apiClient.ts` module handling all HTTP requests
- Axios for HTTP client with interceptors
- Base URL configuration from environment variables
- Request/response interceptors for logging and error handling

**React Query Integration**
- Query keys organized by resource type
- Automatic caching with 5-minute stale time
- Background refetching for data freshness
- Optimistic updates for better UX
- Mutation callbacks for success/error handling

### API Endpoints

**Encounters**
```typescript
// GET /api/encounters
useEncounters(params: {
  latitude?: number;
  longitude?: number;
  radius?: number;
  limit?: number;
})

// GET /api/encounters/:id
useEncounter(id: string)

// POST /api/encounters
useSubmitEncounter()

// PUT /api/encounters/:id/upload-complete
useTriggerEnhancement(id: string)

// POST /api/encounters/:id/rate
useRateEncounter(id: string)

// POST /api/encounters/:id/verify
useVerifyLocation(id: string)
```

**Admin**
```typescript
// GET /admin/encounters
usePendingEncounters(params: {
  nextToken?: string;
  limit?: number;
})

// PUT /admin/encounters/:id/approve
useApproveEncounter(id: string)

// PUT /admin/encounters/:id/reject
useRejectEncounter(id: string)
```

### Request/Response Handling

**Request Interceptor**
- Add CORS headers
- Add request timestamp for logging
- Add device ID header for tracking

**Response Interceptor**
- Parse error responses
- Transform data to match TypeScript interfaces
- Log response times
- Handle rate limiting with retry-after

**Error Handling**
- Network errors: Retry with exponential backoff (max 3 attempts)
- 400 errors: Display validation messages
- 404 errors: Show not found page
- 409 errors: Handle conflicts (duplicate ratings)
- 429 errors: Respect retry-after header
- 500 errors: Show error message with retry option

### Image Upload Flow

1. Submit encounter with `imageCount`
2. Receive `encounterId` and presigned S3 URLs
3. Upload images directly to S3 using presigned URLs
4. Call `/encounters/:id/upload-complete` to trigger enhancement
5. Poll encounter status until enhancement completes

### Caching Strategy

**Query Cache Configuration**
```typescript
{
  encounters: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  },
  encounterDetail: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  pendingEncounters: {
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  }
}
```

**Cache Invalidation**
- After submitting encounter: Invalidate encounters list
- After rating: Invalidate encounter detail
- After verification: Invalidate encounter detail
- After admin approval: Invalidate pending list and encounters list

### Environment Configuration

```typescript
// .env.development
VITE_API_BASE_URL=https://dev-api.ghostatlas.com/api
VITE_GOOGLE_MAPS_API_KEY=your_dev_key

// .env.production
VITE_API_BASE_URL=https://api.ghostatlas.com/api
VITE_GOOGLE_MAPS_API_KEY=your_prod_key
```

## Deployment

### Build Configuration

**Vite Build Settings**
- Code splitting by route
- Tree shaking for smaller bundles
- Asset optimization (images, fonts)
- Source maps for production debugging
- Environment variable injection

**Output Structure**
```
dist/
├── assets/
│   ├── index-[hash].js
│   ├── vendor-[hash].js
│   ├── styles-[hash].css
│   └── fonts/
├── index.html
└── favicon.ico
```

### Hosting Options

**Option 1: AWS S3 + CloudFront**
- Static site hosting on S3
- CloudFront CDN for global distribution
- Route 53 for DNS management
- SSL certificate from ACM
- Automatic cache invalidation on deploy

**Option 2: Vercel**
- Automatic deployments from Git
- Edge network for fast global access
- Preview deployments for PRs
- Built-in analytics
- Zero configuration

**Option 3: Netlify**
- Git-based deployments
- Automatic HTTPS
- Form handling for contact forms
- Split testing capabilities
- Edge functions for serverless logic

### CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
name: Deploy Web App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Run linter
      - Run unit tests
      - Run integration tests
      - Run accessibility tests
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Install dependencies
      - Build production bundle
      - Upload artifacts
      
  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - Download artifacts
      - Deploy to hosting platform
      - Invalidate CDN cache
      - Run smoke tests
```

### Environment Management

**Development**
- Local development server with hot reload
- Mock API responses for offline development
- Debug logging enabled
- Source maps for debugging

**Staging**
- Deployed from `develop` branch
- Connected to staging AWS backend
- Performance monitoring enabled
- E2E tests run on deploy

**Production**
- Deployed from `main` branch
- Connected to production AWS backend
- Error tracking with Sentry
- Analytics with Google Analytics
- Performance monitoring with Lighthouse CI

### Monitoring and Analytics

**Error Tracking**
- Sentry for error monitoring
- Source map upload for stack traces
- User context (device ID, browser)
- Breadcrumbs for debugging

**Analytics**
- Google Analytics 4 for user behavior
- Custom events for key actions
- Conversion tracking for submissions
- Performance metrics

**Performance Monitoring**
- Real User Monitoring (RUM)
- Core Web Vitals tracking
- API response time monitoring
- Resource loading metrics

