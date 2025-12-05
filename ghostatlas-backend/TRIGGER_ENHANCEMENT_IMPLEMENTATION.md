# Trigger Enhancement Endpoint Implementation

## Overview
Added a new API endpoint `/api/encounters/{id}/upload-complete` that triggers the AI enhancement pipeline for submitted encounters. This completes the submission flow by allowing the Flutter app to initiate AI processing after encounter creation.

## Problem Solved
Previously, the Flutter app had no way to trigger the AI enhancement pipeline after submitting an encounter. The `imageUploadComplete` Lambda only handled S3 events, not API calls. This meant:
- Encounters stayed in 'pending' status indefinitely
- No AI-generated narratives, narrations, or illustrations were created
- The enhancement pipeline was never triggered

## Solution

### New Lambda Function: `triggerEnhancement`

**File**: `ghostatlas-backend/src/lambdas/api/triggerEnhancement.ts`

**Functionality**:
1. Validates encounter ID from path parameters
2. Retrieves encounter from DynamoDB
3. Checks if already enhancing/enhanced (idempotent)
4. Updates encounter status to 'enhancing'
5. Sends message to SQS enhancement queue
6. Returns success response

**Key Features**:
- Idempotent: Safe to call multiple times
- Graceful handling of already-processed encounters
- Proper error handling and logging
- Integrates with existing enhancement orchestrator

### API Endpoint

**Route**: `PUT /api/encounters/{id}/upload-complete`

**Request**: No body required, just encounter ID in path

**Response**:
```json
{
  "message": "AI enhancement pipeline triggered",
  "encounterId": "01HQTEST123456789",
  "status": "enhancing"
}
```

### Infrastructure Changes

**Files Modified**:
1. `lib/constructs/lambda-functions.ts`
   - Added `triggerEnhancement` Lambda function
   - Configured with SQS queue URL environment variable
   - Granted necessary IAM permissions via `apiHandlerRole`

2. `lib/constructs/api-gateway.ts`
   - Added `upload-complete` resource under `encounters/{id}`
   - Configured PUT method with Lambda integration
   - Added to interface for type safety

3. `lib/ghostatlas-backend-stack.ts`
   - Passed `triggerEnhancement` function to API Gateway
   - Wired up all dependencies

4. `API_ENDPOINTS.md`
   - Documented new endpoint with examples
   - Explained idempotency and use cases

### Testing

**File**: `test/unit/triggerEnhancement.test.ts`

**Test Cases**:
- ✅ Triggers enhancement for pending encounter
- ✅ Returns success if already enhancing
- ✅ Returns success if already enhanced
- ✅ Returns 404 if encounter not found
- ✅ Returns 400 if encounter ID missing

## Complete Flow

### Without Images (Current Implementation)
```
1. Flutter app: POST /api/encounters
   → Creates encounter with imageCount: 0
   → Returns encounterId

2. Flutter app: PUT /api/encounters/{id}/upload-complete
   → Updates status to 'enhancing'
   → Sends SQS message

3. Enhancement Orchestrator (SQS trigger)
   → Generates narrative (Claude)
   → Generates narration (Polly)
   → Generates illustration (Titan)
   → Updates status to 'enhanced'
```

### With Images (Future/Optional)
```
1. Flutter app: POST /api/encounters
   → Creates encounter with imageCount: N
   → Returns encounterId + presigned URLs

2. Flutter app: Upload images to S3 URLs

3. Flutter app: PUT /api/encounters/{id}/upload-complete
   → Triggers enhancement pipeline
   → (Same as above)
```

## Deployment

### Prerequisites
- Existing infrastructure (DynamoDB, SQS, IAM roles)
- Enhancement orchestrator Lambda already deployed

### Deploy Command
```bash
cd ghostatlas-backend
npm run build
cdk deploy --all
```

### Verification
```bash
# Get API endpoint
aws cloudformation describe-stacks \
  --stack-name ghostatlas-backend-dev \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text

# Test endpoint
curl -X PUT \
  "https://{api-id}.execute-api.us-east-1.amazonaws.com/dev/api/encounters/{encounter-id}/upload-complete"
```

## Integration with Flutter App

The Flutter app now calls this endpoint in `api_service.dart`:

```dart
Future<String> submitEncounter(EncounterSubmission submission) async {
  // 1. Submit encounter
  final response = await _postWithRetry('/api/encounters', requestBody);
  final encounterId = responseData['encounterId'] as String;

  // 2. Trigger AI enhancement (NEW)
  await _notifyUploadComplete(encounterId);

  return encounterId;
}

Future<void> _notifyUploadComplete(String encounterId) async {
  await _putWithRetry('/api/encounters/$encounterId/upload-complete');
}
```

## Benefits

1. **Complete Flow**: Encounters now automatically enter the enhancement pipeline
2. **User Feedback**: App can show "AI is generating content" messages
3. **Idempotent**: Safe to retry if network fails
4. **Flexible**: Works with or without user-uploaded images
5. **Monitored**: CloudWatch logs track all enhancement triggers
6. **Testable**: Comprehensive unit tests ensure reliability

## Monitoring

### CloudWatch Logs
- Log Group: `/aws/lambda/ghostatlas-trigger-enhancement-{env}`
- Key Metrics: Invocations, Errors, Duration

### SQS Queue
- Queue: `ghostatlas-enhancement-queue-{env}`
- Monitor: Messages sent, processing time

### DynamoDB
- Table: `ghostatlas-encounters-{env}`
- Track: Status transitions (pending → enhancing → enhanced)

## Related Files
- `src/lambdas/api/triggerEnhancement.ts` - Lambda handler
- `test/unit/triggerEnhancement.test.ts` - Unit tests
- `lib/constructs/lambda-functions.ts` - Lambda configuration
- `lib/constructs/api-gateway.ts` - API endpoint definition
- `lib/ghostatlas-backend-stack.ts` - Stack wiring
- `API_ENDPOINTS.md` - API documentation
- `ghostatlas/lib/services/api_service.dart` - Flutter integration
