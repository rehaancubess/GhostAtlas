# Status Flow Update - Stories Only Appear After AI Enhancement

## Problem
Stories were appearing in the public listing immediately after admin approval, even though AI enhancement was still in progress. Users saw the original story text instead of the AI-enhanced version.

## Solution
Implemented a three-status flow where stories only appear in public listings after AI enhancement is complete.

## Status Flow

### Before (2 statuses)
```
pending → approved (visible immediately)
```
Problem: Stories visible before AI enhancement completes

### After (3 statuses)
```
pending → approved → enhanced (visible only when enhanced)
```
Solution: Stories only visible after AI enhancement completes

## Status Definitions

| Status | Description | Visible in Public Listing? | Admin Can See? |
|--------|-------------|---------------------------|----------------|
| `pending` | Submitted, awaiting admin review | ❌ No | ✅ Yes (Admin Panel) |
| `approved` | Admin approved, AI enhancement in progress | ❌ No | ✅ Yes (if queried by ID) |
| `enhanced` | AI enhancement complete | ✅ Yes | ✅ Yes |
| `rejected` | Admin rejected | ❌ No | ✅ Yes (Admin Panel) |
| `enhancement_failed` | AI enhancement failed | ❌ No | ✅ Yes (for debugging) |

## Changes Made

### 1. Type Definition
**File**: `src/utils/types.ts`

```typescript
// Before
export type EncounterStatus = 'pending' | 'approved' | 'rejected' | 'enhancement_failed';

// After
export type EncounterStatus = 'pending' | 'approved' | 'enhanced' | 'rejected' | 'enhancement_failed';
```

### 2. Enhancement Orchestrator
**File**: `src/lambdas/enhancement/enhancementOrchestrator.ts`

After AI enhancement completes, the orchestrator now sets status to `enhanced`:

```typescript
UpdateExpression:
  'SET #enhancedStory = :enhancedStory, ' +
  '#illustrationUrls = :illustrationUrls, ' +
  '#narrationUrl = :narrationUrl, ' +
  '#status = :status, ' +  // NEW: Set status to enhanced
  '#updatedAt = :updatedAt',
ExpressionAttributeValues: {
  ':enhancedStory': enhancedStory,
  ':illustrationUrls': illustrationUrls,
  ':narrationUrl': narrationUrl,
  ':status': 'enhanced',  // NEW: Mark as enhanced
  ':updatedAt': new Date().toISOString(),
}
```

### 3. Get All Encounters API
**File**: `src/lambdas/api/getAllEncounters.ts`

Changed filter to only return `enhanced` stories:

```typescript
// Before
FilterExpression: '#status = :approved',
ExpressionAttributeValues: {
  ':approved': 'approved',
}

// After
FilterExpression: '#status = :enhanced',
ExpressionAttributeValues: {
  ':enhanced': 'enhanced',
}
```

### 4. Get Encounters (Map View) API
**File**: `src/lambdas/api/getEncounters.ts`

Changed query to only return `enhanced` stories:

```typescript
// Before
KeyConditionExpression: '#status = :status',
ExpressionAttributeValues: {
  ':status': 'approved'
}

// After
KeyConditionExpression: '#status = :status',
ExpressionAttributeValues: {
  ':status': 'enhanced'
}
```

### 5. Get Encounter By ID API
**File**: `src/lambdas/api/getEncounterById.ts`

Updated to accept both `approved` and `enhanced` statuses (for edge cases):

```typescript
// Before
if (encounter.status !== 'approved') {
  return createErrorApiResponse(ErrorCode.FORBIDDEN, '...');
}

// After
if (encounter.status !== 'approved' && encounter.status !== 'enhanced') {
  return createErrorApiResponse(ErrorCode.FORBIDDEN, '...');
}
```

## Timeline

### User Submits Story
```
Status: pending
Visible: No
```

### Admin Approves (t=0s)
```
Status: approved
Visible: No (waiting for AI)
Enhancement pipeline triggered
```

### AI Enhancement Running (t=0-60s)
```
Status: approved
Visible: No
- Generating narrative (~10s)
- Generating illustrations (~45s)
- Generating narration (~10s)
```

### AI Enhancement Complete (t=60s)
```
Status: enhanced
Visible: Yes ✓
- Enhanced narrative ready
- 3-5 AI illustrations ready
- Voice narration ready
```

## Database Index Requirements

The `status-encounterTime-index` GSI must support the `enhanced` status:

```typescript
{
  IndexName: 'status-encounterTime-index',
  KeySchema: [
    { AttributeName: 'status', KeyType: 'HASH' },
    { AttributeName: 'encounterTime', KeyType: 'RANGE' }
  ]
}
```

This index already exists and will automatically work with the new `enhanced` status value.

## Testing

### Test the Complete Flow

1. **Submit a story**
   ```bash
   POST /api/encounters/submit
   ```
   - Verify status: `pending`
   - Verify NOT in public listing

2. **Approve the story**
   ```bash
   PUT /api/admin/encounters/{id}/approve
   ```
   - Verify status changes to: `approved`
   - Verify still NOT in public listing
   - Verify SQS message sent

3. **Wait 60 seconds**
   - Enhancement pipeline runs

4. **Check status**
   ```bash
   GET /api/encounters/{id}
   ```
   - Verify status: `enhanced`
   - Verify `enhancedStory` populated
   - Verify `illustrationUrls` has 3-5 URLs
   - Verify `narrationUrl` populated

5. **Check public listing**
   ```bash
   GET /api/encounters/all
   ```
   - Verify story NOW appears in listing
   - Verify all AI content present

### Test Edge Cases

1. **Direct link to approved-but-not-enhanced story**
   - Should return 200 (allowed by getEncounterById)
   - Frontend shows "Enhancement in Progress" banner

2. **Enhancement failure**
   - Status becomes: `enhancement_failed`
   - Story does NOT appear in public listing
   - Admin can see it for debugging

3. **Rejected story**
   - Status: `rejected`
   - Never appears in public listing

## Migration Notes

### For Existing Data

If you have existing stories with status `approved` that are already enhanced:

```sql
-- DynamoDB update (pseudo-code)
UPDATE encounters
SET status = 'enhanced'
WHERE status = 'approved'
  AND enhancedStory IS NOT NULL
  AND illustrationUrls IS NOT NULL
  AND narrationUrl IS NOT NULL
```

Or use a migration script:

```typescript
// Scan all approved encounters
// Check if they have AI content
// Update status to 'enhanced' if they do
```

### Deployment Order

1. Deploy backend changes (Lambda functions + types)
2. Run migration script (if needed)
3. Deploy frontend changes
4. Monitor CloudWatch logs for any issues

## Monitoring

### Key Metrics

- **Approval to Enhanced Time**: Should be ~60 seconds
- **Stories stuck in "approved"**: Should be 0 (or very few)
- **Enhancement failure rate**: Should be <5%

### CloudWatch Queries

```
# Count stories by status
fields status
| stats count() by status

# Find stories stuck in approved for >2 minutes
fields id, status, updatedAt
| filter status = "approved"
| filter @timestamp - updatedAt > 120000
```

## Rollback Plan

If issues arise, you can rollback by:

1. Revert Lambda code to previous version
2. Change API filters back to `approved`
3. Existing `enhanced` stories will still work (backward compatible)

The `enhanced` status is additive - it doesn't break existing functionality.

## Benefits

1. ✅ **No partial content** - Users only see fully enhanced stories
2. ✅ **Consistent experience** - All visible stories have AI content
3. ✅ **Clear status** - Easy to see what stage each story is in
4. ✅ **Better UX** - No confusion about missing AI content
5. ✅ **Easier debugging** - Can identify stuck stories

## Cost Impact

No additional cost - same AI generation happens, just different visibility timing.
