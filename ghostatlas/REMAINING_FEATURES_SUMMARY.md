# Remaining Features Summary

## Current Status

### ✅ Completed
1. Profile screen cleanup
2. Privacy Policy screen
3. Terms of Use screen
4. Contact Us functionality
5. Public/Private story submission
6. AI enhancement trigger fix
7. Conditional fields for public/private stories

### 🔧 Needs Implementation

## 1. Fix Upvote/Downvote Functionality

**Current Issue**: Rating buttons may not be working properly

**Files to Check/Fix**:
- `ghostatlas/lib/screens/story_detail_screen.dart` (972 lines)
- `ghostatlas/lib/services/rating_service.dart`
- `ghostatlas-backend/src/lambdas/api/rateEncounter.ts`

**Implementation Steps**:
1. Check if rating buttons exist in story_detail_screen.dart
2. Verify API call to rateEncounter endpoint
3. Ensure deviceId is passed correctly
4. Add visual feedback (button color change)
5. Test duplicate vote prevention
6. Update rating count in real-time

**Backend Check**:
- Verify rateEncounter Lambda works
- Check DynamoDB ratings table
- Ensure deviceId duplicate prevention works

---

## 2. Fix Ghostbuster Mode API

**Current Issue**: API doesn't work when submitting verification

**Files to Check/Fix**:
- `ghostatlas/lib/screens/ghostbuster_mode_screen.dart`
- `ghostatlas/lib/services/api_service.dart` (verifyEncounter method)
- `ghostatlas-backend/src/lambdas/api/verifyLocation.ts`

**Implementation Steps**:
1. Check verifyEncounter API call in ghostbuster_mode_screen.dart
2. Verify request format matches backend expectations
3. Add better error handling and messages
4. Test location distance validation
5. Test time matching logic

**Backend Check**:
- Verify verifyLocation Lambda works
- Check validation logic (100m distance, 2hr time window)
- Ensure DynamoDB verifications table updates

---

## 3. Add Comments/Experiences Feature

**Current Issue**: No way to add comments/experiences to stories

**New Feature Requirements**:
- Users can add their experience as a comment
- Comments appear in both map and stories views
- Comments show author name and timestamp
- Comments are tied to encounters

**Implementation Steps**:

### Backend (Priority: Create First)
1. Create comments table in DynamoDB
2. Create `submitComment` Lambda
3. Create `getComments` Lambda
4. Add API endpoints:
   - `POST /api/encounters/{id}/comments`
   - `GET /api/encounters/{id}/comments`

### Frontend
1. Add Comment model (`lib/models/comment.dart`)
2. Add API methods in `api_service.dart`:
   - `submitComment(encounterId, authorName, commentText)`
   - `getComments(encounterId)`
3. Update `story_detail_screen.dart`:
   - Add comments section below story
   - Add "Add Your Experience" button
   - Show list of comments
4. Update `story_card.dart`:
   - Show comment count badge

**Data Model**:
```typescript
interface Comment {
  id: string;
  encounterId: string;
  authorName: string;
  commentText: string;
  createdAt: string;
}
```

---

## 4. Make Profile Stats Dynamic

**Current Issue**: Profile shows mock data

**Files to Modify**:
- `ghostatlas/lib/screens/profile_tab.dart`
- `ghostatlas/lib/services/api_service.dart`
- Create new backend endpoint

**Implementation Steps**:

### Backend
1. Create `getUserStats` Lambda
2. Query encounters table by deviceId (need to add deviceId to encounters)
3. Count user's stories
4. Sum verifications
5. Calculate total rating
6. Add API endpoint: `GET /api/users/{deviceId}/stats`

### Frontend
1. Add `getUserStats` method to ApiService
2. Update `_loadUserData()` in profile_tab.dart
3. Fetch real stats using deviceId
4. Handle loading and error states

**Note**: Need to track deviceId with encounters for this to work

---

## Priority Order (Recommended)

1. **Comments Feature** (Most impactful, new functionality)
2. **Fix Upvote/Downvote** (Core feature, should work)
3. **Fix Ghostbuster Mode** (Core feature, should work)
4. **Dynamic Profile Stats** (Nice to have, requires backend changes)

---

## Quick Wins

If time is limited, focus on:
1. Fix upvote/downvote (likely small bug)
2. Fix Ghostbuster mode (likely small bug)
3. Add basic comments (can start simple)

---

## Notes

- All features should maintain spooky theme
- Error handling must be consistent
- Test on both iOS and Android
- Consider purging backend data if schema changes needed
