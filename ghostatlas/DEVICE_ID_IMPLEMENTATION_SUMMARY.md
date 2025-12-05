# Device ID & Public/Private Story Implementation

## Summary
Implemented anonymous device-based user identification with public/private story visibility control.

## Changes Made

### Frontend (Flutter)

#### 1. New Service: DeviceIdService
- **File**: `lib/services/device_id_service.dart`
- Generates unique UUID on first launch
- Persists in SharedPreferences
- No authentication required

#### 2. Updated Models
- **Encounter Model** (`lib/models/encounter.dart`):
  - Added `isPublic` field (bool)
  - Added `deviceId` field (String?)
  
- **EncounterSubmission Model** (`lib/models/encounter_submission.dart`):
  - Added `isPublic` field (bool, default: true)
  - Added `deviceId` field (String, required)

#### 3. Submit Story Screen Updates NEEDED
- Add public/private toggle switch
- Get deviceId from DeviceIdService
- Pass to EncounterSubmission

#### 4. API Service Updates NEEDED
- Include deviceId in all API requests
- Add `getMyStories(deviceId)` method

#### 5. Profile Tab Updates NEEDED
- Fetch stories by deviceId
- Show user's public and private stories
- Display stats based on user's stories

#### 6. Map Filtering NEEDED
- Filter `getEncounters` to only show `isPublic: true`

### Backend (AWS)

#### 1. DynamoDB Schema Updates NEEDED
- Add `isPublic` attribute (Boolean)
- Add `deviceId` attribute (String)
- Create GSI: `deviceId-submittedAt-index` for querying user stories

#### 2. New Lambda: getMyStories NEEDED
- Query encounters by deviceId
- Return both public and private stories
- Sort by submittedAt descending

#### 3. Update Existing Lambdas
- **submitEncounter**: Accept and store `isPublic` and `deviceId`
- **getEncounters**: Filter to only return `isPublic: true` stories
- **getAllEncounters**: Keep returning all (for admin)

#### 4. API Gateway Updates NEEDED
- Add route: `GET /encounters/my-stories?deviceId={deviceId}`

## Implementation Status

✅ DeviceIdService created
✅ Encounter model updated
✅ EncounterSubmission model updated
⏳ Submit screen UI (toggle switch)
⏳ API service updates
⏳ Profile tab updates
⏳ Backend schema and Lambdas
⏳ Deployment

## Next Steps

1. Add public/private toggle to submit_story_screen.dart
2. Update API service to use deviceId
3. Update backend DynamoDB schema
4. Create getMyStories Lambda
5. Update getEncounters to filter public stories
6. Update profile tab to show user's stories
7. Deploy and test

## User Experience

- **First Launch**: Device ID generated automatically
- **Submit Story**: Toggle "Make Public" (default: ON)
  - Public: Appears on map, can be ghostbusted
  - Private: Only in user's profile/stories tab
- **Profile**: Shows all user's stories (public + private)
- **Map**: Only shows public stories
- **No Login**: Zero friction, works immediately

## Privacy

- Device ID is anonymous (UUID)
- No personal information collected
- Stories tied to device only
- If app uninstalled, stories are "orphaned" but remain in system
