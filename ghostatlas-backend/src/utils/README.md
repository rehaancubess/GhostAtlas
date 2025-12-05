# GhostAtlas Backend Utilities

This directory contains shared utility functions used throughout the GhostAtlas AWS Backend.

## Modules

### Geospatial Utilities (`geospatial.ts`)

Provides functions for working with geographic coordinates and geohashing.

**Functions:**
- `validateCoordinates(latitude, longitude)` - Validates coordinate ranges (-90 to 90 for lat, -180 to 180 for lon)
- `calculateDistance(lat1, lon1, lat2, lon2)` - Calculates distance between two points using Haversine formula (returns meters)
- `encodeGeohash(latitude, longitude, precision)` - Encodes coordinates to geohash string (default precision: 6)
- `decodeGeohash(geohash)` - Decodes geohash string to latitude/longitude coordinates
- `getGeohashPrefixForRadius(latitude, longitude, radiusKm)` - Determines optimal geohash prefix length for query radius

**Usage Example:**
```typescript
import { calculateDistance, encodeGeohash } from './utils';

// Calculate distance between two locations
const distance = calculateDistance(40.7128, -74.0060, 34.0522, -118.2437);
console.log(`Distance: ${distance} meters`);

// Encode location to geohash
const geohash = encodeGeohash(45.5, -122.6, 6);
console.log(`Geohash: ${geohash}`); // e.g., "c20ff5"
```

### Validation Utilities (`validation.ts`)

Provides input validation and sanitization functions.

**Functions:**
- `sanitizeInput(input)` - Removes HTML tags and escapes special characters to prevent XSS
- `validateFieldLength(value, maxLength, fieldName)` - Validates string length against maximum
- `validateRequiredField(value, fieldName)` - Validates that required field is present and not empty
- `validateCoordinateRange(latitude, longitude)` - Validates coordinate ranges with detailed error messages
- `validateFileType(filename, mimeType)` - Validates file type for image uploads (JPEG, PNG, WebP)
- `validateRating(rating)` - Validates rating value (1-5 integer)
- `validateSpookinessScore(score)` - Validates spookiness score (1-5 integer)
- `validateEncounterSubmission(data)` - Validates complete encounter submission data

**Usage Example:**
```typescript
import { sanitizeInput, validateEncounterSubmission } from './utils';

// Sanitize user input
const cleanInput = sanitizeInput('<script>alert("xss")</script>Hello');
console.log(cleanInput); // "Hello"

// Validate encounter submission
const result = validateEncounterSubmission({
  authorName: 'John Doe',
  originalStory: 'I saw a ghost...',
  encounterTime: '2024-01-15T10:30:00Z',
  location: { latitude: 45.5, longitude: -122.6 }
});

if (!result.isValid) {
  console.error('Validation errors:', result.errors);
}
```

### Error Handler Utilities (`errorHandler.ts`)

Provides standardized error handling, logging, and response formatting.

**Error Codes:**
- `VALIDATION_ERROR` (400)
- `INVALID_REQUEST` (400)
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `ALREADY_EXISTS` (409)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)
- `SERVICE_UNAVAILABLE` (503)
- `DATABASE_ERROR` (500)
- `STORAGE_ERROR` (500)
- `AI_SERVICE_ERROR` (500)

**Functions:**
- `createErrorResponse(errorCode, message, requestId)` - Creates standardized error response object
- `createErrorApiResponse(errorCode, message, requestId)` - Creates API Gateway error response
- `createSuccessApiResponse(data, statusCode)` - Creates API Gateway success response
- `logError(error, context, requestId)` - Logs error to CloudWatch with context
- `logWarning(message, context, requestId)` - Logs warning to CloudWatch
- `logInfo(message, context, requestId)` - Logs info to CloudWatch
- `mapAwsErrorToErrorCode(error)` - Maps AWS SDK errors to application error codes
- `handleLambdaError(error, context, requestId)` - Handles Lambda errors with logging and response
- `createRateLimitResponse(retryAfterSeconds, requestId)` - Creates rate limit error response with Retry-After header

**Usage Example:**
```typescript
import { createErrorApiResponse, handleLambdaError, ErrorCode } from './utils';

// In a Lambda function
try {
  // ... your code
} catch (error) {
  return handleLambdaError(error, { function: 'SubmitEncounter' }, requestId);
}

// Create custom error response
return createErrorApiResponse(
  ErrorCode.NOT_FOUND,
  'Encounter not found',
  requestId
);
```

### Types (`types.ts`)

Defines TypeScript interfaces and types used throughout the application.

**Key Types:**
- `Location` - Geographic location with coordinates and optional geohash
- `Encounter` - Paranormal encounter record
- `EncounterStatus` - Status enum: 'pending' | 'approved' | 'rejected' | 'enhancement_failed'
- `Verification` - Location verification record
- `Rating` - User rating record
- `ApiResponse` - API Gateway response format
- `ErrorResponse` - Standardized error response format
- `EnhancementMessage` - SQS message format for enhancement pipeline

## Testing

Unit tests are located in `test/unit/utils.test.ts`. Run tests with:

```bash
npm test -- --testPathPattern=utils.test.ts
```

## Requirements Coverage

These utilities implement the following requirements:

- **Requirement 1.2, 1.3, 1.4**: Field length and coordinate validation
- **Requirement 3.1**: Geospatial distance calculation
- **Requirement 6.2, 6.3**: Verification distance validation
- **Requirement 12.3**: Input sanitization for XSS prevention
- **Requirement 12.4**: File type validation
- **Requirement 12.5**: Standardized error response formatting
- **Requirement 13.2**: Geohash encoding for spatial queries
