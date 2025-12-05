# Design Document

## Overview

GhostAtlas is a Flutter mobile application that enables users to submit, explore, and verify paranormal encounters without requiring authentication. The app uses simple Flutter state management (StatefulWidget) to maintain a clean, maintainable codebase. The backend leverages AWS services for data storage, AI-powered story enhancement, and media handling. An easter egg admin panel allows manual content moderation before stories appear on the public map.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Flutter Mobile App                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Submit Story │  │ Haunted Map  │  │ Ghostbuster  │      │
│  │    Screen    │  │    Screen    │  │     Mode     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │ Story Detail │  │ Admin Panel  │                        │
│  │    Screen    │  │  (Hidden)    │                        │
│  └──────────────┘  └──────────────┘                        │
│                          │                                   │
│                    ┌─────▼─────┐                            │
│                    │  API      │                            │
│                    │  Service  │                            │
│                    └─────┬─────┘                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
                           │ HTTPS/REST
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                      AWS Backend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   API        │  │   DynamoDB   │  │      S3      │      │
│  │  Gateway     │  │   (Stories)  │  │   (Images)   │      │
│  └──────┬───────┘  └──────────────┘  └──────────────┘      │
│         │                                                    │
│  ┌──────▼───────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Lambda     │  │   Bedrock    │  │    Polly     │      │
│  │  Functions   │  │ (AI Stories) │  │   (Voice)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Flutter SDK (latest stable)
- Dart programming language
- Simple StatefulWidget-based state management
- google_maps_flutter for map display
- geolocator for location services
- http package for API calls
- image_picker for photo uploads
- audioplayers for narration playback

**Backend (AWS):**
- API Gateway: REST API endpoints
- Lambda: Serverless functions for business logic
- DynamoDB: NoSQL database for encounter data
- S3: Object storage for images and audio files
- Bedrock: AI text enhancement and image generation
- Polly: Text-to-speech for narrations
- CloudFront: CDN for media delivery

## Components and Interfaces

### 1. Submit Story Screen

**Purpose:** Allow users to submit ghost encounters with minimal friction

**UI Components:**
- Text field for Author Name
- Location picker (map + current location button)
- Multi-line text field for story narrative
- Time picker for when the encounter occurred
- Image picker button (optional, multiple images)
- Submit button

**State Management:**
```dart
class SubmitStoryScreen extends StatefulWidget {
  @override
  _SubmitStoryScreenState createState() => _SubmitStoryScreenState();
}

class _SubmitStoryScreenState extends State<SubmitStoryScreen> {
  String authorName = '';
  LatLng? selectedLocation;
  String storyText = '';
  DateTime? encounterTime;
  List<File> selectedImages = [];
  bool isSubmitting = false;
  
  // Simple methods for handling form submission
}
```

**API Integration:**
- POST `/api/encounters` - Submit new encounter
- Payload: JSON with author, location, story, time, images (base64 or S3 URLs)

### 2. Haunted Map Screen

**Purpose:** Display all approved encounters on an interactive map

**UI Components:**
- Google Maps widget covering full screen
- Custom map markers for single encounters
- Animated glowing/pulsing markers for hotspots
- Bottom sheet for encounter preview on marker tap
- Search bar for location search
- Filter button (distance, rating)

**State Management:**
```dart
class HauntedMapScreen extends StatefulWidget {
  @override
  _HauntedMapScreenState createState() => _HauntedMapScreenState();
}

class _HauntedMapScreenState extends State<HauntedMapScreen> {
  List<Encounter> encounters = [];
  LatLng? userLocation;
  Encounter? selectedEncounter;
  bool isLoading = true;
  
  @override
  void initState() {
    super.initState();
    _loadEncounters();
    _getUserLocation();
  }
  
  Future<void> _loadEncounters() async {
    // Fetch from API
  }
}
```

**Hotspot Logic:**
- Group encounters by location (within 50m radius)
- If count > 1, render as hotspot with pulse animation
- Pulse intensity scales with encounter count

**API Integration:**
- GET `/api/encounters?status=approved` - Fetch all approved encounters
- GET `/api/encounters/nearby?lat={lat}&lng={lng}&radius={radius}` - Proximity search

### 3. Story Detail Screen

**Purpose:** Display enhanced encounter with illustration and narration

**UI Components:**
- Hero image (AI-generated illustration)
- Author name and timestamp
- Enhanced story text (scrollable)
- Play button for audio narration
- Rating buttons (upvote/downvote)
- Verification count and average spookiness score
- "Verify This Location" button (if user is nearby)

**State Management:**
```dart
class StoryDetailScreen extends StatefulWidget {
  final Encounter encounter;
  
  StoryDetailScreen({required this.encounter});
  
  @override
  _StoryDetailScreenState createState() => _StoryDetailScreenState();
}

class _StoryDetailScreenState extends State<StoryDetailScreen> {
  bool isPlaying = false;
  int userRating = 0; // -1, 0, or 1
  
  // Methods for audio playback and rating
}
```

**API Integration:**
- GET `/api/encounters/{id}` - Fetch full encounter details
- POST `/api/encounters/{id}/rate` - Submit rating
- Media URLs served via CloudFront CDN

### 4. Ghostbuster Mode

**Purpose:** Enable location-based verification of encounters

**Trigger:** Automatically enabled when user is within 50m of an encounter location

**UI Components:**
- Banner notification: "You're near a haunted location!"
- Check-in button
- Spookiness score slider (0-10)
- Optional text field for verification notes
- Time-match indicator (if within 2 hours of original time)

**State Management:**
```dart
class GhostbusterMode extends StatefulWidget {
  final Encounter nearbyEncounter;
  
  @override
  _GhostbusterModeState createState() => _GhostbusterModeState();
}

class _GhostbusterModeState extends State<GhostbusterMode> {
  double spookinessScore = 5.0;
  String verificationNotes = '';
  bool isSubmitting = false;
  
  // Verification submission logic
}
```

**API Integration:**
- POST `/api/encounters/{id}/verify` - Submit verification
- Payload: spookiness score, notes, timestamp, user location

### 5. Admin Panel (Hidden)

**Purpose:** Manual content moderation before publication

**Unlock Mechanism:**
- Tap the app logo on the map screen 11 times rapidly
- Unlocks a new "Admin" tab in bottom navigation

**UI Components:**
- List of pending encounters
- Preview card for each submission
- Approve/Reject buttons
- View full details button

**State Management:**
```dart
class AdminPanelScreen extends StatefulWidget {
  @override
  _AdminPanelScreenState createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  List<Encounter> pendingEncounters = [];
  bool isLoading = true;
  
  Future<void> _loadPendingEncounters() async {
    // Fetch pending submissions
  }
  
  Future<void> _approveEncounter(String id) async {
    // Approve and refresh list
  }
  
  Future<void> _rejectEncounter(String id) async {
    // Reject and refresh list
  }
}
```

**API Integration:**
- GET `/api/admin/encounters?status=pending` - Fetch pending submissions
- PUT `/api/admin/encounters/{id}/approve` - Approve encounter
- PUT `/api/admin/encounters/{id}/reject` - Reject encounter

### 6. API Service Layer

**Purpose:** Centralized HTTP client for all backend communication

**Implementation:**
```dart
class ApiService {
  static const String baseUrl = 'https://api.ghostatlas.com';
  
  // Encounters
  Future<List<Encounter>> getEncounters({String status = 'approved'}) async {}
  Future<Encounter> getEncounterById(String id) async {}
  Future<void> submitEncounter(EncounterSubmission submission) async {}
  Future<void> rateEncounter(String id, int rating) async {}
  Future<void> verifyEncounter(String id, Verification verification) async {}
  
  // Admin
  Future<List<Encounter>> getPendingEncounters() async {}
  Future<void> approveEncounter(String id) async {}
  Future<void> rejectEncounter(String id) async {}
  
  // Helper methods for error handling
}
```

## Data Models

### Encounter Model

```dart
class Encounter {
  final String id;
  final String authorName;
  final LatLng location;
  final String originalStory;
  final String enhancedStory;
  final DateTime encounterTime;
  final DateTime submittedAt;
  final String status; // 'pending', 'approved', 'rejected'
  final List<String> imageUrls;
  final String? illustrationUrl;
  final String? narrationUrl;
  final int rating; // Net upvotes - downvotes
  final int verificationCount;
  final double? averageSpookiness;
  
  Encounter({
    required this.id,
    required this.authorName,
    required this.location,
    required this.originalStory,
    required this.enhancedStory,
    required this.encounterTime,
    required this.submittedAt,
    required this.status,
    required this.imageUrls,
    this.illustrationUrl,
    this.narrationUrl,
    this.rating = 0,
    this.verificationCount = 0,
    this.averageSpookiness,
  });
  
  factory Encounter.fromJson(Map<String, dynamic> json) {
    // JSON deserialization
  }
  
  Map<String, dynamic> toJson() {
    // JSON serialization
  }
}
```

### Verification Model

```dart
class Verification {
  final String id;
  final String encounterId;
  final double spookinessScore;
  final String? notes;
  final DateTime verifiedAt;
  final LatLng verificationLocation;
  final bool isTimeMatched;
  
  Verification({
    required this.id,
    required this.encounterId,
    required this.spookinessScore,
    this.notes,
    required this.verifiedAt,
    required this.verificationLocation,
    this.isTimeMatched = false,
  });
  
  factory Verification.fromJson(Map<String, dynamic> json) {
    // JSON deserialization
  }
  
  Map<String, dynamic> toJson() {
    // JSON serialization
  }
}
```

## AWS Backend Design

### DynamoDB Tables

**Encounters Table:**
- Partition Key: `id` (String, UUID)
- Attributes: authorName, location (lat/lng), originalStory, enhancedStory, encounterTime, submittedAt, status, imageUrls, illustrationUrl, narrationUrl, rating, verificationCount, averageSpookiness
- GSI: `status-submittedAt-index` for querying by status
- GSI: `location-index` for geospatial queries (using geohash)

**Verifications Table:**
- Partition Key: `id` (String, UUID)
- Sort Key: `encounterId` (String)
- Attributes: spookinessScore, notes, verifiedAt, verificationLocation, isTimeMatched
- GSI: `encounterId-verifiedAt-index` for querying verifications by encounter

**Ratings Table:**
- Partition Key: `encounterId` (String)
- Sort Key: `deviceId` (String) - to prevent duplicate ratings
- Attributes: rating (-1 or 1), ratedAt

### Lambda Functions

**SubmitEncounterFunction:**
- Triggered by: API Gateway POST /api/encounters
- Actions:
  1. Validate submission data
  2. Generate UUID for encounter
  3. Store original data in DynamoDB with status='pending'
  4. Upload images to S3
  5. Return success response

**EnhanceStoryFunction:**
- Triggered by: DynamoDB Stream (when encounter is approved)
- Actions:
  1. Call Bedrock to enhance story text
  2. Call Bedrock to generate illustration
  3. Call Polly to generate narration audio
  4. Upload illustration and audio to S3
  5. Update encounter record with media URLs

**GetEncountersFunction:**
- Triggered by: API Gateway GET /api/encounters
- Actions:
  1. Query DynamoDB by status
  2. Apply filters (location, rating)
  3. Return paginated results

**VerifyEncounterFunction:**
- Triggered by: API Gateway POST /api/encounters/{id}/verify
- Actions:
  1. Validate user location proximity
  2. Check time-match condition
  3. Store verification in DynamoDB
  4. Update encounter's verification count and average spookiness
  5. Return success response

**ApproveEncounterFunction:**
- Triggered by: API Gateway PUT /api/admin/encounters/{id}/approve
- Actions:
  1. Update encounter status to 'approved'
  2. Trigger EnhanceStoryFunction asynchronously
  3. Return success response

### S3 Buckets

**ghostatlas-user-images:**
- Stores user-uploaded photos
- Lifecycle policy: Retain indefinitely
- Public read access via CloudFront

**ghostatlas-generated-media:**
- Stores AI-generated illustrations and narrations
- Lifecycle policy: Retain indefinitely
- Public read access via CloudFront

### API Gateway Endpoints

```
POST   /api/encounters              - Submit new encounter
GET    /api/encounters              - List approved encounters
GET    /api/encounters/{id}         - Get encounter details
POST   /api/encounters/{id}/rate    - Rate an encounter
POST   /api/encounters/{id}/verify  - Verify a location
GET    /api/admin/encounters        - List pending encounters (admin)
PUT    /api/admin/encounters/{id}/approve - Approve encounter (admin)
PUT    /api/admin/encounters/{id}/reject  - Reject encounter (admin)
```

## Error Handling

### Client-Side Error Handling

**Network Errors:**
- Display user-friendly error message: "Unable to connect. Please check your internet connection."
- Provide retry button
- Cache data locally when possible

**Validation Errors:**
- Show inline validation messages on form fields
- Prevent submission until all required fields are valid

**Location Errors:**
- If location permission denied: Show message explaining why location is needed
- If GPS unavailable: Allow manual location selection on map

**Media Upload Errors:**
- If image too large: Compress before upload or show size limit message
- If upload fails: Retry up to 3 times, then show error

### Backend Error Handling

**Lambda Function Errors:**
- Wrap all operations in try-catch blocks
- Log errors to CloudWatch
- Return appropriate HTTP status codes (400, 404, 500)
- Include error messages in response body

**DynamoDB Errors:**
- Handle throttling with exponential backoff
- Validate data before writes
- Use transactions for multi-table operations

**AI Service Errors:**
- If Bedrock/Polly fails: Store encounter without enhancement, retry later
- Set timeout limits (30 seconds for text, 60 seconds for media)
- Fallback: Mark encounter as "enhancement pending"

## Testing Strategy

### Unit Testing

**Models:**
- Test JSON serialization/deserialization
- Test data validation logic

**API Service:**
- Mock HTTP responses
- Test error handling for various status codes
- Test request payload formatting

### Widget Testing

**Submit Story Screen:**
- Test form validation
- Test image picker integration
- Test location selection

**Haunted Map Screen:**
- Test marker rendering
- Test hotspot grouping logic
- Test encounter selection

**Story Detail Screen:**
- Test audio playback controls
- Test rating submission
- Test verification button visibility

### Integration Testing

**End-to-End Flows:**
- Submit encounter → Admin approval → Appears on map
- View encounter → Play narration → Rate story
- Navigate to location → Verify encounter → Submit spookiness score

**AWS Integration:**
- Test API Gateway endpoints with real Lambda functions
- Test DynamoDB read/write operations
- Test S3 upload/download
- Test AI enhancement pipeline (Bedrock + Polly)

### Manual Testing

**Admin Panel:**
- Test easter egg unlock mechanism (11 taps)
- Test approve/reject workflow
- Verify pending encounters display correctly

**Location Features:**
- Test GPS accuracy
- Test proximity detection for Ghostbuster Mode
- Test time-match detection

**Performance:**
- Test map performance with 100+ markers
- Test image loading and caching
- Test audio streaming

## Security Considerations

**API Security:**
- Use API keys for client authentication
- Implement rate limiting to prevent abuse
- Validate all input data server-side

**Data Privacy:**
- No personal data collection (no accounts)
- Location data stored only for encounters
- Images stored securely in S3 with access controls

**Admin Access:**
- Easter egg unlock is client-side only (not secure for production)
- Consider adding basic auth for admin endpoints in production
- Log all admin actions for audit trail

## Performance Optimization

**Client-Side:**
- Lazy load encounter details (fetch on demand)
- Cache map markers and images
- Compress images before upload
- Paginate encounter lists

**Backend:**
- Use DynamoDB DAX for caching
- Enable CloudFront CDN for media delivery
- Optimize Lambda cold starts with provisioned concurrency
- Use DynamoDB batch operations where possible

**Map Performance:**
- Cluster markers when zoomed out
- Load encounters incrementally based on viewport
- Use marker icons instead of custom widgets for better performance
