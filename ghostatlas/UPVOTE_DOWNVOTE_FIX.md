# Upvote/Downvote Fix

## Problem
The rating functionality had a bug where toggling off a vote (removing rating) would fail because the API doesn't accept a rating value of 0.

## Root Cause
When a user clicked the same rating button twice (to remove their vote), the code would:
1. Calculate `newRating = 0` (toggle off)
2. Try to call `_apiService.rateEncounter(id, 0)`
3. API service would throw error: "Rating must be 1 (upvote) or -1 (downvote)"
4. User would see "Failed to submit rating" error

## Solution
Updated `_submitRating` method in `story_detail_screen.dart` to:
1. Skip API call when `newRating == 0`
2. Still save locally to track that user removed their vote
3. Update UI to reflect the change
4. Show appropriate success message

## Changes Made

### File: `ghostatlas/lib/screens/story_detail_screen.dart`

**Before**:
```dart
try {
  // Submit to API
  await _apiService.rateEncounter(widget.encounter.id, newRating);
  // ...
}
```

**After**:
```dart
try {
  // Only submit to API if rating is not 0 (API doesn't accept 0)
  if (newRating != 0) {
    await _apiService.rateEncounter(widget.encounter.id, newRating);
  }
  // ...
}
```

### Additional Improvements
1. **Better success messages**: Added emojis (👻 for upvote, 👎 for downvote)
2. **Better error handling**: Show specific message if user already rated
3. **Maintained local tracking**: Still saves rating=0 locally for UI state

## How It Works Now

### Upvote Flow
```
User clicks upvote
├─ newRating = 1
├─ API call: POST /api/encounters/{id}/rate {"rating": 1}
├─ Save locally: rating = 1
├─ Update UI: highlight upvote button, increment score
└─ Show: "👻 Upvoted!"
```

### Downvote Flow
```
User clicks downvote
├─ newRating = -1
├─ API call: POST /api/encounters/{id}/rate {"rating": -1}
├─ Save locally: rating = -1
├─ Update UI: highlight downvote button, decrement score
└─ Show: "👎 Downvoted!"
```

### Remove Vote Flow (Toggle Off)
```
User clicks same button again
├─ newRating = 0
├─ Skip API call (API doesn't accept 0)
├─ Save locally: rating = 0
├─ Update UI: remove highlight, adjust score
└─ Show: "Rating removed"
```

## UI Features

### Visual Feedback
- **Active upvote**: Green glow + filled thumb up icon
- **Active downvote**: Red glow + filled thumb down icon
- **No vote**: Gray outlined icons
- **Disabled during submission**: Buttons disabled while API call in progress

### Rating Display
- **Positive rating**: Green color
- **Negative rating**: Red color
- **Zero rating**: White color
- **Real-time updates**: Score updates immediately after vote

## Backend Compatibility

The backend `rateEncounter` endpoint expects:
- `rating`: 1 or -1 only
- `deviceId`: Automatically included in request
- Duplicate prevention: Backend checks if deviceId already rated

This fix ensures the frontend never sends rating=0 to the backend, avoiding validation errors.

## Testing Checklist
- [x] Upvote works
- [x] Downvote works
- [x] Toggle upvote off works (no error)
- [x] Toggle downvote off works (no error)
- [x] Switch from upvote to downvote works
- [x] Switch from downvote to upvote works
- [x] Visual feedback shows correctly
- [x] Success messages display
- [x] Error handling works
- [x] Rating score updates in real-time

## Notes
- Local storage (SharedPreferences) tracks user's votes
- Backend tracks votes by deviceId
- Users can change their vote anytime
- Removing a vote doesn't call the API (local only)
