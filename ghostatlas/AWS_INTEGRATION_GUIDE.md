# AWS Backend Integration Guide

## Overview

The GhostAtlas Flutter app is now integrated with the AWS backend deployed on API Gateway.

## Configuration

### API Endpoints

The app uses environment-based configuration located in `lib/config/api_config.dart`:

- **Dev Environment**: `https://yj3dszj0vh.execute-api.us-east-1.amazonaws.com/dev`
- **CDN (Media)**: `https://d3r1sqvpmvqwaa.cloudfront.net`

### Switching Environments

To switch between environments, edit `lib/config/api_config.dart`:

```dart
static const Environment currentEnvironment = Environment.dev; // Change this
```

Available environments:
- `Environment.dev` - Development (currently deployed)
- `Environment.staging` - Staging (update URL when deployed)
- `Environment.production` - Production (update URL when deployed)
- `Environment.local` - Local development

## API Service

The `ApiService` class (`lib/services/api_service.dart`) handles all backend communication:

### Available Methods

#### Public Endpoints

1. **Get Encounters**
   ```dart
   final encounters = await apiService.getEncounters(status: 'approved');
   ```

2. **Get Nearby Encounters**
   ```dart
   final nearby = await apiService.getNearbyEncounters(
     latitude: 40.7128,
     longitude: -74.0060,
     radiusKm: 50.0,
   );
   ```

3. **Get Encounter by ID**
   ```dart
   final encounter = await apiService.getEncounterById('encounter-id');
   ```

4. **Submit Encounter**
   ```dart
   final submission = EncounterSubmission(
     authorName: 'John Doe',
     location: LatLng(40.7128, -74.0060),
     storyText: 'I saw a ghost...',
     encounterTime: DateTime.now(),
     images: [File('path/to/image.jpg')],
   );
   final encounter = await apiService.submitEncounter(submission);
   ```

5. **Rate Encounter**
   ```dart
   await apiService.rateEncounter('encounter-id', 1); // 1 for upvote, -1 for downvote
   ```

6. **Verify Encounter**
   ```dart
   final verification = Verification(
     location: LatLng(40.7128, -74.0060),
     spookinessScore: 5,
     notes: 'Very spooky!',
   );
   await apiService.verifyEncounter('encounter-id', verification);
   ```

#### Admin Endpoints

1. **Get Pending Encounters**
   ```dart
   final pending = await apiService.getPendingEncounters();
   ```

2. **Approve Encounter**
   ```dart
   await apiService.approveEncounter('encounter-id');
   ```

3. **Reject Encounter**
   ```dart
   await apiService.rejectEncounter('encounter-id');
   ```

## Error Handling

The API service includes comprehensive error handling:

```dart
try {
  final encounters = await apiService.getEncounters();
  // Handle success
} on ApiException catch (e) {
  // Handle API errors
  print('API Error: ${e.message}');
  if (e.statusCode == 404) {
    // Handle not found
  } else if (e.statusCode == 500) {
    // Handle server error
  }
} catch (e) {
  // Handle unexpected errors
  print('Unexpected error: $e');
}
```

## Features

### Automatic Retry Logic
- Automatically retries failed requests up to 3 times
- Exponential backoff between retries
- Handles network errors gracefully

### Request Timeout
- 30-second timeout for all requests
- Prevents hanging requests

### Error Messages
- User-friendly error messages
- Network connectivity detection
- Server error handling

## Testing the Integration

### 1. Test API Connectivity

Run the app and check if it can fetch encounters:

```bash
cd ghostatlas
flutter run
```

### 2. Test Submission Flow

1. Navigate to the "Submit Story" screen
2. Fill in the form with test data
3. Submit and verify it appears in the admin panel

### 3. Test Admin Panel

1. Navigate to the admin panel
2. Verify pending encounters appear
3. Test approve/reject functionality

## AWS Resources

### Deployed Resources

- **API Gateway ID**: `yj3dszj0vh`
- **Region**: `us-east-1`
- **Stage**: `dev`
- **CloudFront Distribution**: `E2SIS6PD5358OC`

### DynamoDB Tables

- `ghostatlas-encounters-dev`
- `ghostatlas-ratings-dev`
- `ghostatlas-verifications-dev`

### S3 Bucket

- `ghostatlas-media-dev-235494787608`

## Monitoring

### CloudWatch Logs

View Lambda function logs in AWS Console:
1. Go to CloudWatch → Log groups
2. Look for `/aws/lambda/ghostatlas-*-dev`

### CloudWatch Alarms

Alarms are configured for:
- Lambda error rates
- API Gateway 5xx errors
- DynamoDB throttling
- SQS Dead Letter Queue messages

SNS Topic: `ghostatlas-alarms-dev`

## Troubleshooting

### Common Issues

1. **Network Error**
   - Check internet connection
   - Verify API endpoint URL is correct
   - Check AWS service status

2. **404 Not Found**
   - Verify the encounter ID exists
   - Check if encounter is approved (for public endpoints)

3. **500 Server Error**
   - Check CloudWatch logs for Lambda errors
   - Verify DynamoDB tables exist
   - Check IAM permissions

4. **Timeout**
   - Check network speed
   - Verify Lambda function isn't cold starting
   - Check CloudWatch metrics for Lambda duration

### Debug Mode

Enable debug logging in `api_config.dart`:

```dart
static bool get showDebugInfo => true; // Force enable
```

## Next Steps

1. **Deploy to Staging**: Update staging URL in `api_config.dart` when ready
2. **Deploy to Production**: Update production URL when ready
3. **Add Analytics**: Integrate analytics for production environment
4. **Add Crash Reporting**: Enable crash reporting for non-local environments
5. **Performance Monitoring**: Add performance tracking for API calls

## Support

For issues or questions:
- Check CloudWatch logs for backend errors
- Review API Gateway metrics
- Test endpoints using curl or Postman
- Check Flutter console for client-side errors
