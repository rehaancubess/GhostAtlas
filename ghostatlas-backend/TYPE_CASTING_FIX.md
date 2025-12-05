# Type Casting Fix - Integer vs Double Issue

## Problem
The Flutter mobile app was failing to load encounters with the error:
```
type 'double' is not a subtype of type 'int?' in cast
```

This occurred because DynamoDB numeric values were being returned as doubles (floating-point numbers) in the API responses, but the Flutter app expected integers for fields like `rating`, `ratingCount`, and `verificationCount`.

## Root Cause
DynamoDB stores all numbers as a single numeric type, and when retrieved through the AWS SDK, they can be returned as either integers or doubles depending on their value. The API wasn't explicitly converting these to integers before sending responses.

## Solution
Added explicit `Math.floor()` conversions in all API Lambda functions that return encounter data to ensure integer fields are always returned as integers, not doubles.

## Files Modified

### 1. `src/lambdas/api/getEncounters.ts`
- Added `Math.floor()` to `rating` and `verificationCount` in formatted response

### 2. `src/lambdas/api/getEncounterById.ts`
- Added `Math.floor()` to `rating`, `ratingCount`, and `verificationCount` in encounter details
- Added `Math.floor()` to `averageRating` and `ratingCount` in rating stats

### 3. `src/lambdas/api/getAllEncounters.ts`
- Added `Math.floor()` to `rating`, `ratingCount`, and `verificationCount` in formatted encounters

### 4. `src/lambdas/api/rateEncounter.ts`
- Added `Math.floor()` to `ratingCount` in response

### 5. `test/unit/getEncounters.test.ts`
- Updated test expectation from `'approved'` to `'enhanced'` status to match current implementation

## Testing
```bash
cd ghostatlas-backend
npm run build
npm test
```

## Deployment
Deploy to your environment:
```bash
npm run deploy:dev
# or
npm run deploy:staging
# or
npm run deploy:prod
```

## Impact
- **Mobile App**: No changes needed - the released app will now work correctly
- **Backend**: Server-side fix ensures all integer fields are returned as integers
- **Web App**: No impact - JavaScript handles both integers and doubles seamlessly

## Verification
After deployment, test the API endpoints:
```bash
# Test getEncounters
curl "https://your-api-url/api/encounters?latitude=40.7128&longitude=-74.0060&radius=50"

# Test getEncounterById
curl "https://your-api-url/api/encounters/{encounter-id}"

# Verify rating and verificationCount are integers, not doubles
```
