# Public/Private Stories with Conditional Fields

## Overview
Updated the story submission form to conditionally show/hide location and time fields based on whether the story is public or private.

## User Experience

### Story Type Toggle (Top of Form)
**Position**: First field in the form, before author name

**Public Stories** (Default):
- 🌍 Icon
- Text: "Public: Appears on Buster Map and Stories section after admin approval. Requires location and time."
- Shows: Location picker, time picker
- Validation: Location and time are required

**Private Stories**:
- 📖 Icon  
- Text: "Private: Only appears in Stories section after admin approval. No location or time needed."
- Hides: Location picker, time picker
- Validation: Location and time are NOT required

### Form Fields Order
1. **Story Type Toggle** (Public/Private)
2. **Author Name** (always shown)
3. **Location Picker** (only if public)
4. **Current Location Button** (only if public)
5. **Time Picker** (only if public)
6. **Story Text** (always shown)
7. **AI Illustration Info** (always shown)
8. **Submit Button** (always shown)

### Success Messages
- **Public**: "Your public story has been submitted for admin review. Once approved, our AI will enhance it with a spooky narrative and illustration, then it will appear on the Buster Map and Stories section!"
- **Private**: "Your private story has been submitted for admin review. Once approved, our AI will enhance it and it will appear in the Stories section only."

## Implementation

### Flutter Changes

**File**: `ghostatlas/lib/screens/submit_story_screen.dart`

1. **Moved toggle to top** - Story type selection is now the first field
2. **Conditional rendering** - Location and time fields only show for public stories:
   ```dart
   if (_isPublic) Container(...) // Location picker
   if (_isPublic) OutlinedButton(...) // Current location button
   if (_isPublic) Container(...) // Time picker
   ```
3. **Clear state on toggle** - When switching to private, location and time are cleared
4. **Conditional validation** - Only validates location/time for public stories
5. **Dummy values** - Private stories use `LatLng(0, 0)` and `DateTime.now()` as placeholders

### Backend Changes

**File**: `ghostatlas-backend/src/utils/validation.ts`

Updated `validateEncounterSubmission` function:
- Checks `isPublic` flag (defaults to true if not specified)
- Only validates `encounterTime` for public stories
- Only validates `location` for public stories
- Error messages clarify "required for public stories"

**File**: `ghostatlas-backend/src/utils/types.ts`
- `Encounter` interface includes `isPublic: boolean` field

**File**: `ghostatlas-backend/src/lambdas/api/submitEncounter.ts`
- Accepts `isPublic` in request
- Stores `isPublic` in encounter record

## Data Flow

### Public Story Submission
```
User fills form:
├─ Toggle: Public
├─ Name: "John Doe"
├─ Location: Selected on map
├─ Time: Selected date/time
└─ Story: "I saw a ghost..."

Backend receives:
├─ isPublic: true
├─ location: {lat: 37.7749, lng: -122.4194}
├─ encounterTime: "2024-01-15T20:30:00Z"
└─ Validates all fields

Result:
├─ Stored in DB with real location/time
├─ After approval: Appears on Buster Map
└─ After approval: Appears in Stories section
```

### Private Story Submission
```
User fills form:
├─ Toggle: Private
├─ Name: "Jane Smith"
├─ Location: Hidden (not shown)
├─ Time: Hidden (not shown)
└─ Story: "A spooky tale..."

Backend receives:
├─ isPublic: false
├─ location: {lat: 0, lng: 0} (dummy)
├─ encounterTime: current timestamp (dummy)
└─ Skips location/time validation

Result:
├─ Stored in DB with dummy location/time
├─ After approval: Does NOT appear on Buster Map
└─ After approval: Appears in Stories section only
```

## Key Points

1. **Conditional UI** - Location and time fields only appear for public stories
2. **Clear explanations** - Users understand what each type means
3. **Automatic cleanup** - Switching to private clears location/time
4. **Backend validation** - Respects isPublic flag, skips validation for private stories
5. **Dummy values** - Private stories use placeholder location/time (not displayed to users)
6. **Admin sees all** - Both public and private stories go to admin panel
7. **Map filtering** - Only public stories should appear on Buster Map (needs implementation in map queries)

## Future Implementation Needed

To complete the feature, update these endpoints to filter by `isPublic`:

1. **getEncounters** Lambda - Add filter: `isPublic = true`
2. **getAllEncounters** Lambda - Add filter: `isPublic = true`  
3. **Stories Tab** - Should show both public and private stories (no filter)

This ensures:
- Buster Map only shows public stories
- Stories section shows all approved stories (public + private)
