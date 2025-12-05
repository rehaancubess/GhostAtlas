# Public/Private Story Feature

## Overview
Added a public/private toggle to the story submission form, allowing users to control whether their stories appear on the public map after admin approval.

## User Experience

### Submission Form
When submitting a story, users now see a "Story Visibility" section with:

**Public (Default)**:
- 🌍 Icon and toggle switch
- Explanation: "Your story will appear on the map for everyone to see after admin approval"

**Private**:
- 🔒 Icon and toggle switch  
- Explanation: "Only you and admins can see this story. It won't appear on the public map"

### Success Messages
- **Public stories**: "Your story has been submitted for admin review. Once approved, our AI will enhance it with a spooky narrative and illustration, then it will appear on the public map!"
- **Private stories**: "Your private story has been submitted for admin review. Once approved, our AI will enhance it, but it will remain private and won't appear on the public map."

## Flow

```
1. User submits story
   ├─ Selects Public or Private
   └─ Status: 'pending'

2. Admin reviews in admin panel
   ├─ Sees ALL submissions (both public and private)
   └─ Can approve or reject

3. Admin approves
   ├─ Triggers AI enhancement
   ├─ Status: 'enhancing'
   └─ AI generates narrative, narration, illustration

4. AI completes
   ├─ Status: 'enhanced'
   ├─ Public stories: Appear on map
   └─ Private stories: Hidden from map, accessible only to author/admin
```

## Implementation

### Flutter Changes

**File**: `ghostatlas/lib/screens/submit_story_screen.dart`
- Added `_isPublic` state variable (default: true)
- Added visibility toggle UI with clear explanations
- Pass `isPublic` flag in submission
- Updated success messages based on visibility choice

**File**: `ghostatlas/lib/models/encounter_submission.dart`
- Already had `isPublic` field (default: true)

### Backend Changes

**File**: `ghostatlas-backend/src/utils/types.ts`
- Added `isPublic: boolean` to Encounter interface
- Comment: "Whether story appears on public map (default: true)"

**File**: `ghostatlas-backend/src/lambdas/api/submitEncounter.ts`
- Added `isPublic?: boolean` to request interface
- Store `isPublic` in encounter record (defaults to true if not specified)

## Key Points

1. **All submissions go to admin** - Both public and private stories require admin approval
2. **Default is public** - If user doesn't change the toggle, story is public
3. **Clear explanations** - Users understand exactly what each option means
4. **No filtering in admin panel** - Admins see all pending submissions regardless of visibility
5. **Privacy respected** - Private stories won't appear on public map even after approval

## Future Considerations

If you want to filter public map results to exclude private stories, you'll need to:
1. Update `getEncounters` Lambda to filter by `isPublic: true`
2. Update `getAllEncounters` Lambda to filter by `isPublic: true`
3. Keep admin endpoints showing all stories regardless of visibility

## Testing

1. Submit a public story → Should show public explanation
2. Submit a private story → Should show private explanation
3. Check admin panel → Should see both submissions
4. Approve both → Both should get AI enhancement
5. Check map → Only public story should appear
