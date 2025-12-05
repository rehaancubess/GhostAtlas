# Design Document

## Overview

The GhostAtlas AWS Backend is a serverless architecture that provides a RESTful API for the GhostAtlas mobile application. The system leverages AWS managed services to handle paranormal encounter submissions, AI-powered content enhancement, media storage and delivery, geospatial queries, and administrative workflows.

The architecture follows event-driven patterns where encounter approval triggers an asynchronous AI enhancement pipeline. The system is designed for scalability, cost-efficiency, and minimal operational overhead through serverless components.

**Key Design Principles:**
- Serverless-first architecture for automatic scaling and reduced operational burden
- Event-driven processing for AI enhancement pipeline
- Separation of concerns between API layer, business logic, data storage, and AI processing
- Optimistic concurrency for high-throughput operations
- CDN-based media delivery for global performance

## Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Flutter App    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              CloudFront CDN                              │
│  (Media Delivery + API Caching)                         │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│           API Gateway (REST API)                         │
│  - Rate Limiting (100 req/min)                          │
│  - Request Validation                                    │
│  - CORS Configuration                                    │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              Lambda Functions                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │ API Handlers:                                     │  │
│  │ - SubmitEncounter                                 │  │
│  │ - GetEncounters (Geospatial)                     │  │
│  │ - GetEncounterById                                │  │
│  │ - RateEncounter                                   │  │
│  │ - VerifyLocation                                  │  │
│  │ - AdminListPending                                │  │
│  │ - AdminApprove                                    │  │
│  │ - AdminReject                                     │  │
│  │ - GeneratePresignedUrl                            │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Enhancement Pipeline:                             │  │
│  │ - EnhancementOrchestrator                         │  │
│  │ - GenerateNarrative (Bedrock)                     │  │
│  │ - GenerateIllustration (Bedrock)                  │  │
│  │ - GenerateNarration (Polly)                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│              DynamoDB Tables                             │
│  - Encounters (with GSI on status)                      │
│  - Verifications                                         │
│  - Ratings                                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              S3 Buckets                                  │
│  - ghostatlas-media-{env}                               │
│    └── encounters/{id}/                                 │
│        ├── images/{timestamp}-{filename}                │
│        ├── illustration.png                             │
│        └── narration.mp3                                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              SQS Queue                                   │
│  - enhancement-queue                                     │
│    (Triggered on encounter approval)                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              AI Services                                 │
│  - Bedrock (Claude for narrative)                       │
│  - Bedrock (Stable Diffusion for illustration)          │
│  - Polly (Neural voices for narration)                  │
└─────────────────────────────────────────────────────────┘
```

### Request Flow Examples

**Encounter Submission Flow:**
1. User submits encounter via Flutter app
2. API Gateway validates request and forwards to SubmitEncounter Lambda
3. Lambda validates data, generates encounter ID, stores in DynamoDB with status="pending"
4. Lambda returns presigned URLs for image uploads
5. Flutter app uploads images directly to S3 using presigned URLs
6. Lambda updates encounter record with image URLs

**Approval & Enhancement Flow:**
1. Admin approves encounter via AdminApprove Lambda
2. Lambda updates encounter status to "approved" in DynamoDB
3. Lambda publishes message to SQS enhancement queue
4. EnhancementOrchestrator Lambda triggered by SQS message
5. Orchestrator invokes Bedrock to generate horror narrative (10s) - ALWAYS REQUIRED
6. Orchestrator invokes Bedrock to generate 3-5 spooky illustrations (45s) - ALWAYS REQUIRED
7. Orchestrator invokes Polly to generate voice narration (10s) - ALWAYS REQUIRED
8. All media assets saved to S3, encounter record updated with URLs
9. Total enhancement time: ~60 seconds
10. Enhancement occurs regardless of whether user uploaded images

**Geospatial Query Flow:**
1. User requests encounters near location
2. GetEncounters Lambda receives lat/lon parameters
3. Lambda scans DynamoDB with filter on geohash prefix and status="approved"
4. Lambda calculates distances using Haversine formula
5. Lambda sorts results by distance and returns within 3 seconds

## Components and Interfaces

### API Endpoints

#### Public Endpoints

**POST /api/encounters**
- Purpose: Submit new paranormal encounter
- Request Body:
  ```json
  {
    "authorName": "string (max 100 chars)",
    "location": {
      "latitude": "number (-90 to 90)",
      "longitude": "number (-180 to 180)",
      "address": "string (optional)"
    },
    "originalStory": "string (max 5000 chars)",
    "encounterTime": "ISO 8601 timestamp",
    "imageCount": "number (0-5)"
  }
  ```
- Response: `{ "encounterId": "string", "uploadUrls": ["string"] }`
- Handler: SubmitEncounter Lambda

**GET /api/encounters**
- Purpose: List approved encounters with geospatial filtering
- Query Parameters:
  - `latitude`: number (required)
  - `longitude`: number (required)
  - `radius`: number (default 50km, max 100km)
  - `limit`: number (default 100, max 500)
- Response: `{ "encounters": [Encounter], "count": number }`
- Handler: GetEncounters Lambda

**GET /api/encounters/{id}**
- Purpose: Get detailed encounter information
- Path Parameters: `id` (encounter ID)
- Response: Full encounter object with verification and rating details
- Handler: GetEncounterById Lambda

**POST /api/encounters/{id}/rate**
- Purpose: Submit rating for an encounter
- Request Body:
  ```json
  {
    "deviceId": "string (UUID)",
    "rating": "number (1-5)"
  }
  ```
- Response: `{ "averageRating": number, "ratingCount": number }`
- Handler: RateEncounter Lambda

**POST /api/encounters/{id}/verify**
- Purpose: Verify encounter location with check-in
- Request Body:
  ```json
  {
    "location": {
      "latitude": "number",
      "longitude": "number"
    },
    "spookinessScore": "number (1-5)",
    "notes": "string (optional, max 500 chars)"
  }
  ```
- Response: `{ "verificationId": "string", "isTimeMatched": boolean }`
- Handler: VerifyLocation Lambda

#### Admin Endpoints

**GET /api/admin/encounters**
- Purpose: List pending encounters for review
- Query Parameters:
  - `nextToken`: string (pagination)
  - `limit`: number (default 20, max 100)
- Response: `{ "encounters": [Encounter], "nextToken": "string" }`
- Handler: AdminListPending Lambda

**PUT /api/admin/encounters/{id}/approve**
- Purpose: Approve encounter and trigger AI enhancement
- Path Parameters: `id` (encounter ID)
- Response: `{ "status": "approved", "encounterId": "string" }`
- Handler: AdminApprove Lambda

**PUT /api/admin/encounters/{id}/reject**
- Purpose: Reject encounter submission
- Path Parameters: `id` (encounter ID)
- Request Body (optional):
  ```json
  {
    "reason": "string (optional)"
  }
  ```
- Response: `{ "status": "rejected", "encounterId": "string" }`
- Handler: AdminReject Lambda

### Lambda Functions

#### API Handler Functions

**SubmitEncounter**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 10 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `MEDIA_BUCKET`: S3 bucket name
- Responsibilities:
  - Validate encounter data (field lengths, coordinate ranges)
  - Generate unique encounter ID (ULID)
  - Calculate geohash from coordinates (precision 6)
  - Store encounter in DynamoDB with status="pending"
  - Generate presigned S3 URLs for image uploads (15 min expiry)
  - Return encounter ID and upload URLs

**GetEncounters**
- Runtime: Node.js 20.x
- Memory: 1024 MB
- Timeout: 10 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
- Responsibilities:
  - Validate latitude/longitude parameters
  - Calculate geohash prefix for query optimization
  - Query DynamoDB GSI (status-encounterTime-index) with status="approved"
  - Filter results by distance using Haversine formula
  - Sort by distance ascending
  - Return paginated results

**GetEncounterById**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 5 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `VERIFICATIONS_TABLE`: DynamoDB table name
  - `RATINGS_TABLE`: DynamoDB table name
- Responsibilities:
  - Retrieve encounter by ID from DynamoDB
  - Return 404 if not found
  - Return 403 if status != "approved"
  - Query verifications and ratings for the encounter
  - Aggregate and return complete encounter details

**RateEncounter**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 5 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `RATINGS_TABLE`: DynamoDB table name
- Responsibilities:
  - Validate rating (1-5) and deviceId
  - Check for duplicate rating (composite key: encounterId + deviceId)
  - Return 409 if already rated
  - Store rating in Ratings table
  - Update encounter's average rating and count using atomic counter
  - Return updated rating statistics

**VerifyLocation**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 5 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `VERIFICATIONS_TABLE`: DynamoDB table name
- Responsibilities:
  - Validate spookinessScore (1-5) and location
  - Retrieve encounter to get original location
  - Calculate distance between verification and encounter location
  - Reject if distance > 100 meters
  - Check if verification time matches encounter time of day (±2 hours)
  - Store verification in Verifications table
  - Increment encounter's verificationCount
  - Return verification ID and time match status

**AdminListPending**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 10 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
- Responsibilities:
  - Query DynamoDB GSI (status-encounterTime-index) with status="pending"
  - Sort by encounterTime descending (newest first)
  - Implement pagination with nextToken
  - Return list of pending encounters

**AdminApprove**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 5 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `ENHANCEMENT_QUEUE_URL`: SQS queue URL
- Responsibilities:
  - Validate encounter exists
  - Update encounter status to "approved"
  - Publish message to SQS enhancement queue with encounter data
  - Return success response

**AdminReject**
- Runtime: Node.js 20.x
- Memory: 512 MB
- Timeout: 5 seconds
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
- Responsibilities:
  - Validate encounter exists
  - Update encounter status to "rejected"
  - Optionally store rejection reason
  - Return success response

#### Enhancement Pipeline Functions

**EnhancementOrchestrator**
- Runtime: Node.js 20.x
- Memory: 2048 MB (increased for multiple image processing)
- Timeout: 90 seconds (increased for multiple illustrations)
- Trigger: SQS enhancement queue
- Environment Variables:
  - `ENCOUNTERS_TABLE`: DynamoDB table name
  - `MEDIA_BUCKET`: S3 bucket name
  - `BEDROCK_REGION`: AWS region for Bedrock
  - `MIN_ILLUSTRATIONS`: 3 (minimum number of images)
  - `MAX_ILLUSTRATIONS`: 5 (maximum number of images)
- Responsibilities:
  - Receive encounter data from SQS
  - Orchestrate sequential AI enhancement steps (ALWAYS REQUIRED)
  - Generate narrative, multiple illustrations, and narration for ALL approved encounters
  - Handle errors and update status to "enhancement_failed" on failure
  - Update encounter record with all generated URLs on success

**GenerateNarrative**
- Runtime: Node.js 20.x
- Memory: 1024 MB
- Timeout: 15 seconds
- Environment Variables:
  - `BEDROCK_REGION`: AWS region
- Responsibilities:
  - Invoke Bedrock with Claude 3 Sonnet model
  - Use prompt template to transform original story into horror narrative
  - Maintain factual accuracy while adding atmospheric elements
  - Return enhanced narrative text (max 10,000 chars)

**GenerateIllustration**
- Runtime: Node.js 20.x
- Memory: 2048 MB
- Timeout: 60 seconds (increased for multiple images)
- Environment Variables:
  - `BEDROCK_REGION`: AWS region
  - `MEDIA_BUCKET`: S3 bucket name
- Responsibilities:
  - Parse enhanced narrative into 3-5 distinct scenes
  - Invoke Bedrock with Stable Diffusion XL model for each scene
  - Generate scene-specific prompts from enhanced narrative
  - Create 3-5 spooky illustrations (1024x1024 PNG each)
  - Save images to S3 at encounters/{id}/illustrations/{index}.png
  - Return array of CloudFront URLs
  - Maintain visual consistency across the image sequence

**GenerateNarration**
- Runtime: Node.js 20.x
- Memory: 1024 MB
- Timeout: 15 seconds
- Environment Variables:
  - `MEDIA_BUCKET`: S3 bucket name
- Responsibilities:
  - Invoke Polly with Neural voice (Matthew or Joanna)
  - Convert enhanced narrative to speech with SSML for dramatic pauses
  - Save MP3 to S3 at encounters/{id}/narration.mp3
  - Return CloudFront URL

### Utility Functions

**GeospatialUtils**
- Haversine distance calculation
- Geohash encoding/decoding (precision 6 = ~1.2km)
- Coordinate validation

**ValidationUtils**
- Input sanitization (XSS prevention)
- Field length validation
- Data type validation
- Coordinate range validation

**ErrorHandler**
- Standardized error response formatting
- Error logging to CloudWatch
- Error code mapping

## Data Models

### DynamoDB Tables

#### Encounters Table

**Primary Key:**
- Partition Key: `id` (String, ULID)

**Attributes:**
- `id`: String (ULID)
- `authorName`: String (max 100 chars)
- `location`: Map
  - `latitude`: Number
  - `longitude`: Number
  - `address`: String (optional)
  - `geohash`: String (precision 6)
- `originalStory`: String (max 5000 chars)
- `enhancedStory`: String (max 10000 chars, null until enhanced)
- `encounterTime`: String (ISO 8601)
- `status`: String (enum: "pending", "approved", "rejected", "enhancement_failed")
- `imageUrls`: List of Strings (user-uploaded images, optional)
- `illustrationUrls`: List of Strings (AI-generated illustrations, 3-5 images, null until enhanced)
- `narrationUrl`: String (null until enhanced)
- `rating`: Number (average, 1 decimal place)
- `ratingCount`: Number
- `verificationCount`: Number
- `createdAt`: String (ISO 8601)
- `updatedAt`: String (ISO 8601)

**Global Secondary Indexes:**

1. **status-encounterTime-index**
   - Partition Key: `status`
   - Sort Key: `encounterTime`
   - Projection: ALL
   - Purpose: Query encounters by status, sorted by time

2. **geohash-status-index**
   - Partition Key: `geohash`
   - Sort Key: `status`
   - Projection: ALL
   - Purpose: Geospatial queries with status filtering

**Capacity:**
- On-Demand billing mode for automatic scaling
- Point-in-time recovery enabled
- TTL not required (data retained indefinitely)

#### Verifications Table

**Primary Key:**
- Partition Key: `encounterId` (String)
- Sort Key: `verifiedAt` (String, ISO 8601)

**Attributes:**
- `id`: String (ULID)
- `encounterId`: String
- `location`: Map
  - `latitude`: Number
  - `longitude`: Number
- `spookinessScore`: Number (1-5)
- `notes`: String (optional, max 500 chars)
- `verifiedAt`: String (ISO 8601)
- `isTimeMatched`: Boolean
- `distanceMeters`: Number

**Capacity:**
- On-Demand billing mode

#### Ratings Table

**Primary Key:**
- Partition Key: `encounterId` (String)
- Sort Key: `deviceId` (String, UUID)

**Attributes:**
- `encounterId`: String
- `deviceId`: String (UUID)
- `rating`: Number (1-5)
- `ratedAt`: String (ISO 8601)

**Capacity:**
- On-Demand billing mode

### S3 Bucket Structure

**Bucket Name:** `ghostatlas-media-{environment}`

**Directory Structure:**
```
encounters/
  {encounterId}/
    images/
      {timestamp}-{originalFilename}  (user-uploaded, optional)
    illustrations/
      0.png  (AI-generated scene 1)
      1.png  (AI-generated scene 2)
      2.png  (AI-generated scene 3)
      3.png  (AI-generated scene 4, optional)
      4.png  (AI-generated scene 5, optional)
    narration.mp3
```

**Bucket Configuration:**
- Versioning: Enabled
- Encryption: AES-256 (SSE-S3)
- Public Access: Blocked (access via CloudFront only)
- CORS: Configured for Flutter app domain
- Lifecycle Policy:
  - Transition to Infrequent Access after 90 days
  - No expiration (data retained indefinitely)

**CloudFront Distribution:**
- Origin: S3 bucket
- Cache Behavior:
  - Default TTL: 86400 seconds (24 hours)
  - Min TTL: 0
  - Max TTL: 31536000 seconds (1 year)
- Compression: Enabled
- HTTPS Only: Required
- Price Class: Use All Edge Locations

### SQS Queue

**Queue Name:** `ghostatlas-enhancement-queue-{environment}`

**Configuration:**
- Message Retention: 14 days
- Visibility Timeout: 60 seconds
- Receive Wait Time: 20 seconds (long polling)
- Dead Letter Queue: `ghostatlas-enhancement-dlq-{environment}` (after 3 retries)
- Encryption: Enabled (SSE-SQS)

**Message Format:**
```json
{
  "encounterId": "string",
  "originalStory": "string",
  "location": {
    "latitude": "number",
    "longitude": "number"
  },
  "encounterTime": "string"
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Input validation rejects invalid data

*For any* encounter submission, rating, or verification request, if any field exceeds its maximum length (authorName > 100 chars, originalStory > 5000 chars, notes > 500 chars) or numeric value is outside valid range (coordinates, ratings, scores), then the system should reject the request with appropriate error message.

**Validates: Requirements 1.2, 1.3, 1.4, 2.2, 5.1, 6.1, 12.4**

### Property 2: Required fields are always present

*For any* encounter submission, the system should only accept requests that contain all required fields (authorName, location coordinates, originalStory, encounterTime), and all API responses should include their specified required fields.

**Validates: Requirements 1.1, 3.5, 4.4, 7.2**

### Property 3: Valid encounters are stored with pending status

*For any* valid encounter submission, the system should store the encounter in DynamoDB with status="pending" and return a unique encounter ID.

**Validates: Requirements 1.5**

### Property 4: Presigned URLs have correct expiration

*For any* image upload request, the generated presigned S3 URL should be valid for exactly 15 minutes from generation time.

**Validates: Requirements 2.1**

### Property 5: S3 paths follow naming conventions

*For any* media asset (user images, illustrations, narration), the S3 path should match the pattern "encounters/{encounterId}/{type}/{filename}" where type is "images", "illustration.png", or "narration.mp3".

**Validates: Requirements 2.3, 10.4, 11.1**

### Property 6: Encounter records are updated after upload

*For any* completed image upload, the encounter record should be updated with the CloudFront URL within the specified time limit.

**Validates: Requirements 2.5**

### Property 7: Geospatial queries return nearby encounters

*For any* location query with latitude and longitude, all returned encounters should be within the specified radius (default 50km) of the query location.

**Validates: Requirements 3.1**

### Property 8: Geospatial results are sorted by distance

*For any* geospatial query result set, encounters should be ordered by ascending distance from the query location.

**Validates: Requirements 3.2**

### Property 9: Status filtering excludes inappropriate encounters

*For any* public API query, only encounters with status="approved" should be returned; admin queries should filter by status="pending"; rejected encounters should never appear in public results.

**Validates: Requirements 3.3, 4.3, 7.1, 9.5**

### Property 10: Duplicate ratings are prevented

*For any* deviceId and encounterId combination, if a rating already exists, subsequent rating attempts should return HTTP 409 with "Already rated" message.

**Validates: Requirements 5.2, 5.3**

### Property 11: Average ratings are calculated correctly

*For any* set of ratings for an encounter, the average rating should equal the sum of all ratings divided by the count, rounded to one decimal place.

**Validates: Requirements 5.4, 5.5**

### Property 12: Verification distance is validated

*For any* verification submission, the system should calculate the distance between verification location and encounter location using Haversine formula, and reject verifications more than 100 meters away.

**Validates: Requirements 6.2, 6.3**

### Property 13: Time matching uses 2-hour window

*For any* verification submission, the system should determine isTimeMatched=true if the verification time is within 2 hours of the encounter's time of day, otherwise isTimeMatched=false.

**Validates: Requirements 6.4**

### Property 14: Verification increments counter

*For any* successful verification submission, the encounter's verificationCount should increase by exactly 1.

**Validates: Requirements 6.5**

### Property 15: Pagination works correctly

*For any* admin list query with more than 20 pending encounters, the response should include a nextToken, and using that token should return the next page of results without duplicates or gaps.

**Validates: Requirements 7.4, 7.5**

### Property 16: Approval updates status and triggers enhancement

*For any* encounter approval, the encounter status should be updated to "approved" and a message containing the encounter ID and data should be published to the enhancement queue.

**Validates: Requirements 8.1, 8.2, 8.3**

### Property 17: Rejection updates status without triggering enhancement

*For any* encounter rejection, the encounter status should be updated to "rejected" and no message should be published to the enhancement queue.

**Validates: Requirements 9.1, 9.2**

### Property 18: Enhancement pipeline invokes all AI services

*For any* approved encounter in the enhancement queue, the pipeline should invoke Bedrock for narrative generation, Bedrock for multiple illustration generation (3-5 images), and Polly for narration generation in sequence, regardless of whether user-uploaded images exist.

**Validates: Requirements 10.1, 10.3, 10.4, 10.5, 10.6, 10.7**

### Property 19: Enhancement updates encounter with all media URLs

*For any* completed enhancement pipeline execution, the encounter record should be updated with enhancedStory text, illustrationUrls array (containing 3-5 URLs), and narrationUrl.

**Validates: Requirements 11.3**

### Property 24: Multiple illustrations are generated

*For any* approved encounter, the enhancement pipeline should generate between 3 and 5 illustrations representing different scenes from the enhanced narrative.

**Validates: Requirements 10.4, 10.5**

### Property 20: Enhancement errors update status to failed

*For any* enhancement pipeline execution that encounters an error, the encounter status should be updated to "enhancement_failed" and the error should be logged.

**Validates: Requirements 11.5**

### Property 21: Input sanitization prevents injection attacks

*For any* request payload containing special characters or script tags, the system should sanitize the input to prevent SQL injection and XSS attacks before processing.

**Validates: Requirements 12.3**

### Property 22: Error responses follow standard format

*For any* error condition, the system should return a response containing errorCode, message, and timestamp fields.

**Validates: Requirements 12.5**

### Property 23: Geohash is calculated correctly

*For any* location with latitude and longitude, the stored geohash should accurately represent the location at precision 6 (approximately 1.2km grid).

**Validates: Requirements 13.2**

## Error Handling

### Error Categories

**Validation Errors (400 Bad Request):**
- Missing required fields
- Invalid field lengths
- Invalid coordinate ranges
- Invalid rating/score values
- Invalid file types or sizes

**Authorization Errors (403 Forbidden):**
- Accessing non-approved encounters via public API
- Invalid presigned URL signatures

**Not Found Errors (404 Not Found):**
- Encounter ID does not exist
- Invalid API endpoint

**Conflict Errors (409 Conflict):**
- Duplicate rating from same deviceId
- Concurrent modification conflicts

**Rate Limiting Errors (429 Too Many Requests):**
- Exceeded 100 requests per minute per IP
- Includes Retry-After header

**Server Errors (500 Internal Server Error):**
- DynamoDB operation failures
- S3 operation failures
- Bedrock/Polly invocation failures
- Unexpected exceptions

### Error Response Format

All errors follow a standardized JSON format:

```json
{
  "errorCode": "VALIDATION_ERROR",
  "message": "Author name exceeds maximum length of 100 characters",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "abc123-def456"
}
```

### Error Handling Strategy

**Lambda Functions:**
- Wrap all operations in try-catch blocks
- Log errors to CloudWatch with context
- Return appropriate HTTP status codes
- Include request ID for tracing

**Enhancement Pipeline:**
- Implement retry logic with exponential backoff
- Use SQS Dead Letter Queue after 3 failed attempts
- Update encounter status to "enhancement_failed" on persistent errors
- Send CloudWatch alarms for DLQ messages

**DynamoDB Operations:**
- Handle ProvisionedThroughputExceededException with exponential backoff
- Use conditional writes to prevent race conditions
- Implement optimistic locking for concurrent updates

**S3 Operations:**
- Validate presigned URL expiration before use
- Handle NoSuchKey errors gracefully
- Retry transient failures up to 3 times

**AI Service Invocations:**
- Set appropriate timeouts (Bedrock: 30s, Polly: 15s)
- Handle throttling errors with exponential backoff
- Validate response formats before processing
- Log all AI service requests and responses for debugging

## Testing Strategy

### Unit Testing

The backend will use **Jest** as the testing framework for Node.js Lambda functions. Unit tests will cover:

**Validation Logic:**
- Test coordinate validation with boundary values (-90, 90, -91, 91)
- Test field length validation with exact limits (100, 101 chars)
- Test input sanitization with XSS and SQL injection payloads
- Test file type validation with various MIME types

**Business Logic:**
- Test Haversine distance calculation with known coordinate pairs
- Test geohash encoding/decoding with various precision levels
- Test average rating calculation with different rating sets
- Test time matching logic with various time differences

**Error Handling:**
- Test error response formatting for all error types
- Test DynamoDB error handling (throttling, not found)
- Test S3 error handling (invalid key, access denied)
- Test AI service error handling (timeout, invalid response)

**Integration Points:**
- Test DynamoDB operations with local DynamoDB
- Test S3 operations with LocalStack
- Test SQS message publishing and consumption
- Mock Bedrock and Polly for AI service tests

### Property-Based Testing

The backend will use **fast-check** for property-based testing in JavaScript. Property tests will verify universal correctness properties across randomly generated inputs.

**Configuration:**
- Minimum 100 iterations per property test
- Seed-based reproducibility for failed tests
- Shrinking enabled to find minimal failing cases

**Property Test Coverage:**

Each property-based test will be tagged with a comment referencing the design document property:

```javascript
// Feature: ghostatlas-aws-backend, Property 1: Input validation rejects invalid data
test('property: input validation rejects invalid data', () => {
  fc.assert(
    fc.property(
      fc.record({
        authorName: fc.string(),
        originalStory: fc.string(),
        // ... other fields
      }),
      (encounter) => {
        const result = validateEncounter(encounter);
        if (encounter.authorName.length > 100 || 
            encounter.originalStory.length > 5000) {
          expect(result.isValid).toBe(false);
        }
      }
    ),
    { numRuns: 100 }
  );
});
```

**Property Test Generators:**

Custom generators will be created for domain objects:

- `arbitraryCoordinate()`: Generates valid and invalid lat/lon pairs
- `arbitraryEncounter()`: Generates encounter objects with various field combinations
- `arbitraryRating()`: Generates ratings from 1-5 and invalid values
- `arbitraryLocation()`: Generates location objects with coordinates
- `arbitraryDeviceId()`: Generates UUID device identifiers
- `arbitraryGeohash()`: Generates geohash strings at various precisions

**Critical Properties to Test:**

1. **Property 1 (Input Validation)**: Generate encounters with random field lengths and values, verify rejection of invalid data
2. **Property 7 (Geospatial Queries)**: Generate random locations and encounters, verify distance filtering
3. **Property 8 (Distance Sorting)**: Generate random encounter sets, verify sort order
4. **Property 11 (Rating Calculation)**: Generate random rating sets, verify average calculation
5. **Property 12 (Distance Validation)**: Generate random verification locations, verify 100m threshold
6. **Property 23 (Geohash Calculation)**: Generate random coordinates, verify geohash accuracy

### Integration Testing

Integration tests will verify end-to-end workflows:

**Encounter Submission Flow:**
1. Submit encounter via API
2. Verify DynamoDB record created with status="pending"
3. Upload image using presigned URL
4. Verify encounter updated with image URL

**Approval & Enhancement Flow:**
1. Create pending encounter
2. Approve via admin API
3. Verify SQS message published
4. Verify enhancement pipeline processes message
5. Verify encounter updated with AI-generated content

**Geospatial Query Flow:**
1. Create multiple encounters at known locations
2. Query with specific coordinates
3. Verify correct encounters returned
4. Verify distance sorting

**Rating Flow:**
1. Submit rating for encounter
2. Verify rating stored in Ratings table
3. Verify encounter average updated
4. Attempt duplicate rating
5. Verify 409 conflict response

### Load Testing

Load tests will use **Artillery** to verify performance requirements:

- 100 concurrent users submitting encounters
- Geospatial queries with 100+ encounters complete in <3 seconds
- Rate limiting triggers at 100 requests/minute
- Enhancement pipeline completes within 30 seconds

### Infrastructure Testing

Infrastructure will be validated using **AWS CDK assertions**:

- Verify DynamoDB table schemas and indexes
- Verify S3 bucket policies and CORS configuration
- Verify Lambda function configurations (memory, timeout)
- Verify API Gateway rate limiting settings
- Verify CloudFront distribution configuration

## AI Enhancement Pipeline Details

### Narrative Generation (Bedrock - Claude 3 Sonnet)

**Prompt Template:**
```
You are a master horror storyteller. Transform the following paranormal encounter into an atmospheric horror narrative while maintaining all factual details (location, time, people involved).

Original Story:
{originalStory}

Location: {location}
Time: {encounterTime}

Requirements:
- Maintain all factual details from the original story
- Add atmospheric horror elements (sensory details, tension, dread)
- Use vivid, evocative language
- Keep the narrative between 500-2000 words
- End with a chilling conclusion

Enhanced Horror Narrative:
```

**Model Configuration:**
- Model: `anthropic.claude-3-sonnet-20240229-v1:0`
- Max Tokens: 4096
- Temperature: 0.7 (creative but consistent)
- Top P: 0.9

**Error Handling:**
- Timeout: 15 seconds
- Retry: 2 attempts with exponential backoff
- Fallback: Use original story if enhancement fails

### Illustration Generation (Bedrock - Stable Diffusion XL)

**Multi-Image Story Sequence:**
The system generates 3-5 illustrations representing different scenes from the enhanced narrative to create a video-like storytelling experience.

**Scene Extraction:**
1. Parse enhanced narrative into key scenes (beginning, middle, climax, resolution)
2. Extract visual elements for each scene
3. Generate 3-5 distinct prompts for sequential storytelling

**Prompt Generation Template:**
```
Scene {index}: A dark, atmospheric horror scene: {key_elements_from_scene}. 
Cinematic lighting, moody shadows, eerie atmosphere, photorealistic style, 
high detail, unsettling mood, paranormal activity, {location_description}.
Negative prompt: cartoon, anime, bright colors, cheerful, low quality, text, watermark
```

**Model Configuration:**
- Model: `stability.stable-diffusion-xl-v1`
- Image Size: 1024x1024
- CFG Scale: 7.0
- Steps: 50
- Seed: Consistent across scenes for visual coherence

**Generation Strategy:**
- Generate 3 images minimum (beginning, middle, end)
- Generate up to 5 images for longer narratives
- Each image represents a distinct scene or moment
- Maintain visual consistency across the sequence

**Post-Processing:**
- Convert to PNG format
- Optimize for web delivery (<500KB per image)
- Add subtle scene numbers (optional)
- Ensure consistent aspect ratio for video compilation

**Error Handling:**
- Timeout: 15 seconds per image
- Retry: 2 attempts per image
- Fallback: Generate minimum 3 images, skip failed scenes
- If all fail, mark enhancement as failed

### Narration Generation (Polly - Neural Voice)

**Voice Selection:**
- Primary: Matthew (Neural, US English, male, deep voice)
- Alternative: Joanna (Neural, US English, female, clear voice)

**SSML Template:**
```xml
<speak>
  <amazon:domain name="conversational">
    <prosody rate="95%" pitch="-5%">
      {enhancedStory}
    </prosody>
  </amazon:domain>
  <break time="1s"/>
</speak>
```

**Configuration:**
- Engine: Neural
- Output Format: MP3
- Sample Rate: 24000 Hz
- Text Type: SSML

**Processing:**
- Split long narratives into chunks (<3000 chars per request)
- Concatenate audio files if multiple chunks
- Normalize audio levels

**Error Handling:**
- Timeout: 15 seconds per chunk
- Retry: 2 attempts
- Fallback: Skip narration if generation fails

### Enhancement Orchestration

The EnhancementOrchestrator Lambda coordinates all enhancement steps. **All enhancements are mandatory** - narrative, illustrations, and narration are always generated regardless of user-uploaded images.

```javascript
async function enhanceEncounter(encounter) {
  try {
    // Step 1: Generate narrative (10s) - ALWAYS REQUIRED
    const enhancedStory = await generateNarrative(encounter);
    
    // Step 2: Generate multiple illustrations (45s) - ALWAYS REQUIRED
    // Generate 3-5 images for video-like storytelling
    const illustrationUrls = await generateMultipleIllustrations(
      enhancedStory, 
      encounter,
      { minImages: 3, maxImages: 5 }
    );
    
    // Step 3: Generate narration (10s) - ALWAYS REQUIRED
    const narrationUrl = await generateNarration(enhancedStory);
    
    // Step 4: Update encounter record with all generated content
    await updateEncounter(encounter.id, {
      enhancedStory,
      illustrationUrls,  // Array of 3-5 URLs
      narrationUrl,
      status: 'approved'
    });
    
    return { success: true };
  } catch (error) {
    await updateEncounter(encounter.id, {
      status: 'enhancement_failed',
      errorMessage: error.message
    });
    throw error;
  }
}
```

**Timeout Management:**
- Total Lambda timeout: 90 seconds (increased for multiple images)
- Narrative generation: 15 seconds
- Illustration generation: 15 seconds per image (45s total for 3 images)
- Narration generation: 15 seconds
- Buffer time: 10 seconds for DynamoDB updates and overhead

**Monitoring:**
- CloudWatch metrics for each enhancement step
- Alarms for enhancement failures >5% in 5 minutes
- X-Ray tracing for performance analysis

## Infrastructure as Code

### Technology Choice

The backend will use **AWS CDK (Cloud Development Kit)** with TypeScript for infrastructure as code. CDK provides:
- Type-safe infrastructure definitions
- Higher-level constructs for common patterns
- Easy integration with CI/CD pipelines
- Better IDE support and refactoring capabilities

### CDK Stack Structure

```
ghostatlas-backend/
├── lib/
│   ├── ghostatlas-backend-stack.ts (main stack)
│   ├── constructs/
│   │   ├── api-gateway-construct.ts
│   │   ├── lambda-functions-construct.ts
│   │   ├── dynamodb-tables-construct.ts
│   │   ├── s3-buckets-construct.ts
│   │   ├── cloudfront-construct.ts
│   │   └── enhancement-pipeline-construct.ts
├── lambda/
│   ├── api-handlers/
│   ├── enhancement-pipeline/
│   └── shared/
├── test/
│   ├── unit/
│   ├── integration/
│   └── property/
└── cdk.json
```

### Resource Tagging

All resources will be tagged with:
- `Environment`: dev | staging | prod
- `Project`: ghostatlas
- `CostCenter`: mobile-apps
- `ManagedBy`: cdk
- `Component`: api | storage | enhancement | cdn

### Environment Configuration

Separate configurations for each environment:

**Development:**
- DynamoDB: On-Demand
- Lambda: 512 MB memory
- CloudFront: Disabled (direct S3 access)
- Bedrock: Reduced quotas

**Staging:**
- DynamoDB: On-Demand
- Lambda: 1024 MB memory
- CloudFront: Enabled
- Bedrock: Standard quotas

**Production:**
- DynamoDB: On-Demand with auto-scaling
- Lambda: Optimized memory per function
- CloudFront: Enabled with multiple edge locations
- Bedrock: Increased quotas
- Multi-AZ deployment
- Enhanced monitoring and alarms

### Deployment Pipeline

**CI/CD Workflow:**
1. Code commit triggers GitHub Actions
2. Run unit tests and property tests
3. Run CDK synth to generate CloudFormation
4. Deploy to dev environment
5. Run integration tests
6. Manual approval for staging
7. Deploy to staging
8. Run smoke tests
9. Manual approval for production
10. Deploy to production with blue/green strategy

### Security Considerations

**IAM Roles:**
- Principle of least privilege for all Lambda functions
- Separate roles for API handlers vs enhancement pipeline
- S3 bucket policies restrict access to CloudFront OAI
- DynamoDB table policies restrict access to specific Lambda roles

**Secrets Management:**
- API keys stored in AWS Secrets Manager
- Automatic rotation for sensitive credentials
- Environment-specific secrets

**Network Security:**
- API Gateway with AWS WAF for DDoS protection
- Lambda functions in VPC (optional for enhanced security)
- S3 bucket encryption at rest (AES-256)
- CloudFront with HTTPS only

**Monitoring & Alerting:**
- CloudWatch Logs for all Lambda functions
- CloudWatch Alarms for error rates, latency, throttling
- X-Ray tracing for distributed request tracking
- SNS notifications for critical alerts

## Performance Optimization

### DynamoDB Optimization

**Access Patterns:**
1. Get encounter by ID (primary key)
2. List encounters by status (GSI: status-encounterTime-index)
3. Query encounters by location (geohash prefix + filter)
4. Get verifications for encounter (partition key: encounterId)
5. Check rating exists (composite key: encounterId + deviceId)

**Capacity Planning:**
- On-Demand mode for unpredictable traffic
- Monitor consumed capacity and switch to Provisioned if traffic becomes predictable
- Enable DynamoDB Accelerator (DAX) for read-heavy workloads if needed

**Query Optimization:**
- Use sparse indexes to reduce index size
- Project only required attributes in GSI
- Use parallel scans for geospatial queries if dataset grows large
- Implement caching layer (ElastiCache) for frequently accessed encounters

### Lambda Optimization

**Cold Start Mitigation:**
- Use Lambda SnapStart for faster initialization
- Keep deployment packages small (<10 MB)
- Minimize dependencies
- Use Lambda layers for shared code

**Memory Allocation:**
- Profile functions to find optimal memory (CPU scales with memory)
- Start with 512 MB and adjust based on CloudWatch metrics
- Enhancement functions need 1024-2048 MB for AI operations

**Concurrency:**
- Set reserved concurrency for critical functions
- Use provisioned concurrency for latency-sensitive endpoints
- Monitor throttling metrics and adjust limits

### S3 & CloudFront Optimization

**S3 Transfer Acceleration:**
- Enable for faster uploads from mobile clients
- Use multipart upload for files >5 MB

**CloudFront Caching:**
- Cache media assets for 24 hours (86400s)
- Use query string forwarding for dynamic content
- Enable compression for text-based responses
- Use Lambda@Edge for custom caching logic if needed

**Image Optimization:**
- Compress images before upload (client-side)
- Use WebP format for better compression
- Generate thumbnails for list views
- Implement lazy loading in mobile app

### API Gateway Optimization

**Caching:**
- Enable API Gateway caching for GET endpoints
- Cache TTL: 300 seconds (5 minutes) for encounter lists
- Invalidate cache on encounter updates

**Request Validation:**
- Use API Gateway request validators to reject invalid requests early
- Reduces Lambda invocations for malformed requests

**Throttling:**
- Set burst limit: 200 requests
- Set rate limit: 100 requests per second
- Use usage plans for different client tiers if needed

## Cost Estimation

### Monthly Cost Breakdown (Production - 10,000 active users)

**Assumptions:**
- 1,000 encounter submissions per month
- 500 approvals per month (50% approval rate)
- 100,000 encounter queries per month
- 10,000 ratings per month
- 5,000 verifications per month

**DynamoDB:**
- On-Demand pricing
- Encounters table: ~$5/month (1M reads, 10K writes)
- Verifications table: ~$2/month
- Ratings table: ~$2/month
- **Total: ~$9/month**

**Lambda:**
- API handlers: ~$10/month (1M invocations, 512 MB, 200ms avg)
- Enhancement pipeline: ~$80/month (500 invocations, 2048 MB, 60s avg)
- **Total: ~$90/month**

**S3:**
- Storage: ~$5/month (100 GB)
- Requests: ~$2/month
- **Total: ~$7/month**

**CloudFront:**
- Data transfer: ~$20/month (200 GB)
- Requests: ~$5/month (1M requests)
- **Total: ~$25/month**

**Bedrock:**
- Claude 3 Sonnet: ~$30/month (500 invocations, 2K tokens avg)
- Stable Diffusion XL: ~$200/month (2000 images - 4 images per encounter avg)
- **Total: ~$230/month**

**Polly:**
- Neural voices: ~$20/month (500 narrations, 2K chars avg)
- **Total: ~$20/month**

**API Gateway:**
- REST API: ~$3.50/month (1M requests)
- **Total: ~$3.50/month**

**Other Services:**
- SQS: ~$1/month
- CloudWatch: ~$5/month
- Secrets Manager: ~$1/month
- **Total: ~$7/month**

**Grand Total: ~$391.50/month**

### Cost Optimization Strategies

1. **Use S3 Intelligent-Tiering** for automatic cost optimization
2. **Implement caching** to reduce Lambda invocations and DynamoDB reads
3. **Optimize Lambda memory** based on profiling to reduce costs
4. **Use CloudFront regional edge caches** to reduce origin requests
5. **Batch AI operations** if possible to reduce per-invocation costs
6. **Monitor and set budgets** with AWS Budgets and Cost Anomaly Detection

## Deployment Checklist

### Pre-Deployment

- [ ] Review and approve infrastructure code
- [ ] Run all unit tests and property tests
- [ ] Run integration tests in dev environment
- [ ] Perform security scan (AWS Security Hub, Snyk)
- [ ] Review IAM policies for least privilege
- [ ] Validate environment variables and secrets
- [ ] Test disaster recovery procedures

### Deployment

- [ ] Deploy to dev environment
- [ ] Run smoke tests
- [ ] Deploy to staging environment
- [ ] Run full integration test suite
- [ ] Perform load testing
- [ ] Get stakeholder approval
- [ ] Deploy to production with blue/green strategy
- [ ] Monitor CloudWatch metrics for 1 hour
- [ ] Verify all alarms are configured

### Post-Deployment

- [ ] Update API documentation
- [ ] Notify mobile app team of new endpoints
- [ ] Monitor error rates and latency
- [ ] Review CloudWatch Logs for issues
- [ ] Verify cost tracking tags
- [ ] Schedule post-deployment review meeting

## Future Enhancements

### Phase 2 Features

1. **User Authentication**: Add Cognito for user accounts and personalized experiences
2. **Social Features**: Comments, likes, and sharing for encounters
3. **Advanced Search**: Full-text search with OpenSearch for story content
4. **Notifications**: Push notifications for nearby encounters and updates
5. **Analytics**: User behavior tracking and encounter popularity metrics

### Scalability Improvements

1. **Global Distribution**: Multi-region deployment for lower latency
2. **Read Replicas**: DynamoDB Global Tables for cross-region replication
3. **Caching Layer**: ElastiCache for frequently accessed data
4. **GraphQL API**: Migrate to AppSync for more flexible queries
5. **Real-time Updates**: WebSocket support for live encounter updates

### AI Enhancements

1. **Personalized Narratives**: Tailor horror style to user preferences
2. **Voice Cloning**: Use user's voice for narration
3. **Video Generation**: Create short video clips from encounters
4. **Sentiment Analysis**: Analyze story sentiment for better categorization
5. **Duplicate Detection**: Use embeddings to detect similar encounters
