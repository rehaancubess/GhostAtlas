# Profile and Features TODO

## Issues to Fix

### 1. Profile Screen Cleanup
- [x] Remove "About" section (or replace with Privacy/Terms/Contact)
- [x] Remove "Notifications" (says coming soon)
- [x] Remove "Location Services" (says coming soon)
- [ ] Make "Your Paranormal Activity" dynamic (fetch real user stats)
- [ ] Add Privacy Policy link
- [ ] Add Terms of Use link
- [ ] Add Contact Us (email: rehaancubes@gmail.com)

### 2. Upvote/Downvote Functionality
- [ ] Fix rating API calls in story detail screen
- [ ] Ensure backend rateEncounter endpoint works
- [ ] Show visual feedback when voting
- [ ] Prevent duplicate votes (using deviceId)

### 3. Ghostbuster Mode API Fix
- [ ] Debug why API doesn't work when submitting verification
- [ ] Check verifyLocation endpoint
- [ ] Ensure proper error handling

### 4. Comments/Experiences Feature
- [ ] Add comments section to story detail screen
- [ ] Create backend endpoint for comments
- [ ] Show comments in both map and stories views
- [ ] Allow users to add their experience as a comment

## Implementation Plan

### Phase 1: Profile Screen (Priority: High)
1. Remove unnecessary settings items
2. Add Privacy Policy screen
3. Add Terms of Use screen
4. Add Contact Us functionality
5. Make stats dynamic (fetch from API)

### Phase 2: Voting (Priority: High)
1. Check existing rateEncounter implementation
2. Fix any API issues
3. Add visual feedback
4. Test duplicate prevention

### Phase 3: Ghostbuster Mode (Priority: Medium)
1. Debug verification submission
2. Fix API endpoint issues
3. Add better error messages

### Phase 4: Comments (Priority: Medium)
1. Design comment data model
2. Create backend endpoints
3. Add UI for comments
4. Integrate with story views

## Notes
- All changes should maintain the spooky theme
- Keep error handling consistent
- Test on both iOS and Android
