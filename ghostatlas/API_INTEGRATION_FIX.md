# API Integration Fix - Submit Encounter

## Issue
The submit story feature was returning a 400 error: "Invalid JSON in request body"

## Root Cause
The Flutter app was sending multipart form data, but the AWS backend expects:
1. JSON request with encounter metadata + `imageCount`
2. Returns presigned S3 URLs
3. Client uploads images directly to S3 using those URLs

## Solution

### Updated `submitEncounter` Method

The method now follows a two-step process:

**Step 1: Submit Encounter Metadata**
```dart
POST /api/encounters
{
  "authorName": "John Doe",
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "originalStory": "I saw a ghost...",
  "encounterTime": "2024-01-15T10:30:00Z",
  "imageCount": 2
}
```

**Response:**
```json
{
  "encounterId": "01HQXYZ...",
  "uploadUrls": [
    "https://s3.amazonaws.com/...",
    "https://s3.amazonaws.com/..."
  ]
}
```

**Step 2: Upload Images to S3**
- Uses presigned URLs from step 1
- Direct PUT requests to S3
- No API Gateway involved

### Code Changes

**Before:**
```dart
// Sent multipart form data
var request = http.MultipartRequest('POST', uri);
request.fields['authorName'] = submission.authorName;
// ... added images as multipart files
```

**After:**
```dart
// Step 1: Submit JSON
final requestBody = {
  'authorName': submission.authorName,
  'location': {
    'latitude': submission.location.latitude,
    'longitude': submission.location.longitude,
  },
  'originalStory': submission.storyText,
  'encounterTime': submission.encounterTime.toIso8601String(),
  'imageCount': submission.images.length,
};

final response = await _postWithRetry('/api/encounters', requestBody);
final responseData = jsonDecode(response.body);

// Step 2: Upload images to S3
await _uploadImagesToS3(submission.images, responseData['uploadUrls']);
```

## Benefits

1. **Follows AWS Best Practices**: Direct S3 uploads reduce API Gateway load
2. **Better Performance**: Images don't go through Lambda (10MB limit)
3. **Cost Effective**: Reduces Lambda execution time and data transfer
4. **Scalable**: S3 handles large files better than API Gateway

## Testing

Test the fix:
```bash
cd ghostatlas
flutter run
```

1. Navigate to "Submit Story"
2. Fill in all fields
3. Add 1-2 images
4. Submit
5. Should see success message

## Backend Compatibility

The backend expects this exact format:
- `authorName`: string (max 100 chars)
- `location.latitude`: number (-90 to 90)
- `location.longitude`: number (-180 to 180)
- `originalStory`: string (max 5000 chars)
- `encounterTime`: ISO 8601 timestamp
- `imageCount`: number (0-5)

## Error Handling

The updated method handles:
- Network errors (auto-retry)
- Invalid JSON responses
- S3 upload failures
- Image size validation (10MB max)

All errors are caught and displayed to the user with friendly messages.
